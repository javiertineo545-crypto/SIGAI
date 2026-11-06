import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const formatFecha = (fechaString: string) => {
    if (!fechaString) return '';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

export default function Show({ salida }: { salida: any }) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Salidas', href: route('salidas.index') },
            { title: `Detalle #${salida.id}`, href: route('salidas.show', salida.id) }
        ]}>
            <Head title={`Salida #${salida.id}`} />

            <div className="p-4 md:p-6 w-full space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('salidas.index')}><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Detalle de Salida #{salida.id}</h1>
                </div>

                <Card>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Motivo</p>
                            <p className="text-lg font-semibold">{salida.motivo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Fecha</p>
                            <p>{formatFecha(salida.fecha)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Registrado por</p>
                            <p>{salida.usuario?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Observaciones</p>
                            <p>{salida.observaciones || 'Ninguna'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Artículos Retirados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="p-4 font-medium">Artículo</th>
                                        <th className="p-4 font-medium">Marca / Modelo / Ref</th>
                                        <th className="p-4 font-medium text-right">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salida.detalles.map((detalle: any) => (
                                        <tr key={detalle.id} className="border-t">
                                            <td className="p-4 font-medium">{detalle.articulo?.nombre}</td>
                                            <td className="p-4 text-muted-foreground">
                                                {detalle.articulo?.marca?.nombre} - {detalle.articulo?.modelo}
                                                {detalle.articulo?.referencia && ` | ${detalle.articulo.referencia.codigo}`}
                                            </td>
                                            {}
                                            <td className="p-4 text-right font-bold text-lg text-foreground">
                                                {parseInt(detalle.cantidad, 10)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}