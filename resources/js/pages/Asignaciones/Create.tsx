import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Form from './Form';

export default function Create({ articulos = [], unidades = [], personnels = [], ubicaciones = [] }: any) {
    const getToday = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    const { data, setData, post, processing, errors } = useForm({
        articulo_id: '',
        articulo_unidad_id: '',
        cantidad: 1,
        personnel_id: '',
        fecha_asignacion: getToday(),
        tipo_asignacion: 'prestamo',
        ubicacion_destino_id: '',
        condicion_entrega: '',
        observaciones: '',
        // Nuevos campos
        es_tiempo_indefinido: false,
        fecha_estimada_devolucion: '',
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
                    <p className="text-muted-foreground">Registra la entrega de un equipo o consumible a un trabajador.</p>
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
                    submitLabel="Guardar Asignación"
                />
            </div>
        </AppLayout>
    );
}