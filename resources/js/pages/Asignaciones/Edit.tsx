import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Form from './Form';

export default function Edit({ asignacion, unidadesDisponibles, personnels }: any) {
    
    const { data, setData, put, processing, errors } = useForm({
        articulo_unidad_id: asignacion.articulo_unidad_id,
        personnel_id: asignacion.personnel_id,
        fecha_asignacion: asignacion.fecha_asignacion.split('T')[0],
        condicion_entrega: asignacion.condicion_entrega || '',
        observaciones: asignacion.observaciones || '',
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
                    <p className="text-muted-foreground">Modifica los datos de la asignación actual.</p>
                </div>
                <Form 
                    unidadesDisponibles={unidadesDisponibles}
                    personnels={personnels}
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