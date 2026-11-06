<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salidas_detalle', function (Blueprint $table) {
            
            $table->foreignId('articulo_unidad_id')
                ->nullable()
                ->after('articulo_id')
                ->constrained('articulo_unidades')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('salidas_detalle', function (Blueprint $table) {
            $table->dropForeign(['articulo_unidad_id']);
            $table->dropColumn('articulo_unidad_id');
        });
    }
};