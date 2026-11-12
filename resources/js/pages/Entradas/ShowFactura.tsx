import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Can } from '@/components/can';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface Proveedor {
    id: number;
    nombre: string;
}

interface Usuario {
    id: number;
    name: string;
}

interface Unidad {
    id: number;
    identificador: string;
    serial: string | null;
    ubicacion: { id: number; nombre: string } | null;
    estado: { id: number; nombre: string } | null;
}

interface Articulo {
    id: number;
    nombre: string;
    modelo: string | null;
    marca: { id: number; nombre: string } | null;
    referencia: { id: number; codigo: string } | null;
}

interface Detalle {
    id: number;
    cantidad: number | string;
    articulo: Articulo;
    unidades: Unidad[];
}

interface Entrada {
    id: number;
    numero_documento: string | null;
    fecha: string;
    observaciones: string | null;
    proveedor: Proveedor | null;
    usuario: Usuario | null;
    detalles: Detalle[];
}

interface Props {
    entrada: Entrada;
}

export default function ShowFactura({ entrada }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Entradas', href: route('entradas.index') },
        {
            title: `Factura ${entrada.numero_documento ?? entrada.id}`,
            href: route('entradas.show', entrada.id),
        },
    ];

    const totalUnidades = entrada.detalles.reduce(
        (total, detalle) => total + Number(detalle.cantidad),
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Factura ${entrada.numero_documento ?? entrada.id}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">
                            Factura {entrada.numero_documento ?? `#${entrada.id}`}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Consulta completa de la factura y sus artículos registrados.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link href={route('entradas.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>

                        <Can permission="entradas.edit">
                            <Link href={route('entradas.edit', entrada.id)}>
                                <Button>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar factura
                                </Button>
                            </Link>
                        </Can>
                    </div>
                </div>

                <div className="rounded-lg border bg-background p-6 space-y-5">
                    <h2 className="text-lg font-semibold">
                        Información de la factura
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Número de documento</p>
                            <p className="mt-1 font-medium">
                                {entrada.numero_documento ?? 'Sin documento'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Proveedor</p>
                            <p className="mt-1 font-medium">
                                {entrada.proveedor?.nombre ?? 'Sin proveedor'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Fecha de entrada</p>
                            <p className="mt-1 font-medium">
                                {entrada.fecha?.substring(0, 10) ?? 'Sin fecha'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Registrado por</p>
                            <p className="mt-1 font-medium">
                                {entrada.usuario?.name ?? 'Sin usuario'}
                            </p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">Observaciones</p>
                        <p className="mt-1 text-sm">
                            {entrada.observaciones || 'Sin observaciones.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border bg-background p-5">
                        <p className="text-sm text-muted-foreground">
                            Artículos diferentes
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {entrada.detalles.length}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-background p-5">
                        <p className="text-sm text-muted-foreground">
                            Cantidad total de unidades
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {totalUnidades}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border bg-background p-6 space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Artículos incluidos
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Todos los artículos registrados en esta factura.
                        </p>
                    </div>

                    {entrada.detalles.length > 0 ? (
                        <div className="space-y-4">
                            {entrada.detalles.map((detalle, index) => (
                                <div
                                    key={detalle.id}
                                    className="rounded-lg border p-4 space-y-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Artículo {index + 1}
                                            </p>
                                            <h3 className="font-semibold">
                                                {detalle.articulo?.nombre ?? 'Artículo no disponible'}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {detalle.articulo?.marca?.nombre ?? 'Sin marca'}
                                                {' · '}
                                                {detalle.articulo?.modelo ?? 'Sin modelo'}
                                                {' · '}
                                                {detalle.articulo?.referencia?.codigo ?? 'Sin referencia'}
                                            </p>
                                        </div>
                                        <div className="rounded-md bg-muted px-3 py-2 text-sm">
                                            Cantidad: <strong>{Number(detalle.cantidad)}</strong>
                                        </div>
                                    </div>

                                    {detalle.unidades?.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">
                                                Unidades registradas
                                            </h4>

                                            <div className="overflow-x-auto rounded-md border">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/50">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left font-medium">Identificador</th>
                                                            <th className="px-3 py-2 text-left font-medium">Serial</th>
                                                            <th className="px-3 py-2 text-left font-medium">Ubicación</th>
                                                            <th className="px-3 py-2 text-left font-medium">Estado</th>
                                                            <th className="px-3 py-2 text-left font-medium">Código QR</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y">
                                                        {detalle.unidades.map((unidad) => (
                                                            <tr key={unidad.id}>
                                                                <td className="px-3 py-2 font-medium">
                                                                    {unidad.identificador}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {unidad.serial || ' - '}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {unidad.ubicacion?.nombre ?? 'Sin ubicación'}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {unidad.estado?.nombre ?? 'Sin estado'}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <QRCodeDisplay 
                                                                        value={unidad.identificador} 
                                                                        articulo={detalle.articulo?.nombre}
                                                                        serial={unidad.serial || 'N/A'}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Esta factura no contiene artículos.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}