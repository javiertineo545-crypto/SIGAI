<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salidas_detalle', function (Blueprint $table) {
            $table->id();

            // Relación con la tabla de salidas
            $table->foreignId('salida_id')
                ->constrained('salidas')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Si esta en uso no se puede borrar
            $table->foreignId('articulo_id')
                ->constrained('articulos')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->decimal('cantidad', 12, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salidas_detalle');
    }
};