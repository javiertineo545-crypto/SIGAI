<?php

namespace App\Http\Controllers;

use App\Models\Asignacion;
use App\Models\Articulo;
use App\Models\ArticuloUnidad;
use App\Models\Personnel;
use App\Models\Ubicacion;
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
    $asignaciones = Asignacion::with(['articulo.marca', 'articuloUnidad.articulo.marca', 'personnel', 'usuario', 'ubicacionDestino'])
        ->when($request->search, function ($query, $search) {
            $query->whereHas('articulo', fn($q) => $q->where('nombre', 'like', "%{$search}%"))
                  ->orWhereHas('articuloUnidad.articulo', fn($q) => $q->where('nombre', 'like', "%{$search}%"))
                  ->orWhereHas('personnel', fn($q) => $q->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"));
        })
        ->orderByRaw("CASE WHEN estado = 'activa' THEN 1 ELSE 2 END")
        ->orderByDesc('fecha_asignacion')
        ->paginate(10)
        ->withQueryString();

    $asignaciones->getCollection()->transform(function ($asignacion) {
        $nombreArticulo = $asignacion->articulo?->nombre ?? $asignacion->articuloUnidad?->articulo?->nombre ?? 'No disponible';
        $marca = $asignacion->articulo?->marca?->nombre ?? $asignacion->articuloUnidad?->articulo?->marca?->nombre ?? 'S/M';
        $modelo = $asignacion->articulo?->modelo ?? $asignacion->articuloUnidad?->articulo?->modelo ?? 'Consumible';

        return [
            'id' => $asignacion->id,
            'estado' => $asignacion->estado,
            'fecha_asignacion' => $asignacion->fecha_asignacion ? $asignacion->fecha_asignacion->format('Y-m-d') : null,
            'fecha_devolucion' => $asignacion->fecha_devolucion ? $asignacion->fecha_devolucion->format('Y-m-d') : null,
            'fecha_estimada_devolucion' => $asignacion->fecha_estimada_devolucion ? $asignacion->fecha_estimada_devolucion->format('Y-m-d') : null,
            'es_tiempo_indefinido' => $asignacion->es_tiempo_indefinido,
            'observaciones' => $asignacion->observaciones,
            'condicion_entrega' => $asignacion->condicion_entrega,
            'es_equipo' => $asignacion->articulo_unidad_id !== null,
            'articulo_nombre' => $nombreArticulo,
            'identificador' => $asignacion->articulo_unidad_id ? $asignacion->articuloUnidad->identificador : 'N/A',
            'serial' => $asignacion->articulo_unidad_id ? $asignacion->articuloUnidad->serial : 'N/A',
            'cantidad' => (int) $asignacion->cantidad,
            'marca' => $marca,
            'modelo' => $modelo,
            'tipo_asignacion' => $asignacion->tipo_asignacion,
            'ubicacion_destino' => $asignacion->ubicacionDestino?->nombre ?? 'No especificada',
            'trabajador_nombre' => trim(($asignacion->personnel?->first_name ?? '') . ' ' . ($asignacion->personnel?->last_name ?? '')) ?: 'No asignado',
            'trabajador_cedula' => $asignacion->personnel?->id_number ?? 'N/A',
        ];
    });

    // Enviamos la lista de trabajadores para el modal de reasignación
    $personnels = Personnel::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'id_number']);
    $ubicaciones= Ubicacion::where('estado', true)->orderBy('nombre')->get(['id', 'nombre']);

    return inertia('Asignaciones/Index', [
        'asignaciones' => $asignaciones, 
        'filters' => ['search' => $request->search],
        'personnels' => $personnels,
        'ubicaciones' => $ubicaciones
    ]);
}

