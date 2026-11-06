<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Asignacion extends Model
{
    protected $table = 'asignaciones';

    protected $fillable = [
        'articulo_unidad_id',
        'personnel_id',
        'usuario_id',
        'fecha_asignacion',
        'fecha_devolucion',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'fecha_asignacion' => 'date',
        'fecha_devolucion' => 'date',
    ];

    public function articuloUnidad(): BelongsTo
    {
        return $this->belongsTo(ArticuloUnidad::class);
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}