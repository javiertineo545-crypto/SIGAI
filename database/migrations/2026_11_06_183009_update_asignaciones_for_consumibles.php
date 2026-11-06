<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asignaciones', function (Blueprint $table) {
            // 1. Quitamos el NOT NULL para permitir bolsas (consumibles)
            $table->foreignId('articulo_unidad_id')->nullable()->change();
            
            // 2. Agregamos el artículo y la cantidad
            $table->foreignId('articulo_id')->nullable()->after('articulo_unidad_id')->constrained('articulos')->nullOnDelete();
            $table->integer('cantidad')->default(1)->after('articulo_id');
        });
    }

    public function down(): void
    {
        Schema::table('asignaciones', function (Blueprint $table) {
            $table->dropForeign(['articulo_id']);
            $table->dropColumn(['articulo_id', 'cantidad']);
            $table->foreignId('articulo_unidad_id')->nullable(false)->change();
        });
    }
};