public function reasignar(Request $request, Asignacion $asignacion)
{
    // Verificamos que la asignación esté activa y sea un equipo serializado
    abort_if($asignacion->estado !== 'activa', 400, 'Solo se pueden reasignar equipos activos.');
    abort_if(!$asignacion->articulo_unidad_id, 400, 'Solo se pueden reasignar equipos serializados.');

    // Validamos TODOS los campos, incluyendo ubicacion_destino_id
    $data = $request->validate([
        'new_personnel_id' => ['required', 'integer', 'exists:personnels,id'],
        'fecha_reasignacion' => ['required', 'date', 'after_or_equal:' . $asignacion->fecha_asignacion->toDateString()],
        'ubicacion_destino_id' => ['required', 'integer', 'exists:ubicaciones,id'], // <-- ESTA LÍNEA FALTABA
        'observaciones_reasignacion' => ['nullable', 'string'],
    ]);

    DB::transaction(function () use ($data, $asignacion) {
        // 1. Cerramos la asignación actual
        $asignacion->update([
            'estado' => 'devuelta',
            'fecha_devolucion' => $data['fecha_reasignacion'],
            'observaciones' => trim($asignacion->observaciones . "\n[Reasignación]: Equipo trasladado a otro trabajador. " . ($data['observaciones_reasignacion'] ?? '')),
        ]);

        // 2. Actualizamos la ubicación física del equipo
        if ($asignacion->articuloUnidad) {
            $asignacion->articuloUnidad->update([
                'ubicacion_id' => $data['ubicacion_destino_id']
            ]);
        }

        // 3. Creamos la nueva asignación para el nuevo trabajador
        Asignacion::create([
            'articulo_id' => $asignacion->articulo_id,
            'articulo_unidad_id' => $asignacion->articulo_unidad_id,
            'cantidad' => $asignacion->cantidad,
            'personnel_id' => $data['new_personnel_id'],
            'usuario_id' => Auth::id(),
            'fecha_asignacion' => $data['fecha_reasignacion'],
            'tipo_asignacion' => 'traslado', 
            'ubicacion_destino_id' => $data['ubicacion_destino_id'], // <-- AHORA SÍ EXISTE
            'condicion_entrega' => $asignacion->condicion_entrega,
            'es_tiempo_indefinido' => $asignacion->es_tiempo_indefinido,
            'fecha_estimada_devolucion' => $asignacion->fecha_estimada_devolucion,
            'estado' => 'activa',
            'observaciones' => 'Reasignado desde la asignación #' . $asignacion->id,
        ]);
    });

    return redirect()->back()->with('success', 'Equipo reasignado al nuevo trabajador correctamente.');
}

    public function create()
    {
        $articulos = Articulo::with('marca:id,nombre')->where('stock', '>', 0)->orderBy('nombre')->get();
        
        $unidades = ArticuloUnidad::with(['articulo:id,nombre,marca_id,modelo', 'articulo.marca:id,nombre'])
            ->whereHas('articulo', fn($q) => $q->where('control_individual', 1))
            ->whereDoesntHave('asignaciones', fn($q) => $q->where('estado', 'activa'))
            ->whereDoesntHave('salidasDetalle')
            ->get();
            
        $personnels = Personnel::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'id_number']);
        $ubicaciones = Ubicacion::where('estado', true)->orderBy('nombre')->get(['id', 'nombre']);

        return inertia('Asignaciones/Create', compact('articulos', 'unidades', 'personnels', 'ubicaciones'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'articulo_id' => ['required', 'integer', 'exists:articulos,id'],
            'articulo_unidad_id' => ['nullable', 'integer', 'exists:articulo_unidades,id'],
            'cantidad' => ['required', 'integer', 'gt:0'],
            'personnel_id' => ['required', 'integer', 'exists:personnels,id'],
            'fecha_asignacion' => ['required', 'date'],
            'tipo_asignacion' => ['required', 'in:prestamo,traslado,guarda_custodia'],
            'ubicacion_destino_id' => ['nullable', 'integer', 'exists:ubicaciones,id'],
            'condicion_entrega' => ['nullable', 'string', 'max:255'],
            'observaciones' => ['nullable', 'string'],
            'es_tiempo_indefinido' => ['boolean'],
            'fecha_estimada_devolucion' => ['nullable', 'date', 'after_or_equal:fecha_asignacion'],
        ]);

        DB::transaction(function () use ($data) {
            $articulo = Articulo::lockForUpdate()->findOrFail($data['articulo_id']);
            
            $esIndefinido = ($data['tipo_asignacion'] === 'prestamo') ? ($data['es_tiempo_indefinido'] ?? false) : true;
            $fechaEstimada = ($data['tipo_asignacion'] === 'prestamo' && !$esIndefinido) ? $data['fecha_estimada_devolucion'] : null;

            if ($articulo->control_individual) {
                if (empty($data['articulo_unidad_id'])) {
                    throw ValidationException::withMessages(['articulo_unidad_id' => 'Debes seleccionar el serial del equipo.']);
                }

                $unidad = ArticuloUnidad::lockForUpdate()->findOrFail($data['articulo_unidad_id']);

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
                    'tipo_asignacion' => $data['tipo_asignacion'],
                    'ubicacion_destino_id' => $data['ubicacion_destino_id'] ?? null,
                    'condicion_entrega' => $data['condicion_entrega'] ?? null,
                    'es_tiempo_indefinido' => $esIndefinido,
                    'fecha_estimada_devolucion' => $fechaEstimada,
                    'estado' => 'activa',
                    'observaciones' => $data['observaciones'] ?? null,
                ]);

                if ($data['tipo_asignacion'] === 'traslado' && !empty($data['ubicacion_destino_id'])) {
                    $unidad->update(['ubicacion_id' => $data['ubicacion_destino_id']]);
                }
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
                    'tipo_asignacion' => $data['tipo_asignacion'],
                    'ubicacion_destino_id' => $data['ubicacion_destino_id'] ?? null,
                    'condicion_entrega' => $data['condicion_entrega'] ?? null,
                    'es_tiempo_indefinido' => $esIndefinido,
                    'fecha_estimada_devolucion' => $fechaEstimada,
                    'estado' => 'activa',
                    'observaciones' => $data['observaciones'] ?? null,
                ]);

                $articulo->decrement('stock', $cantidad);
            }
        });

        return redirect('/asignaciones')->with('success', 'Asignación registrada correctamente.');
    }

    public function edit(Asignacion $asignacion)
    {
        abort_if($asignacion->estado === 'devuelta', 400, 'No se puede editar una asignación ya devuelta.');

        $articulos = Articulo::with('marca:id,nombre')->where('stock', '>', 0)->orderBy('nombre')->get();
        
        $unidades = ArticuloUnidad::with(['articulo:id,nombre,marca_id,modelo', 'articulo.marca:id,nombre'])
            ->whereHas('articulo', fn($q) => $q->where('control_individual', 1))
            ->where(function($query) use ($asignacion) {
                $query->whereDoesntHave('asignaciones', fn($q) => $q->where('estado', 'activa'))
                      ->whereDoesntHave('salidasDetalle');
                $query->orWhere('id', $asignacion->articulo_unidad_id);
            })->get();

        $personnels = Personnel::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'id_number']);
        $ubicaciones = Ubicacion::where('estado', true)->orderBy('nombre')->get(['id', 'nombre']);

        return inertia('Asignaciones/Edit', compact('asignacion', 'articulos', 'unidades', 'personnels', 'ubicaciones'));
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
            'tipo_asignacion' => ['required', 'in:prestamo,traslado,guarda_custodia'],
            'ubicacion_destino_id' => ['nullable', 'integer', 'exists:ubicaciones,id'],
            'condicion_entrega' => ['nullable', 'string', 'max:255'],
            'observaciones' => ['nullable', 'string'],
            'es_tiempo_indefinido' => ['boolean'],
            'fecha_estimada_devolucion' => ['nullable', 'date', 'after_or_equal:fecha_asignacion'],
        ]);

        DB::transaction(function () use ($data, $asignacion) {
            $esIndefinido = ($data['tipo_asignacion'] === 'prestamo') ? ($data['es_tiempo_indefinido'] ?? false) : true;
            $fechaEstimada = ($data['tipo_asignacion'] === 'prestamo' && !$esIndefinido) ? $data['fecha_estimada_devolucion'] : null;

            if (!$asignacion->articulo_unidad_id) {
                $articuloAnterior = Articulo::lockForUpdate()->find($asignacion->articulo_id);
                if ($articuloAnterior) $articuloAnterior->increment('stock', $asignacion->cantidad);
            }

            $articulo = Articulo::lockForUpdate()->findOrFail($data['articulo_id']);

            if ($articulo->control_individual) {
                if (empty($data['articulo_unidad_id'])) throw ValidationException::withMessages(['articulo_unidad_id' => 'Debes seleccionar el serial.']);

                $unidad = ArticuloUnidad::lockForUpdate()->findOrFail($data['articulo_unidad_id']);

                if ($unidad->salidasDetalle()->exists()) throw ValidationException::withMessages(['articulo_unidad_id' => "Equipo en salida."]);

                if (Asignacion::where('articulo_unidad_id', $unidad->id)->where('estado', 'activa')->where('id', '!=', $asignacion->id)->exists()) throw ValidationException::withMessages(['articulo_unidad_id' => 'Equipo ya asignado.']);

                $asignacion->update([
                    'articulo_id' => $articulo->id, 
                    'articulo_unidad_id' => $unidad->id, 
                    'cantidad' => 1,
                    'personnel_id' => $data['personnel_id'], 
                    'fecha_asignacion' => $data['fecha_asignacion'],
                    'tipo_asignacion' => $data['tipo_asignacion'], 
                    'ubicacion_destino_id' => $data['ubicacion_destino_id'] ?? null,
                    'condicion_entrega' => $data['condicion_entrega'] ?? null, 
                    'observaciones' => $data['observaciones'] ?? null,
                    'es_tiempo_indefinido' => $esIndefinido,
                    'fecha_estimada_devolucion' => $fechaEstimada,
                ]);

                if ($data['tipo_asignacion'] === 'traslado' && !empty($data['ubicacion_destino_id'])) {
                    $unidad->update(['ubicacion_id' => $data['ubicacion_destino_id']]);
                }
            } else {
                $cantidad = (int) $data['cantidad'];
                if ((int) $articulo->stock < $cantidad) throw ValidationException::withMessages(['cantidad' => "Stock insuficiente."]);

                $asignacion->update([
                    'articulo_id' => $articulo->id, 
                    'articulo_unidad_id' => null, 
                    'cantidad' => $cantidad,
                    'personnel_id' => $data['personnel_id'], 
                    'fecha_asignacion' => $data['fecha_asignacion'],
                    'tipo_asignacion' => $data['tipo_asignacion'], 
                    'ubicacion_destino_id' => $data['ubicacion_destino_id'] ?? null,
                    'condicion_entrega' => $data['condicion_entrega'] ?? null, 
                    'observaciones' => $data['observaciones'] ?? null,
                    'es_tiempo_indefinido' => $esIndefinido,
                    'fecha_estimada_devolucion' => $fechaEstimada,
                ]);

                $articulo->decrement('stock', $cantidad);
            }
        });

        return redirect('/asignaciones')->with('success', 'Asignación actualizada correctamente.');
    }

    public function devolver(Request $request, Asignacion $asignacion)
    {
        abort_if(!in_array($asignacion->tipo_asignacion, ['prestamo', 'guarda_custodia']), 400, 'Solo Préstamos o Guarda/Custodia se pueden devolver.');
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
        });

        return redirect()->back()->with('success', 'Devolución registrada correctamente.');
    }

    public function show(Asignacion $asignacion)
    {
        $asignacion->load(['articulo.marca', 'articuloUnidad.articulo.marca', 'personnel', 'ubicacionDestino']);
        return inertia('Asignaciones/Show', ['asignacion' => $asignacion]);
    }
}