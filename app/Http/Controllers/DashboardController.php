<?php

namespace App\Http\Controllers;

use App\Models\Articulo;
use App\Models\ArticuloUnidad;
use App\Models\Asignacion;
use App\Models\Entrada;
use App\Models\Salida;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $totalArticulos = Articulo::count();
        $totalUnidades = ArticuloUnidad::count();
        $asignacionesActivas = Asignacion::where('estado', 'activa')->count();
        $stockBajo = Articulo::whereColumn('stock', '<=', 'stock_minimo')->count();

        $articulosCriticos = Articulo::whereColumn('stock', '<=', 'stock_minimo')
            ->orderBy('stock', 'asc')->take(5)->get();

        $ultimasEntradas = Entrada::with('proveedor')->orderByDesc('fecha')->take(5)->get();
        $ultimasSalidas = Salida::with('usuario')->orderByDesc('fecha')->take(5)->get();

        $categorias = Categoria::withSum('articulos', 'stock')
            ->get()
            ->map(function ($cat) {
                return [
                    'name' => $cat->nombre, 
                    'value' => (int) ($cat->articulos_sum_stock ?? 0)
                ];
            })
            ->filter(function ($cat) {
                return $cat['value'] > 0;
            })
            ->values();

        $chartMovimientos = [
            '6m' => $this->getMovimientosPorMes(6),
            '3m' => $this->getMovimientosPorMes(3),
            '1w' => $this->getMovimientosPorSemana(7),
        ];

        return inertia('dashboard', [
            'stats' => [
                'total_articulos' => $totalArticulos,
                'total_unidades' => $totalUnidades,
                'asignaciones_activas' => $asignacionesActivas,
                'stock_bajo' => $stockBajo,
            ],
            'articulosCriticos' => $articulosCriticos,
            'ultimasEntradas' => $ultimasEntradas,
            'ultimasSalidas' => $ultimasSalidas,
            'chartCategorias' => $categorias,
            'chartMovimientos' => $chartMovimientos,
        ]);
    }

    private function getMovimientosPorMes($cantidadMeses)
    {
        $labels = [];
        $entradas = [];
        $salidas = [];

        for ($i = $cantidadMeses - 1; $i >= 0; $i--) {
            $mesDate = Carbon::now()->subMonths($i);
            $labels[] = $mesDate->translatedFormat('M');
            $entradas[] = Entrada::whereMonth('fecha', $mesDate->month)->whereYear('fecha', $mesDate->year)->count();
            $salidas[] = Salida::whereMonth('fecha', $mesDate->month)->whereYear('fecha', $mesDate->year)->count();
        }

        return ['labels' => $labels, 'entradas' => $entradas, 'salidas' => $salidas];
    }

    private function getMovimientosPorSemana($dias)
    {
        $labels = [];
        $entradas = [];
        $salidas = [];

        for ($i = $dias - 1; $i >= 0; $i--) {
            $fecha = Carbon::now()->subDays($i);
            $labels[] = $fecha->translatedFormat('D d');
            $entradas[] = Entrada::whereDate('fecha', $fecha->toDateString())->count();
            $salidas[] = Salida::whereDate('fecha', $fecha->toDateString())->count();
        }

        return ['labels' => $labels, 'entradas' => $entradas, 'salidas' => $salidas];
    }
}