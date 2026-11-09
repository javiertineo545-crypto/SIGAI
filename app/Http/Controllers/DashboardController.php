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
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get();

        
        $ultimasEntradas = Entrada::with('proveedor')
            ->orderByDesc('fecha')->orderByDesc('id')->take(5)->get();

        $ultimasSalidas = Salida::with('usuario')
            ->orderByDesc('fecha')->orderByDesc('id')->take(5)->get();

        
        $categorias = Categoria::withCount('articulos')
            ->having('articulos_count', '>', 0)
            ->get()
            ->map(function ($cat) {
                return [
                    'name' => $cat->nombre,
                    'value' => $cat->articulos_count
                ];
            });

        
        $meses = [];
        $dataEntradas = [];
        $dataSalidas = [];

        for ($i = 5; $i >= 0; $i--) {
            $mesDate = Carbon::now()->subMonths($i);
            $meses[] = $mesDate->translatedFormat('M'); // Ene, Feb, Mar...
            
            $dataEntradas[] = Entrada::whereMonth('fecha', $mesDate->month)
                ->whereYear('fecha', $mesDate->year)->count();
                
            $dataSalidas[] = Salida::whereMonth('fecha', $mesDate->month)
                ->whereYear('fecha', $mesDate->year)->count();
        }

        $chartData = [
            'labels' => $meses,
            'entradas' => $dataEntradas,
            'salidas' => $dataSalidas,
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
            'chartMovimientos' => $chartData,
        ]);
    }
}