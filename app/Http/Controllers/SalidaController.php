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
        $this->middleware('permission:salidas.delete')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $salidas = Salida::query()
            ->with([
                'usuario.personnel',
                'detalles.articulo.marca',
                'detalles.articuloUnidad'
            ])
            ->withCount('detalles')
            ->withSum('detalles as total_unidades', 'cantidad')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('detalles.articulo', function ($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhere('modelo', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        $salidas->getCollection()->transform(function ($salida) {
            return [
                'id' => $salida->id,
                'fecha' => $salida->fecha,
                'motivo' => $salida->motivo,
                'observaciones' => $salida->observaciones,
                'usuario_name' => $salida->usuario?->name ?? 'Desconocido',
                'usuario_cedula' => $salida->usuario?->personnel?->id_number ?? 'N/A',
                'total_unidades' => $salida->total_unidades,
                'detalles' => $salida->detalles->map(function($detalle) {
                    return [
                        'id' => $detalle->id,
                        'cantidad' => $detalle->cantidad,
                        'articulo_nombre' => $detalle->articulo?->nombre ?? 'Artículo desconocido',
                        'marca' => $detalle->articulo?->marca?->nombre ?? 'S/M',
                        'modelo' => $detalle->articulo?->modelo ?? 'N/A',
                        'serial' => $detalle->articuloUnidad?->serial ?? 'N/A',
                        'identificador' => $detalle->articuloUnidad?->identificador ?? 'N/A',
                    ];
                })
            ];
        });

        return inertia('Salidas/Index', [
            'salidas' => $salidas,
            'filters' => ['search' => $request->search],
        ]);
    }

    public function create()
    {
        $articulos = Articulo::query()
            ->with(['marca:id,nombre', 'categoria:id,nombre', 'referencia:id,codigo'])
            ->where('stock', '>', 0)
            ->orderBy('nombre')
            ->get();

        $unidades = ArticuloUnidad::with([
            'articulo:id,nombre',
            'asignaciones' => function ($query) {
                $query->where('estado', 'activa')->with('personnel:id,first_name,last_name');
            }
        ])
        ->whereHas('articulo', function ($query) {
            $query->where('control_individual', 1);
        })
        ->get();

        return inertia('Salidas/Create', [
            'articulos' => $articulos,
            'unidades' => $unidades,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'motivo' => ['required', 'string', 'max:255'],
            'fecha' => ['required', 'date'],
            'observaciones' => ['nullable', 'string'],
            'detalles' => ['required', 'array', 'min:1'],
            'detalles.*.articulo_id' => ['required', 'integer', 'exists:articulos,id'],
            'detalles.*.cantidad' => ['required', 'numeric', 'gt:0'],
            'detalles.*.articulo_unidad_id' => ['nullable', 'integer', 'exists:articulo_unidades,id'],
        ]);

        DB::transaction(function () use ($data) {
            $salida = Salida::create([
                'usuario_id' => Auth::id(),
                'motivo' => $data['motivo'],
                'fecha' => $data['fecha'],
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            foreach ($data['detalles'] as $detalle) {
                $articulo = Articulo::query()->lockForUpdate()->findOrFail($detalle['articulo_id']);
                $cantidad = (float) $detalle['cantidad'];

                if ($articulo->control_individual) {
                    if (empty($detalle['articulo_unidad_id'])) {
                        throw ValidationException::withMessages([
                            'detalles' => "Debes seleccionar el serial para el artículo «{$articulo->nombre}».",
                        ]);
                    }

                    $unidad = ArticuloUnidad::lockForUpdate()->findOrFail($detalle['articulo_unidad_id']);
                    
                    if (Asignacion::where('articulo_unidad_id', $unidad->id)->where('estado', 'activa')->exists()) {
                        throw ValidationException::withMessages([
                            'detalles' => "El equipo con serial {$unidad->identificador} está asignado actualmente. Debe devolverlo primero.",
                        ]);
                    }

                    $salida->detalles()->create([
                        'articulo_id' => $articulo->id,
                        'articulo_unidad_id' => $unidad->id,
                        'cantidad' => 1,
                    ]);

                    $articulo->decrement('stock', 1);

                    $estadoBaja = EstadoArticulo::where('nombre', 'De Baja')->first() 
                               ?? EstadoArticulo::where('nombre', 'Inactivo')->first();
                    if ($estadoBaja) {
                        $unidad->update(['estado_id' => $estadoBaja->id]);
                    }

                } else {
                    if ((float) $articulo->stock < $cantidad) {
                        throw ValidationException::withMessages([
                            'detalles' => "Stock insuficiente para «{$articulo->nombre}». Stock actual: {$articulo->stock}.",
                        ]);
                    }

                    $salida->detalles()->create([
                        'articulo_id' => $articulo->id,
                        'articulo_unidad_id' => null,
                        'cantidad' => $cantidad,
                    ]);

                    $articulo->decrement('stock', $cantidad);
                }
            }
        });

        return redirect()->route('salidas.index')->with('success', 'Salida registrada correctamente.');
    }

    public function show(Salida $salida)
    {
        $salida->load([
            'usuario',
            'detalles.articulo.categoria',
            'detalles.articulo.marca',
            'detalles.articulo.referencia',
            'detalles.articuloUnidad',
        ]);

        return inertia('Salidas/Show', ['salida' => $salida]);
    }

    public function destroy(Salida $salida)
    {
        DB::transaction(function () use ($salida) {
            $salida->load('detalles.articuloUnidad');
            
            foreach ($salida->detalles as $detalle) {
                $articulo = Articulo::lockForUpdate()->find($detalle->articulo_id);
                
                if ($detalle->articulo_unidad_id) {
                    $estadoDisponible = EstadoArticulo::where('nombre', 'Disponible')->first();
                    if ($estadoDisponible) {
                        $detalle->articuloUnidad->update(['estado_id' => $estadoDisponible->id]);
                    }
                }

                if ($articulo) {
                    $articulo->increment('stock', $detalle->cantidad);
                }
            }

            $salida->delete();
        });

        return redirect()->route('salidas.index')->with('success', 'Salida anulada y stock devuelto correctamente.');
    }
}