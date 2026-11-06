import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

export default function Show({ asignacion }: any) {
    const activa = asignacion.estado === 'activa';

    return (
        <AppLayout breadcrumbs={[
            { title: 'Asignaciones', href: route('asignaciones.index') },
            { title: `Detalle #${asignacion.id}`, href: '#' }
        ]}>
            <Head title={`Asignación #${asignacion.id}`} />

            <div className="p-4 md:p-6 w-full max-w-5xl mx-auto space-y-6">
                
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route('asignaciones.index')}>← Volver al historial</Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Detalle de Asignación</h1>
                        <p className="text-muted-foreground">Información del equipo entregado.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipo Asignado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-3">
                                <p className="text-sm text-muted-foreground">Artículo</p>
                                <p className="font-bold text-lg text-red-600">
                                    {asignacion.articulo_nombre}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {asignacion.marca} - {asignacion.modelo}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">ID del Equipo</p>
                                    <p className="font-medium">{asignacion.identificador}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Serial Físico</p>
                                    <p className="font-medium">{asignacion.serial}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trabajador</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                                <p className="font-bold text-lg">{asignacion.trabajador_nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cédula de Identidad</p>
                                <p className="font-medium">{asignacion.trabajador_cedula}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos de la Operación</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Fecha de Asignación</p>
                            <p className="font-medium">{formatFecha(asignacion.fecha_asignacion)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Estado Actual</p>
                            <p className={`font-bold ${activa ? 'text-green-600' : 'text-gray-500'}`}>
                                {activa ? 'ACTIVA' : 'DEVUELTA'}
                            </p>
                        </div>
                        
                        <div className="col-span-1 md:col-span-2 bg-muted p-4 rounded-lg mt-2">
                            <p className="text-sm text-muted-foreground mb-1">Observaciones</p>
                            <p className="whitespace-pre-wrap text-sm">
                                {asignacion.observaciones || 'Sin observaciones.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}