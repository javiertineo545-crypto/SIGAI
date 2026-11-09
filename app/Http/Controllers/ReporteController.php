<?php

namespace App\Http\Controllers;

use App\Models\Entrada;
use App\Models\Salida;
use App\Models\Asignacion;
use App\Models\Articulo;
use App\Models\ArticuloUnidad;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReporteController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:reportes.view')->only(['index', 'exportPdf']);
    }

    public function index()
    {
        return inertia('Reportes/Index');
    }

    public function exportPdf(Request $request)
    {
        $modulosString = $request->input('modulos', 'inventario');
        $modulos = explode(',', $modulosString);

        $fecha_inicio = $request->input('fecha_inicio');
        $fecha_fin = $request->input('fecha_fin');
        $color = $request->input('color', '#1e3a8a');

        $datos = [];
        
        $queryEntradas = Entrada::with(['proveedor', 'usuario']);
        $querySalidas = Salida::with(['usuario', 'detalles.articulo']);
        $queryAsignaciones = Asignacion::with(['articuloUnidad.articulo', 'personnel', 'usuario']);
        $queryArticulos = Articulo::with(['marca', 'categoria']);
        $queryUnidades = ArticuloUnidad::with(['articulo', 'estado', 'ubicacion']);
        
        $queryStockMinimo = Articulo::with(['marca', 'categoria'])
            ->whereColumn('stock', '<=', 'stock_minimo')
            ->orderBy('stock', 'asc');

        if ($fecha_inicio && $fecha_fin) {
            $queryEntradas->whereBetween('fecha', [$fecha_inicio, $fecha_fin]);
            $querySalidas->whereBetween('fecha', [$fecha_inicio, $fecha_fin]);
            $queryAsignaciones->whereBetween('fecha_asignacion', [$fecha_inicio, $fecha_fin]);
            $queryUnidades->whereBetween('fecha_adquisicion', [$fecha_inicio, $fecha_fin]);
        }

        if (in_array('inventario', $modulos)) {
            $datos['articulos'] = $queryArticulos->orderBy('nombre')->get();
        }
        if (in_array('stock_minimo', $modulos)) {
            $datos['stock_minimo'] = $queryStockMinimo->get();
        }
        if (in_array('unidades', $modulos)) {
            $datos['unidades'] = $queryUnidades->orderBy('identificador')->get();
        }
        if (in_array('entradas', $modulos)) {
            $datos['entradas'] = $queryEntradas->orderByDesc('fecha')->get();
        }
        if (in_array('salidas', $modulos)) {
            $datos['salidas'] = $querySalidas->orderByDesc('fecha')->get();
        }
        if (in_array('asignaciones', $modulos)) {
            $datos['asignaciones'] = $queryAsignaciones->orderByDesc('fecha_asignacion')->get();
        }

        $datos['modulos'] = $modulos;
        $datos['fecha_inicio'] = $fecha_inicio;
        $datos['fecha_fin'] = $fecha_fin;
        $datos['fecha_generacion'] = Carbon::now()->format('d/m/Y H:i A');
        $datos['color_tema'] = $color;

        $pdf = Pdf::loadView('reportes.pdf', $datos);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('reporte_inventario_' . date('Y-m-d_H-i') . '.pdf');
    }
}