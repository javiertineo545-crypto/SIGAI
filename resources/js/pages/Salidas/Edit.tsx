import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Edit() {
    useEffect(() => {
        // Redirección forzada automática si intentan acceder por URL directa
        router.visit(route('salidas.index'));
    }, []);

    return (
        <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">
            Cargando historial de inventario...
        </div>
    );
}
