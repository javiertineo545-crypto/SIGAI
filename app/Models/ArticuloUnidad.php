<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArticuloUnidad extends Model
{
    protected $table = 'articulo_unidades';

    protected $fillable = [
        'articulo_id',
        'entrada_detalle_id',
        'identificador',
        'serial',
        'ubicacion_id',
        'estado_id',
        'fecha_adquisicion',
    ];

    protected $casts = [
        'fecha_adquisicion' => 'date',
    ];

    public function articulo(): BelongsTo
    {
        return $this->belongsTo(Articulo::class);
    }

    public function ubicacion(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(EstadoArticulo::class);
    }
    
    public function entradaDetalle(): BelongsTo
    {
        return $this->belongsTo(EntradaDetalle::class);
    }
    //asignaciones
    public function asignaciones(): HasMany
    {
    return $this->hasMany(Asignacion::class);
    }
    // salida
    public function salidasDetalle(): HasMany
    {
    return $this->hasMany(SalidaDetalle::class);
    }
}