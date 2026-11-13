<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Salida extends Model
{
    protected $table = 'salidas';

    protected $fillable = [
        'usuario_id',
        'motivo',
        'tipo_salida',
        'entidad_destino',
        'fecha',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function detalles():HasMany
    {
        return $this->hasMany(salidaDetalle::class,'salida_id');
    }
}