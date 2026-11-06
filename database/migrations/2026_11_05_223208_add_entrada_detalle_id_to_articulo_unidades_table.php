<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articulo_unidades', function (Blueprint $table) {
            $table->foreignId('entrada_detalle_id')
                ->nullable()
                ->after('articulo_id')
                ->constrained('entradas_detalle')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('articulo_unidades', function (Blueprint $table) {
            $table->dropForeign(['entrada_detalle_id']);
            $table->dropColumn('entrada_detalle_id');
        });
    }
};