import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Calendar, AlertCircle } from 'lucide-react';
import QRCodeDisplay from '@/components/QRCodeDisplay';

const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

const formatTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
        'traslado': 'Traslado',
        'desincorporacion': 'Desincorporación'
    };
    return tipos[tipo] || tipo || 'No aplica';
};

export default function Show({ salida }: any) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Salidas', href: route('salidas.index') },
            { title: `Detalle #${salida.id}`, href: '#' }
        ]}>
            <Head title={`Salida #${salida.id}`} />

            <div className="p-4 md:p-6 w-full max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('salidas.index')}><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Detalle de la Salida</h1>
                        <p className="text-muted-foreground">Información completa de la operación.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Datos de la Operación</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Motivo</p>
                            <p className="font-semibold">{salida.motivo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tipo de Salida</p>
                            <p className={`font-bold ${salida.tipo_salida === 'traslado' ? 'text-orange-500' : 'text-red-500'}`}>
                                {formatTipo(salida.tipo_salida)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fecha</p>
                            <p className="font-medium">{formatFecha(salida.fecha)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Registrado por</p>
                            <p className="font-medium">{salida.usuario?.name}</p>
                        </div>
                        <div className="col-span-1 md:col-span-3 bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Observaciones</p>
                            <p className="whitespace-pre-wrap text-sm">{salida.observaciones || 'Sin observaciones.'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Artículos Retirados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {salida.detalles.map((detalle: any) => {
                            const esEquipo = detalle.articulo_unidad_id !== null;
                            return (
                                <div key={detalle.id} className="bg-white p-4 rounded-lg border shadow-sm">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="space-y-2 border-l-4 border-blue-500 pl-3 flex-1">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Artículo</p>
                                                <p className="font-bold text-lg text-red-600">{detalle.articulo?.nombre}</p>
                                                <p className="text-sm text-muted-foreground">{detalle.articulo?.marca?.nombre} - {detalle.articulo?.modelo}</p>
                                            </div>
                                            {esEquipo && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">ID del Equipo</p>
                                                        <p className="font-medium text-sm">{detalle.articulo_unidad?.identificador}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Serial Físico</p>
                                                        <p className="font-medium text-sm">{detalle.articulo_unidad?.serial || 'No registrado'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Cantidad</p>
                                            <span className="bg-slate-100 font-bold px-3 py-1 rounded">{parseInt(detalle.cantidad, 10)}</span>
                                        </div>
                                    </div>
                                    {esEquipo && (
                                        <div className="mt-4 pt-4 border-t flex justify-center md:justify-start">
                                            <QRCodeDisplay value={detalle.articulo_unidad?.identificador} articulo={detalle.articulo?.nombre} serial={detalle.articulo_unidad?.serial} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}