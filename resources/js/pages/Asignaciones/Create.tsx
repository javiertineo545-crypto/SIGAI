import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Form from './Form';

export default function Create({ unidadesDisponibles = [], personnels = [] }: any) {
    
    const getToday = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    const { data, setData, post, processing, errors } = useForm({
        articulo_unidad_id: '',
        personnel_id: '',
        fecha_asignacion: getToday(),
        condicion_entrega: '',
        observaciones: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('asignaciones.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Asignaciones', href: route('asignaciones.index') },
            { title: 'Asignación', href: route('asignaciones.create') }
        ]}>
            <Head title="Asignación" />
            <div className="p-4 md:p-6 w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Asignación</h1>
                    <p className="text-muted-foreground">Registra la entrega de un equipo a un trabajador.</p>
                </div>
                <Form 
                    unidadesDisponibles={unidadesDisponibles}
                    personnels={personnels}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    submitLabel="Guardar Asignación"
                />
            </div>
        </AppLayout>
    );
}