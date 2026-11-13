<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PASO 1: Ampliamos el ENUM temporalmente para que acepte tanto los viejos como los nuevos
        DB::statement("ALTER TABLE salidas MODIFY COLUMN tipo_salida ENUM('temporal', 'definitiva', 'traspaso', 'desincorporacion') NOT NULL DEFAULT 'desincorporacion'");

        // PASO 2: Ahora que el ENUM acepta los nuevos valores, actualizamos los datos
        DB::table('salidas')->where('tipo_salida', 'temporal')->update(['tipo_salida' => 'traspaso']);
        DB::table('salidas')->where('tipo_salida', 'definitiva')->update(['tipo_salida' => 'desincorporacion']);

        // PASO 3: Ahora que los datos ya están actualizados, dejamos solo los valores nuevos
        DB::statement("ALTER TABLE salidas MODIFY COLUMN tipo_salida ENUM('traspaso', 'desincorporacion') NOT NULL DEFAULT 'desincorporacion'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE salidas MODIFY COLUMN tipo_salida ENUM('temporal', 'definitiva') NOT NULL DEFAULT 'definitiva'");
    }
};