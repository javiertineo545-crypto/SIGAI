<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\UbicacionController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\EstadoArticuloController;
use App\Http\Controllers\ReferenciaController;

use App\Http\Controllers\ArticuloController;
use App\Http\Controllers\ArticuloUnidadController;
use App\Http\Controllers\EntradaController;
use App\Http\Controllers\SalidaController;

use App\Http\Controllers\AsignacionController;

use App\Http\Controllers\ReporteController;

use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return redirect('/login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('personnel', PersonnelController::class);
    Route::patch('/personnel/{personnel}/toggle-status', [PersonnelController::class, 'toggleStatus'])->name('personnel.toggle-status');

    Route::resource('positions', PositionController::class);
    Route::patch('/positions/{position}/toggle-status', [PositionController::class, 'toggleStatus'])->name('positions.toggle-status');

    Route::resource('permissions', PermissionController::class);
    Route::resource('roles', RoleController::class);

    Route::resource('users', UserController::class);
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');

    // -------------------------------------------------------------------------------------------------------------------------------

    Route::resource('categorias', CategoriaController::class);
    Route::patch('categorias/{categoria}/toggle-status', [CategoriaController::class, 'toggleStatus'])->name('categorias.toggle-status');

    Route::resource('marcas', MarcaController::class);
    Route::patch('marcas/{marca}/toggle-status', [MarcaController::class, 'toggleStatus'])->name('marcas.toggle-status');

    Route::resource('ubicaciones', UbicacionController::class)->parameters(['ubicaciones' => 'ubicacion']);
    Route::patch('ubicaciones/{ubicacion}/toggle-status', [UbicacionController::class, 'toggleStatus'])->name('ubicaciones.toggle-status');

    Route::resource('proveedores', ProveedorController::class)->parameters(['proveedores' => 'proveedor']);
    Route::patch('proveedores/{proveedor}/toggle-status', [ProveedorController::class, 'toggleStatus'])->name('proveedores.toggle-status');

    Route::resource('estados-articulo', EstadoArticuloController::class)->parameters(['estados-articulo' => 'estadoArticulo']);

    Route::resource('articulos', ArticuloController::class);

    Route::resource('referencias', ReferenciaController::class);
    Route::patch('referencias/{referencia}/toggle-status', [ReferenciaController::class, 'toggleStatus'])->name('referencias.toggle-status');

    Route::resource('entradas', EntradaController::class)->except(['show']);
    Route::get('entradas/create-factura', [EntradaController::class, 'createFactura'])->name('entradas.factura.create');
    Route::post('entradas/factura', [EntradaController::class, 'storeFactura'])->name('entradas.factura.store');
    Route::get('entradas/buscar-facturas', [EntradaController::class, 'buscarFacturas'])->name('entradas.facturas.buscar');
    Route::get('articulos/{articulo}/entradas', [EntradaController::class, 'showArticulo'])->name('articulos.entradas');
    Route::get('entradas/{entrada}', [EntradaController::class, 'showFactura'])->name('entradas.show');
    Route::get('entradas/{entrada}/detalles/{detalle}', [EntradaController::class, 'showDetalle'])->name('entradas.detalles.show');
    Route::get('entradas/{entrada}/detalles/{detalle}/edit', [EntradaController::class, 'editDetalle'])->name('entradas.detalles.edit');
    Route::put('entradas/{entrada}/detalles/{detalle}', [EntradaController::class, 'updateDetalle'])->name('entradas.detalles.update');

    // Rutas de Salidas
    Route::resource('salidas', SalidaController::class)->except(['edit', 'update']);
    Route::get('articulos/{articulo}/salidas', [SalidaController::class, 'showArticulo'])->name('articulos.salidas');
   
    Route::get('articulo-unidades', [ArticuloUnidadController::class, 'index'])->name('articulo-unidades.index');
    Route::get('articulo-unidades/{articuloUnidad}', [ArticuloUnidadController::class, 'show'])->name('articulo-unidades.show');

    // rutas de asignaciones
    Route::resource('asignaciones', AsignacionController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update']);
    Route::patch('asignaciones/{asignacion}/devolver', [AsignacionController::class, 'devolver'])->name('asignaciones.devolver');

    //dasboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rutas de reportes
    Route::get('/reportes', [ReporteController::class, 'index'])->name('reportes.index');
    Route::get('/reportes/exportar', [ReporteController::class, 'exportPdf'])->name('reportes.pdf');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';