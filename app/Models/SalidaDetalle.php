<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalidaDetalle extends Model
{
    protected $table = 'salidas_detalle';

    protected $fillable = [
        'salida_id',
        'articulo_id',
        'articulo_unidad_id', // <-- NUEVO CAMPO
        'cantidad',
    ];

    protected $casts = [
        'cantidad' => 'decimal:2',
    ];

    public function salida(): BelongsTo
    {
        return $this->belongsTo(Salida::class);
    }

    public function articulo(): BelongsTo
    {
        return $this->belongsTo(Articulo::class);
    }

    // Relación con el serial
    public function articuloUnidad(): BelongsTo
    {
        return $this->belongsTo(ArticuloUnidad::class);
    }
}