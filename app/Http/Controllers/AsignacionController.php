<?php

namespace App\Http\Controllers;

use App\Models\Asignacion;
use App\Models\ArticuloUnidad;
use App\Models\EstadoArticulo;
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
        $asignaciones = Asignacion::with([
                'articuloUnidad.articulo.marca',
                'personnel',
                'usuario'
            ])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('articuloUnidad', function ($q) use ($search) {
                    $q->where('identificador', 'like', "%{$search}%");
                })->orWhereHas('personnel', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->orderByRaw("CASE WHEN estado = 'activa' THEN 1 ELSE 2 END") 
            ->orderByDesc('fecha_asignacion')
            ->paginate(10)
            ->withQueryString();

        $asignaciones->getCollection()->transform(function ($asignacion) {
            return [
                'id' => $asignacion->id,
                'estado' => $asignacion->estado,
                'fecha_asignacion' => $asignacion->fecha_asignacion,
                'observaciones' => $asignacion->observaciones,
                'articulo_nombre' => $asignacion->articuloUnidad?->articulo?->nombre ?? 'Artículo no disponible',
                'identificador' => $asignacion->articuloUnidad?->identificador ?? 'N/A',
                'serial' => $asignacion->articuloUnidad?->serial ?? 'N/A',
                'marca' => $asignacion->articuloUnidad?->articulo?->marca?->nombre ?? 'S/M',
                'modelo' => $asignacion->articuloUnidad?->articulo?->modelo ?? 'N/A',
                'trabajador_nombre' => trim(($asignacion->personnel?->first_name ?? '') . ' ' . ($asignacion->personnel?->last_name ?? '')) ?: 'No asignado',
                'trabajador_cedula' => $asignacion->personnel?->id_number ?? 'N/A',
            ];
        });

        return inertia('Asignaciones/Index', [
            'asignaciones' => $asignaciones,
            'filters' => ['search' => $request->search],
        ]);
    }

    public function create()
    {
        $unidades = ArticuloUnidad::with([
            'articulo:id,nombre,marca_id,modelo', 
            'articulo.marca:id,nombre',
            'asignaciones' => function ($query) {
                $query->where('estado', 'activa')->with('personnel:id,first_name,last_name');
            }
        ])
        ->whereHas('articulo', function ($query) {
            $query->where('control_individual', 1); 
        })
        ->get();

        $personnels = Personnel::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'id_number']);

        return inertia('Asignaciones/Create', [
            'unidades' => $unidades,
            'personnels' => $personnels,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'articulo_unidad_id' => ['required', 'integer', 'exists:articulo_unidades,id'],
            'personnel_id'       => ['required', 'integer', 'exists:personnels,id'],
            'fecha_asignacion'   => ['required', 'date'],
            'condicion_entrega'  => ['nullable', 'string', 'max:255'],
            'observaciones'      => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data) {
            $unidad = ArticuloUnidad::with('articulo')->lockForUpdate()->findOrFail($data['articulo_unidad_id']);
            
            if ($unidad->articulo->control_individual == 0) {
                throw ValidationException::withMessages([
                    'articulo_unidad_id' => "El artículo «{$unidad->articulo->nombre}» no es un equipo serializado.",
                ]);
            }

            if (Asignacion::where('articulo_unidad_id', $unidad->id)->where('estado', 'activa')->exists()) {
                throw ValidationException::withMessages(['articulo_unidad_id' => 'Este equipo ya está asignado a otra persona.']);
            }

            Asignacion::create([
                'articulo_unidad_id' => $unidad->id,
                'personnel_id'       => $data['personnel_id'],
                'usuario_id'         => Auth::id(),
                'fecha_asignacion'   => $data['fecha_asignacion'],
                'condicion_entrega'  => $data['condicion_entrega'] ?? null,
                'estado'             => 'activa',
                'observaciones'      => $data['observaciones'] ?? null,
            ]);

            $estadoAsignado = EstadoArticulo::where('nombre', 'Asignado')->first();
            if ($estadoAsignado) {
                $unidad->update(['estado_id' => $estadoAsignado->id]);
            }
        });

        return redirect()->route('asignaciones.index')->with('success', 'Equipo asignado correctamente.');
    }

    public function edit(Asignacion $asignacion)
    {
        abort_if($asignacion->estado === 'devuelta', 400, 'No se puede editar una asignación ya devuelta.');

        $unidades = ArticuloUnidad::with([
            'articulo:id,nombre,marca_id,modelo', 
            'articulo.marca:id,nombre',
            'asignaciones' => function ($query) {
                $query->where('estado', 'activa')->with('personnel:id,first_name,last_name');
            }
        ])
        ->whereHas('articulo', function ($query) {
            $query->where('control_individual', 1);
        })
        ->get();

        $personnels = Personnel::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'id_number']);
        
        $asignacion->load('articuloUnidad');

        return inertia('Asignaciones/Edit', [
            'asignacion' => $asignacion,
            'unidades' => $unidades,
            'personnels' => $personnels,
        ]);
    }

    public function update(Request $request, Asignacion $asignacion)
    {
        abort_if($asignacion->estado === 'devuelta', 400, 'No se puede editar una asignación ya devuelta.');

        $data = $request->validate([
            'articulo_unidad_id' => ['required', 'integer', 'exists:articulo_unidades,id'],
            'personnel_id'       => ['required', 'integer', 'exists:personnels,id'],
            'fecha_asignacion'   => ['required', 'date'],
            'condicion_entrega'  => ['nullable', 'string', 'max:255'],
            'observaciones'      => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data, $asignacion) {
            $equipoAnteriorId = $asignacion->articulo_unidad_id;
            $equipoNuevoId = $data['articulo_unidad_id'];

            if ($equipoAnteriorId != $equipoNuevoId) {
                $unidadAnterior = ArticuloUnidad::lockForUpdate()->find($equipoAnteriorId);
                $unidadNueva = ArticuloUnidad::with('articulo')->lockForUpdate()->findOrFail($equipoNuevoId);

                if (Asignacion::where('articulo_unidad_id', $unidadNueva->id)->where('estado', 'activa')->exists()) {
                    throw ValidationException::withMessages(['articulo_unidad_id' => 'El nuevo equipo ya está asignado a otra persona.']);
                }

                $estadoDisponible = EstadoArticulo::where('nombre', 'Disponible')->first();
                if ($estadoDisponible && $unidadAnterior) {
                    $unidadAnterior->update(['estado_id' => $estadoDisponible->id]);
                }

                $estadoAsignado = EstadoArticulo::where('nombre', 'Asignado')->first();
                if ($estadoAsignado) {
                    $unidadNueva->update(['estado_id' => $estadoAsignado->id]);
                }
            }

            $asignacion->update([
                'articulo_unidad_id' => $data['articulo_unidad_id'],
                'personnel_id'       => $data['personnel_id'],
                'fecha_asignacion'   => $data['fecha_asignacion'],
                'condicion_entrega'  => $data['condicion_entrega'] ?? null,
                'observaciones'      => $data['observaciones'] ?? null,
            ]);
        });

        return redirect()->route('asignaciones.index')->with('success', 'Asignación actualizada correctamente.');
    }

    public function show(Asignacion $asignacion)
    {
        $asignacion->load([
            'articuloUnidad.articulo.marca', 
            'personnel'
        ]);
        
        return inertia('Asignaciones/Show', [
            'asignacion' => [
                'id' => $asignacion->id,
                'fecha_asignacion' => $asignacion->fecha_asignacion,
                'estado' => $asignacion->estado,
                'observaciones' => $asignacion->observaciones,
                'articulo_nombre' => $asignacion->articuloUnidad?->articulo?->nombre ?? 'Artículo no encontrado',
                'identificador' => $asignacion->articuloUnidad?->identificador ?? 'N/A',
                'serial' => $asignacion->articuloUnidad?->serial ?? 'N/A',
                'marca' => $asignacion->articuloUnidad?->articulo?->marca?->nombre ?? 'S/M',
                'modelo' => $asignacion->articuloUnidad?->articulo?->modelo ?? 'N/A',
                'trabajador_nombre' => trim(($asignacion->personnel?->first_name ?? '') . ' ' . ($asignacion->personnel?->last_name ?? '')) ?: 'No asignado',
                'trabajador_cedula' => $asignacion->personnel?->id_number ?? 'N/A',
            ]
        ]);
    }

    public function devolver(Request $request, Asignacion $asignacion)
    {
        abort_if($asignacion->estado === 'devuelta', 400, 'Esta asignación ya fue devuelta.');

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

            $unidad = $asignacion->articuloUnidad;
            $estadoDisponible = EstadoArticulo::where('nombre', 'Disponible')->first();
            if ($estadoDisponible && $unidad) {
                $unidad->update(['estado_id' => $estadoDisponible->id]);
            }
        });

        return redirect()->back()->with('success', 'Devolución registrada correctamente.');
    }
}