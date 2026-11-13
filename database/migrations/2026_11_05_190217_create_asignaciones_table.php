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

            // Relaciones
            $table->foreignId('articulo_unidad_id')->nullable()->constrained('articulo_unidades')->nullOnDelete();
            $table->foreignId('articulo_id')->nullable()->constrained('articulos')->nullOnDelete();
            $table->foreignId('personnel_id')->constrained('personnels')->restrictOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->restrictOnDelete();
            
            // Datos generales
            $table->decimal('cantidad', 12, 2)->default(1);
            $table->date('fecha_asignacion');
            $table->date('fecha_devolucion')->nullable();
            $table->enum('estado', ['activa', 'devuelta'])->default('activa');
            $table->string('condicion_entrega')->nullable();
            $table->text('observaciones')->nullable();

            // Lógica de negocio (Préstamo, Traslado, Guarda)
            $table->enum('tipo_asignacion', ['prestamo', 'traslado', 'guarda_custodia'])->default('prestamo');
            $table->boolean('es_tiempo_indefinido')->default(false);
            $table->date('fecha_estimada_devolucion')->nullable();
            
            // Ubicación para el traslado
            $table->foreignId('ubicacion_destino_id')->nullable()->constrained('ubicaciones')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones');
    }
};