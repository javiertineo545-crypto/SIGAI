import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Form from './Form';

export default function Create({ articulos = [], unidades = [] }: any) {
    
    const getToday = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    const { data, setData, post, processing, errors } = useForm({
        fecha: getToday(), 
        motivo: '',
        tipo_salida: 'desincorporacion',
        entidad_destino: '',
        observaciones: '',
        detalles: [{ _id: Date.now().toString(), articulo_id: '', articulo_unidad_id: '', cantidad: 1 }]
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('salidas.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Salidas', href: route('salidas.index') },
            { title: 'Salida', href: route('salidas.create') }
        ]}>
            <Head title="Registrar Salida" />

            <div className="p-4 md:p-6 w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Registrar Salida</h1>
                    <p className="text-muted-foreground">Puedes retirar consumibles o dar de baja un equipo.</p>
                </div>

                <Form 
                    articulos={articulos}
                    unidades={unidades}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    submitLabel="Guardar Salida"
                />
            </div>
        </AppLayout>
    );
}