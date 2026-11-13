import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Form from './Form';

export default function Edit({ salida, articulos = [], unidades = [] }: any) {
    
    const { data, setData, put, processing, errors } = useForm({
        fecha: salida.fecha ? salida.fecha.split('T')[0] : '',
        motivo: salida.motivo || '',
        tipo_salida: salida.tipo_salida || 'desincorporacion',
        entidad_destino: salida.entidad_destino || '',
        observaciones: salida.observaciones || '',
        detalles: salida.detalles?.map((d: any) => ({
            _id: Date.now().toString() + Math.random().toString(),
            articulo_id: String(d.articulo_id),
            articulo_unidad_id: d.articulo_unidad_id ? String(d.articulo_unidad_id) : '',
            cantidad: parseInt(d.cantidad, 10) || 1
        })) || [{ _id: Date.now().toString(), articulo_id: '', articulo_unidad_id: '', cantidad: 1 }]
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('salidas.update', salida.id));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Salidas', href: route('salidas.index') },
            { title: `Editar #${salida.id}`, href: '#' }
        ]}>
            <Head title={`Editar Salida #${salida.id}`} />

            <div className="p-4 md:p-6 w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Editar Salida #{salida.id}</h1>
                    <p className="text-muted-foreground">Modifica los datos de la operación.</p>
                </div>

                <Form 
                    articulos={articulos}
                    unidades={unidades}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    submitLabel="Actualizar Salida"
                />
            </div>
        </AppLayout>
    );
}