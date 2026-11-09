<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Inventario</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid {{ $color_tema }}; padding-bottom: 10px; }
        .header h1 { margin: 0; color: {{ $color_tema }}; font-size: 20px; }
        .header p { margin: 5px 0 0 0; color: #666; }
        .filters { margin-bottom: 15px; font-size: 12px; background: #f3f4f6; padding: 10px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; }
        th { background-color: {{ $color_tema }}; color: white; font-weight: bold; }
        .section-title { background-color: {{ $color_tema }}; color: white; padding: 5px; font-size: 14px; margin-top: 20px; margin-bottom: 10px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bg-red { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Reporte General de Inventario</h1>
        <p>Sistema SIGAI - FUNDACITE</p>
        <p>Generado el: {{ $fecha_generacion }}</p>
    </div>

    <div class="filters">
        <strong>Módulos incluidos:</strong> 
        {{ implode(', ', array_map('ucfirst', $modulos)) }} <br>
        <strong>Rango de fechas:</strong> 
        {{ $fecha_inicio ? $fecha_inicio : 'Todo el historial' }} al {{ $fecha_fin ? $fecha_fin : 'Presente' }}
    </div>

    @if(isset($stock_minimo) && $stock_minimo->count() > 0)
        <div class="section-title">Alertas de Stock Mínimo (Artículos por agotarse)</div>
        <table>
            <thead>
                <tr>
                    <th>Artículo</th>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th class="text-center">Stock Actual</th>
                    <th class="text-center">Stock Mínimo Requerido</th>
                </tr>
            </thead>
            <tbody>
                @foreach($stock_minimo as $art)
                    <tr>
                        <td>{{ $art->nombre }}</td>
                        <td>{{ $art->marca?->nombre ?? 'S/M' }}</td>
                        <td>{{ $art->categoria?->nombre ?? 'N/A' }}</td>
                        <td class="text-center bg-red">
                            <strong>{{ (int) $art->stock }}</strong>
                        </td>
                        <td class="text-center">{{ (int) $art->stock_minimo }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($articulos) && $articulos->count() > 0)
        <div class="section-title">Inventario Actual en Stock</div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Artículo</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Categoría</th>
                    <th class="text-center">Stock Actual</th>
                    <th class="text-center">Stock Mínimo</th>
                </tr>
            </thead>
            <tbody>
                @foreach($articulos as $art)
                    <tr>
                        <td>{{ $art->id }}</td>
                        <td>{{ $art->nombre }}</td>
                        <td>{{ $art->marca?->nombre ?? 'S/M' }}</td>
                        <td>{{ $art->modelo ?? 'N/A' }}</td>
                        <td>{{ $art->categoria?->nombre ?? 'N/A' }}</td>
                        <td class="text-center {{ $art->stock <= $art->stock_minimo ? 'bg-red' : '' }}">
                            <strong>{{ (int) $art->stock }}</strong>
                        </td>
                        <td class="text-center">{{ (int) $art->stock_minimo }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($unidades) && $unidades->count() > 0)
        <div class="section-title">Unidades Físicas (Equipos Serializados)</div>
        <table>
            <thead>
                <tr>
                    <th>Identificador</th>
                    <th>Serial</th>
                    <th>Artículo</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th class="text-center">F. Adquisición</th>
                </tr>
            </thead>
            <tbody>
                @foreach($unidades as $unidad)
                    <tr>
                        <td><strong>{{ $unidad->identificador }}</strong></td>
                        <td>{{ $unidad->serial ?? 'N/A' }}</td>
                        <td>{{ $unidad->articulo?->nombre ?? 'N/A' }}</td>
                        <td>{{ $unidad->ubicacion?->nombre ?? 'N/A' }}</td>
                        <td>{{ $unidad->estado?->nombre ?? 'N/A' }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($unidad->fecha_adquisicion)->format('d/m/Y') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($entradas) && $entradas->count() > 0)
        <div class="section-title">Historial de Entradas</div>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Documento</th>
                    <th>Proveedor</th>
                    <th>Registrado Por</th>
                    <th>Observaciones</th>
                </tr>
            </thead>
            <tbody>
                @foreach($entradas as $entrada)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($entrada->fecha)->format('d/m/Y') }}</td>
                        <td>{{ $entrada->numero_documento }}</td>
                        <td>{{ $entrada->proveedor?->nombre ?? 'N/A' }}</td>
                        <td>{{ $entrada->usuario?->name ?? 'N/A' }}</td>
                        <td>{{ $entrada->observaciones ?? 'Ninguna' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($salidas) && $salidas->count() > 0)
        <div class="section-title">Historial de Salidas</div>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Motivo</th>
                    <th>Artículos Retirados</th>
                    <th>Registrado Por</th>
                </tr>
            </thead>
            <tbody>
                @foreach($salidas as $salida)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($salida->fecha)->format('d/m/Y') }}</td>
                        <td>{{ $salida->motivo }}</td>
                        <td>
                            @foreach($salida->detalles as $detalle)
                                - {{ $detalle->articulo?->nombre }} (Cant: {{ (int)$detalle->cantidad }}) <br>
                            @endforeach
                        </td>
                        <td>{{ $salida->usuario?->name ?? 'N/A' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($asignaciones) && $asignaciones->count() > 0)
        <div class="section-title">Historial de Asignaciones</div>
        <table>
            <thead>
                <tr>
                    <th>Fecha Asig.</th>
                    <th>Artículo / Equipo</th>
                    <th>Serial</th>
                    <th>Trabajador</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($asignaciones as $asig)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($asig->fecha_asignacion)->format('d/m/Y') }}</td>
                        <td>{{ $asig->articuloUnidad?->articulo?->nombre ?? $asig->articulo?->nombre }}</td>
                        <td>{{ $asig->articuloUnidad?->serial ?? 'N/A' }}</td>
                        <td>{{ $asig->personnel?->first_name }} {{ $asig->personnel?->last_name }}</td>
                        <td>{{ ucfirst($asig->estado) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

</body>
</html>