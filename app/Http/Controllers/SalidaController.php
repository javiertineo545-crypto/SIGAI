<?php

namespace App\Http\Controllers;

use App\Models\Articulo;
use App\Models\ArticuloUnidad;
use App\Models\Asignacion;
use App\Models\EstadoArticulo;
use App\Models\Salida;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SalidaController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:salidas.view')->only(['index', 'show', 'showArticulo']);
        $this->middleware('permission:salidas.create')->only(['create', 'store']);
        $this->middleware('permission:salidas.edit')->only(['edit', 'update']);
        $this->middleware('permission:salidas.delete')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $salidas = Salida::query()
            ->with(['usuario.personnel', 'detalles.articulo.marca', 'detalles.articuloUnidad'])
            ->withCount('detalles')
            ->withSum('detalles as total_unidades', 'cantidad')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('detalles.articulo', function ($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")->orWhere('modelo', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('fecha')->orderByDesc('id')->paginate(10)->withQueryString();

        $salidas->getCollection()->transform(function ($salida) {
            return [
                'id' => $salida->id,
                'fecha' => $salida->fecha,
                'motivo' => $salida->motivo,
                'tipo_salida' => $salida->tipo_salida,
                'observaciones' => $salida->observaciones,
                'usuario_name' => $salida->usuario?->name ?? 'Desconocido',
                'usuario_cedula' => $salida->usuario?->personnel?->id_number ?? 'N/A',
                'total_unidades' => $salida->total_unidades,
                'detalles' => $salida->detalles->map(fn($d) => [
                    'id' => $d->id,
                    'cantidad' => (int) $d->cantidad,
                    'articulo_nombre' => $d->articulo?->nombre ?? 'Artículo desconocido',
                    'marca' => $d->articulo?->marca?->nombre ?? 'S/M',
                    'modelo' => $d->articulo?->modelo ?? 'N/A',
                    'serial' => $d->articuloUnidad?->serial ?? 'N/A',
                    'identificador' => $d->articuloUnidad?->identificador ?? 'N/A',
                ])
            ];
        });

        return inertia('Salidas/Index', ['salidas' => $salidas, 'filters' => ['search' => $request->search]]);
    }

    public function create()
    {
        $articulos = Articulo::with(['marca:id,nombre', 'categoria:id,nombre', 'referencia:id,codigo'])
            ->where('stock', '>', 0)->orderBy('nombre')->get();

        // REGLA ESTRICTA: Equipos que no estén asignados y que no estén ya en una salida
        $unidades = ArticuloUnidad::with(['articulo:id,nombre'])
            ->whereHas('articulo', fn($q) => $q->where('control_individual', 1))
            ->whereDoesntHave('asignaciones', fn($q) => $q->where('estado', 'activa'))
            ->whereDoesntHave('salidasDetalle') // <-- ESTO ES LA MAGIA
            ->get();

        return inertia('Salidas/Create', ['articulos' => $articulos, 'unidades' => $unidades]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'motivo' => ['required', 'string', 'max:255'],
            'tipo_salida' => ['nullable', 'in:traslado,desincorporacion'],
            'fecha' => ['required', 'date'],
            'observaciones' => ['nullable', 'string'],
            'detalles' => ['required', 'array', 'min:1'],
            'detalles.*.articulo_id' => ['required', 'integer', 'exists:articulos,id'],
            'detalles.*.cantidad' => ['required', 'integer', 'gt:0'],
            'detalles.*.articulo_unidad_id' => ['nullable', 'integer', 'exists:articulo_unidades,id'],
        ]);

        DB::transaction(function () use ($data) {
            $salida = Salida::create([
                'usuario_id' => Auth::id(),
                'motivo' => $data['motivo'],
                'tipo_salida' => $data['tipo_salida'] ?? 'desincorporacion',
                'fecha' => $data['fecha'],
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            $this->procesarDetalles($salida, $data['detalles'], $data['tipo_salida'] ?? 'desincorporacion');
        });

        return redirect()->route('salidas.index')->with('success', 'Salida registrada correctamente.');
    }

    public function edit(Salida $salida)
    {
        $salida->load(['detalles']);
        $articulos = Articulo::with(['marca:id,nombre'])->where('stock', '>', 0)->orderBy('nombre')->get();
        
        $unidades = ArticuloUnidad::with(['articulo:id,nombre'])
            ->whereHas('articulo', fn($q) => $q->where('control_individual', 1))
            ->where(function($query) use ($salida) {
                $query->whereDoesntHave('asignaciones', fn($q) => $q->where('estado', 'activa'))
                      ->whereDoesntHave('salidasDetalle');
                // Incluimos las unidades de esta misma salida para que no desaparezcan al editar
                $query->orWhereIn('id', $salida->detalles->pluck('articulo_unidad_id')->filter());
            })->get();

        return inertia('Salidas/Edit', ['salida' => $salida, 'articulos' => $articulos, 'unidades' => $unidades]);
    }

    public function update(Request $request, Salida $salida)
    {
        $data = $request->validate([
            'motivo' => ['required', 'string', 'max:255'],
            'tipo_salida' => ['nullable', 'in:traslado,desincorporacion'],
            'fecha' => ['required', 'date'],
            'observaciones' => ['nullable', 'string'],
            'detalles' => ['required', 'array', 'min:1'],
            'detalles.*.articulo_id' => ['required', 'integer', 'exists:articulos,id'],
            'detalles.*.cantidad' => ['required', 'integer', 'gt:0'],
            'detalles.*.articulo_unidad_id' => ['nullable', 'integer', 'exists:articulo_unidades,id'],
        ]);

        DB::transaction(function () use ($data, $salida) {
            $salida->load('detalles.articuloUnidad');
            
            foreach ($salida->detalles as $detalle) {
                $articulo = Articulo::lockForUpdate()->find($detalle->articulo_id);
                if ($articulo) $articulo->increment('stock', $detalle->cantidad);
            }

            $salida->detalles()->delete();
            $salida->update([
                'motivo' => $data['motivo'],
                'tipo_salida' => $data['tipo_salida'] ?? 'desincorporacion',
                'fecha' => $data['fecha'],
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            $this->procesarDetalles($salida, $data['detalles'], $data['tipo_salida'] ?? 'desincorporacion');
        });

        return redirect()->route('salidas.index')->with('success', 'Salida actualizada correctamente.');
    }

    public function show(Salida $salida)
    {
        $salida->load(['usuario.personnel', 'detalles.articulo.marca', 'detalles.articuloUnidad']);
        return inertia('Salidas/Show', ['salida' => $salida]);
    }

    public function destroy(Salida $salida)
    {
        DB::transaction(function () use ($salida) {
            $salida->load('detalles.articuloUnidad');
            foreach ($salida->detalles as $detalle) {
                $articulo = Articulo::lockForUpdate()->find($detalle->articulo_id);
                if ($articulo) $articulo->increment('stock', $detalle->cantidad);
            }
            $salida->delete();
        });

        return redirect()->route('salidas.index')->with('success', 'Salida eliminada correctamente.');
    }

    private function procesarDetalles($salida, $detalles, $tipoSalida)
    {
        foreach ($detalles as $detalle) {
            $articulo = Articulo::lockForUpdate()->findOrFail($detalle['articulo_id']);
            $cantidad = (int) $detalle['cantidad'];

            if ($articulo->control_individual) {
                if (empty($detalle['articulo_unidad_id'])) {
                    throw ValidationException::withMessages(['detalles' => "Debes seleccionar el serial para «{$articulo->nombre}»."]);
                }

                $unidad = ArticuloUnidad::lockForUpdate()->findOrFail($detalle['articulo_unidad_id']);
                
                // BARRERA DE SEGURIDAD DIRECTA
                if ($unidad->salidasDetalle()->exists()) {
                    throw ValidationException::withMessages(['detalles' => "El equipo {$unidad->identificador} ya fue registrado en una salida anterior."]);
                }
                if (Asignacion::where('articulo_unidad_id', $unidad->id)->where('estado', 'activa')->exists()) {
                    throw ValidationException::withMessages(['detalles' => "El equipo {$unidad->identificador} está asignado actualmente."]);
                }

                $salida->detalles()->create([
                    'articulo_id' => $articulo->id,
                    'articulo_unidad_id' => $unidad->id,
                    'cantidad' => 1,
                ]);
                $articulo->decrement('stock', 1);

            } else {
                if ((int) $articulo->stock < $cantidad) {
                    throw ValidationException::withMessages(['detalles' => "Stock insuficiente para «{$articulo->nombre}»."]);
                }
                $salida->detalles()->create([
                    'articulo_id' => $articulo->id,
                    'articulo_unidad_id' => null,
                    'cantidad' => $cantidad,
                ]);
                $articulo->decrement('stock', $cantidad);
            }
        }
    }
}