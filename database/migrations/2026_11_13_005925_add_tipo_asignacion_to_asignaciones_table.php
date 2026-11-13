<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agregar tipo_asignacion solo si no existe
        if (!Schema::hasColumn('asignaciones', 'tipo_asignacion')) {
            Schema::table('asignaciones', function (Blueprint $table) {
                $table->enum('tipo_asignacion', ['prestamo', 'traslado', 'guarda', 'custodia'])
                    ->default('prestamo')
                    ->after('fecha_asignacion');
            });
        }

        // Agregar ubicacion_destino_id solo si no existe
        if (!Schema::hasColumn('asignaciones', 'ubicacion_destino_id')) {
            Schema::table('asignaciones', function (Blueprint $table) {
                $table->foreignId('ubicacion_destino_id')
                    ->nullable()
                    ->after('tipo_asignacion')
                    ->constrained('ubicaciones')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('asignaciones', 'ubicacion_destino_id')) {
            Schema::table('asignaciones', function (Blueprint $table) {
                $table->dropForeign(['ubicacion_destino_id']);
                $table->dropColumn('ubicacion_destino_id');
            });
        }

        if (Schema::hasColumn('asignaciones', 'tipo_asignacion')) {
            Schema::table('asignaciones', function (Blueprint $table) {
                $table->dropColumn('tipo_asignacion');
            });
        }
    }
};