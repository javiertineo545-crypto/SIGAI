<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignaciones', function (Blueprint $table) {
            $table->id();

            $table->foreignId('articulo_unidad_id')
                ->constrained('articulo_unidades')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('personnel_id')
                ->constrained('personnels')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('usuario_id')
                ->constrained('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->date('fecha_asignacion');
            $table->date('fecha_devolucion')->nullable();
            
            
            $table->enum('estado', ['activa', 'devuelta'])->default('activa');
            
            $table->text('observaciones')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones');
    }
};