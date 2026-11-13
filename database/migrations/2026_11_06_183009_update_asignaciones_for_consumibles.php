<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       
        Schema::table('asignaciones', function (Blueprint $table) {
            $table->foreignId('articulo_unidad_id')->nullable()->change();
        });

        
        if (!Schema::hasColumn('asignaciones', 'articulo_id')) {
            Schema::table('asignaciones', function (Blueprint $table) {
                $table->foreignId('articulo_id')
                    ->nullable()
                    ->after('articulo_unidad_id')
                    ->constrained('articulos')
                    ->nullOnDelete();
            });
        }

        
        if (!Schema::hasColumn('asignaciones', 'cantidad')) {
            Schema::table('asignaciones', function (Blueprint $table) {
                $table->integer('cantidad')->default(1)->after('articulo_id');
            });
        }
    }

    public function down(): void
    {
       
        if (Schema::hasColumn('asignaciones', 'articulo_id')) {
            Schema::table('asignaciones', function (Blueprint $table) {
                $table->dropForeign(['articulo_id']);
                $table->dropColumn('articulo_id');
            });
        }

        // Quitar cantidad
        if (Schema::hasColumn('asignaciones', 'cantidad')) {
            Schema::table('asignaciones', function (Blueprint $table) {
                $table->dropColumn('cantidad');
            });
        }

        // Revertir nullable de articulo_unidad_id
        Schema::table('asignaciones', function (Blueprint $table) {
            $table->foreignId('articulo_unidad_id')->nullable(false)->change();
        });
    }
};