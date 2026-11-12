<?php

namespace App\Http\Controllers;

use App\Models\Asignacion;
use App\Models\Articulo;
use App\Models\ArticuloUnidad;
use App\Models\Personnel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AsignacionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:asignaciones.view')->only(['index', 'show']);
        $this->middleware('permission:asignaciones.create')->only(['create', 'store']);
        $this->middleware('permission:asignaciones.edit')->only(['edit', 'update']);
        $this->middleware('permission:asignaciones.devolver')->only(['devolver']);
    }

    public function index(Request $request)
    {
        $asignaciones = Asignacion::with(['articulo.marca', 'articuloUnidad.articulo.marca', 'personnel', 'usuario'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('articulo', fn($q) => $q->where('nombre', 'like', "%{$search}%"))
                      ->orWhereHas('articuloUnidad.articulo', fn($q) => $q->where('nombre', 'like', "%{$search}%"))
                      ->orWhereHas('personnel', fn($q) => $q->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"));
            })
            ->orderByRaw("CASE WHEN estado = 'activa' THEN 1 ELSE 2 END") 
            ->orderByDesc('fecha_asignacion')->paginate(10)->withQueryString();

        $asignaciones->getCollection()->transform(function ($asignacion) {
            $nombreArticulo = $asignacion->articulo?->nombre ?? $asignacion->articuloUnidad?->articulo?->nombre ?? 'No disponible';
            $marca = $asignacion->articulo?->marca?->nombre ?? $asignacion->articuloUnidad?->articulo?->marca?->nombre ?? 'S/M';
            $modelo = $asignacion->articulo?->modelo ?? $asignacion->articuloUnidad?->articulo?->modelo ?? 'Consumible';

            return [
                'id' => $asignacion->id,
                'estado' => $asignacion->estado,
                'fecha_asignacion' => $asignacion->fecha_asignacion,
                'observaciones' => $asignacion->observaciones,
                'es_equipo' => $asignacion->articulo_unidad_id !== null,
                'articulo_nombre' => $nombreArticulo,
                'identificador' => $asignacion->articulo_unidad_id ? $asignacion->articuloUnidad->identificador : 'N/A',
                'serial' => $asignacion->articulo_unidad_id ? $asignacion->articuloUnidad->serial : 'N/A',
                'cantidad' => (int) $asignacion->cantidad,
                'marca' => $marca,
                'modelo' => $modelo,
                'trabajador_nombre' => trim(($asignacion->personnel?->first_name ?? '') . ' ' . ($asignacion->personnel?->last_name ?? '')) ?: 'No asignado',
                'trabajador_cedula' => $asignacion->personnel?->id_number ?? 'N/A',
            ];
        });

        return inertia('Asignaciones/Index', ['asignaciones' => $asignaciones, 'filters' => ['search' => $request->search]]);
    }

    public function create()
    {
        $articulos = Articulo::with('marca:id,nombre')->where('stock', '>', 0)->orderBy('nombre')->get();

        // FILTRO ESTRICTO: No asignados y No en salidas
        $unidades = ArticuloUnidad::with(['articulo:id,nombre,marca_id,modelo', 'articulo.marca:id,nombre'])
            ->whereHas('articulo', fn($q) => $q->where('control_individual', 1))
            ->whereDoesntHave('asignaciones', fn($q) => $q->where('estado', 'activa'))
            ->whereDoesntHave('salidasDetalle')
            ->get();

        $personnels = Personnel::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'id_number']);

        return inertia('Asignaciones/Create', compact('articulos', 'unidades', 'personnels'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'articulo_id'        => ['required', 'integer', 'exists:articulos,id'],
            'articulo_unidad_id' => ['nullable', 'integer', 'exists:articulo_unidades,id'],
            'cantidad'           => ['required', 'integer', 'gt:0'],
            'personnel_id'       => ['required', 'integer', 'exists:personnels,id'],
            'fecha_asignacion'   => ['required', 'date'],
            'condicion_entrega'  => ['nullable', 'string', 'max:255'],
            'observaciones'      => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data) {
            $articulo = Articulo::lockForUpdate()->findOrFail($data['articulo_id']);
            
            if ($articulo->control_individual) {
                if (empty($data['articulo_unidad_id'])) {
                    throw ValidationException::withMessages(['articulo_unidad_id' => 'Debes seleccionar el serial del equipo.']);
                }
                $unidad = ArticuloUnidad::lockForUpdate()->findOrFail($data['articulo_unidad_id']);
                
                // BARRERA DE SEGURIDAD EN EL BACKEND
                if ($unidad->salidasDetalle()->exists()) {
                    throw ValidationException::withMessages(['articulo_unidad_id' => "Este equipo ya está registrado en una salida."]);
                }
                if (Asignacion::where('articulo_unidad_id', $unidad->id)->where('estado', 'activa')->exists()) {
                    throw ValidationException::withMessages(['articulo_unidad_id' => 'Este equipo ya está asignado a otra persona.']);
                }

                Asignacion::create([
                    'articulo_id' => $articulo->id,
                    'articulo_unidad_id' => $unidad->id,
                    'cantidad' => 1,
                    'personnel_id' => $data['personnel_id'],
                    'usuario_id' => Auth::id(),
                    'fecha_asignacion' => $data['fecha_asignacion'],
                    'condicion_entrega' => $data['condicion_entrega'] ?? null,
                    'estado' => 'activa',
                    'observaciones' => $data['observaciones'] ?? null,
                ]);
            } else {
                $cantidad = (int) $data['cantidad'];
                if ((int) $articulo->stock < $cantidad) {
                    throw ValidationException::withMessages(['cantidad' => "Stock insuficiente."]);
                }
                Asignacion::create([
                    'articulo_id' => $articulo->id,
                    'articulo_unidad_id' => null,
                    'cantidad' => $cantidad,
                    'personnel_id' => $data['personnel_id'],
                    'usuario_id' => Auth::id(),
                    'fecha_asignacion' => $data['fecha_asignacion'],
                    'condicion_entrega' => $data['condicion_entrega'] ?? null,
                    'estado' => 'activa',
                    'observaciones' => $data['observaciones'] ?? null,
                ]);
                $articulo->decrement('stock', $cantidad);
            }
        });

        return redirect()->route('asignaciones.index')->with('success', 'Asignación registrada correctamente.');
    }

    public function devolver(Request $request, Asignacion $asignacion)
    {
        abort_if($asignacion->estado === 'devuelta', 400, 'Esta asignación ya fue devuelta.');
        abort_if(!$asignacion->articulo_unidad_id, 400, 'Los consumibles no se pueden devolver.');

        $request->validate([
            'fecha_devolucion' => ['required', 'date', 'after_or_equal:' . $asignacion->fecha_asignacion->toDateString()],
            'observaciones_devolucion' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($request, $asignacion) {
            $asignacion->update([
                'fecha_devolucion' => $request->fecha_devolucion,
                'estado' => 'devuelta',
                'observaciones' => trim($asignacion->observaciones . "\n[Devolución]: " . $request->observaciones_devolucion),
            ]);
        });

        return redirect()->back()->with('success', 'Devolución registrada correctamente.');
    }

    public function edit(Asignacion $asignacion)
    {
        abort_if($asignacion->estado === 'devuelta', 400, 'No se puede editar una asignación ya devuelta.');
        $articulos = Articulo::with('marca:id,nombre')->where('stock', '>', 0)->orderBy('nombre')->get();
        
        // Filtramos los disponibles, pero incluimos el equipo actual de esta asignación para que no desaparezca
        $unidades = ArticuloUnidad::with(['articulo:id,nombre,marca_id,modelo', 'articulo.marca:id,nombre'])
            ->whereHas('articulo', fn($q) => $q->where('control_individual', 1))
            ->where(function($query) use ($asignacion) {
                $query->whereDoesntHave('asignaciones', fn($q) => $q->where('estado', 'activa'))
                      ->whereDoesntHave('salidasDetalle');
                $query->orWhere('id', $asignacion->articulo_unidad_id);
            })->get();

        $personnels = Personnel::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'id_number']);

        return inertia('Asignaciones/Edit', compact('asignacion', 'articulos', 'unidades', 'personnels'));
    }

    public function update(Request $request, Asignacion $asignacion)
    {
        abort_if($asignacion->estado === 'devuelta', 400, 'No se puede editar.');
        $data = $request->validate([
            'articulo_id' => ['required', 'integer', 'exists:articulos,id'],
            'articulo_unidad_id' => ['nullable', 'integer', 'exists:articulo_unidades,id'],
            'cantidad' => ['required', 'integer', 'gt:0'],
            'personnel_id' => ['required', 'integer', 'exists:personnels,id'],
            'fecha_asignacion' => ['required', 'date'],
            'condicion_entrega' => ['nullable', 'string', 'max:255'],
            'observaciones' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data, $asignacion) {
            if (!$asignacion->articulo_unidad_id) {
                $articuloAnterior = Articulo::lockForUpdate()->find($asignacion->articulo_id);
                if ($articuloAnterior) $articuloAnterior->increment('stock', $asignacion->cantidad);
            }

            $articulo = Articulo::lockForUpdate()->findOrFail($data['articulo_id']);

            if ($articulo->control_individual) {
                if (empty($data['articulo_unidad_id'])) throw ValidationException::withMessages(['articulo_unidad_id' => 'Debes seleccionar el serial.']);
                $unidad = ArticuloUnidad::lockForUpdate()->findOrFail($data['articulo_unidad_id']);
                
                if ($unidad->salidasDetalle()->exists()) {
                    throw ValidationException::withMessages(['articulo_unidad_id' => "Este equipo ya está en una salida."]);
                }
                if (Asignacion::where('articulo_unidad_id', $unidad->id)->where('estado', 'activa')->where('id', '!=', $asignacion->id)->exists()) {
                    throw ValidationException::withMessages(['articulo_unidad_id' => 'Este equipo ya está asignado.']);
                }

                $asignacion->update([
                    'articulo_id' => $articulo->id,
                    'articulo_unidad_id' => $unidad->id,
                    'cantidad' => 1,
                    'personnel_id' => $data['personnel_id'],
                    'fecha_asignacion' => $data['fecha_asignacion'],
                    'condicion_entrega' => $data['condicion_entrega'] ?? null,
                    'observaciones' => $data['observaciones'] ?? null,
                ]);
            } else {
                $cantidad = (int) $data['cantidad'];
                if ((int) $articulo->stock < $cantidad) throw ValidationException::withMessages(['cantidad' => "Stock insuficiente."]);
                $asignacion->update([
                    'articulo_id' => $articulo->id,
                    'articulo_unidad_id' => null,
                    'cantidad' => $cantidad,
                    'personnel_id' => $data['personnel_id'],
                    'fecha_asignacion' => $data['fecha_asignacion'],
                    'condicion_entrega' => $data['condicion_entrega'] ?? null,
                    'observaciones' => $data['observaciones'] ?? null,
                ]);
                $articulo->decrement('stock', $cantidad);
            }
        });

        return redirect()->route('asignaciones.index')->with('success', 'Asignación actualizada correctamente.');
    }

    public function show(Asignacion $asignacion)
    {
        $asignacion->load(['articulo.marca', 'articuloUnidad.articulo.marca', 'personnel']);
        return inertia('Asignaciones/Show', ['asignacion' => $asignacion]);
    }
}