import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Form from './Form';
import { Can } from "@/components/can";

export default function Index() {
    const { data, setData, processing } = useForm({
        modulos: ['inventario'],
        fecha_inicio: '',
        fecha_fin: '',
    });

    const handleDownload = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (data.modulos.length === 0) {
            alert("Por favor, selecciona al menos un módulo para generar el reporte.");
            return;
        }

        const params = new URLSearchParams();
        params.append('modulos', data.modulos.join(','));
        if (data.fecha_inicio) params.append('fecha_inicio', data.fecha_inicio);
        if (data.fecha_fin) params.append('fecha_fin', data.fecha_fin);

        const boton = document.getElementById('btn-generar-pdf');
        let colorDelTema = '#eab308'; 
        
        if (boton) {
            const colorCalculado = window.getComputedStyle(boton).backgroundColor;
            if (colorCalculado && colorCalculado !== 'rgba(0, 0, 0, 0)') {
                colorDelTema = colorCalculado;
            }
        }
        
        params.append('color', colorDelTema);

        window.open(route('reportes.pdf') + '?' + params.toString(), '_blank');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reportes', href: route('reportes.index') }]}>
            <Head title="Generación de Reportes" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 w-full h-full relative">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Generación de Reportes</h1>
                        <p className="text-muted-foreground">Descarga el historial de tu inventario en formato PDF.</p>
                    </div>
                </div>

                <Can permission="reportes.view">
                    <Form 
                        data={data}
                        setData={setData}
                        processing={processing}
                        onSubmit={handleDownload}
                    />
                </Can>
            </div>
        </AppLayout>
    );
}