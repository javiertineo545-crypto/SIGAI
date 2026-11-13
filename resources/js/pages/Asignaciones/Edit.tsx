import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Form from './Form';

export default function Edit({ asignacion, articulos = [], unidades = [], personnels = [], ubicaciones = [] }: any) {
    
    const { data, setData, put, processing, errors } = useForm({
        articulo_id: asignacion.articulo_id || '',
        articulo_unidad_id: asignacion.articulo_unidad_id || '',
        cantidad: asignacion.cantidad || 1,
        personnel_id: asignacion.personnel_id || '',
        fecha_asignacion: asignacion.fecha_asignacion ? asignacion.fecha_asignacion.split('T')[0] : '',
        tipo_asignacion: asignacion.tipo_asignacion || 'prestamo',
        ubicacion_destino_id: asignacion.ubicacion_destino_id || '',
        condicion_entrega: asignacion.condicion_entrega || '',
        observaciones: asignacion.observaciones || '',
        // Nuevos campos
        es_tiempo_indefinido: asignacion.es_tiempo_indefinido || false,
        fecha_estimada_devolucion: asignacion.fecha_estimada_devolucion ? asignacion.fecha_estimada_devolucion.split('T')[0] : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('asignaciones.update', asignacion.id));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Asignaciones', href: route('asignaciones.index') },
            { title: 'Editar Asignación', href: '#' }
        ]}>
            <Head title="Editar Asignación" />
            <div className="p-4 md:p-6 w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Editar Asignación #{asignacion.id}</h1>
                </div>
                <Form 
                    articulos={articulos}
                    unidades={unidades}
                    personnels={personnels}
                    ubicaciones={ubicaciones}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    submitLabel="Actualizar Asignación"
                />
            </div>
        </AppLayout>
    );
}