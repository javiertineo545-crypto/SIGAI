import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notify } from '@/lib/notify';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Articulo {
    id: number;
    nombre: string;
    modelo: string | null;
    control_individual: boolean;
    maneja_serial: boolean;
    stock: string | number;
    referencia: { codigo: string } | null;
    marca: { nombre: string } | null;
    categoria: { nombre: string } | null;
}

interface Proveedor {
    id: number;
    nombre: string;
}

interface Usuario {
    id: number;
    name: string;
}

interface Ubicacion {
    id: number;
    nombre: string;
}

interface EstadoArticulo {
    id: number;
    nombre: string;
}

interface Unidad {
    id: number;
    identificador: string;
    serial: string | null;
    ubicacion_id: number;
    estado_id: number;
    fecha_adquisicion: string;
}

interface Entrada {
    id: number;
    proveedor: Proveedor | null;
    usuario: Usuario | null;
    numero_documento: string | null;
    fecha: string;
    observaciones: string | null;
}

interface Detalle {
    id: number;
    cantidad: string | number;
    articulo: Articulo;
    : Unidad[];
}

interface Props {
    entrada: Entrada;
    detalle: Detalle;
    ubicaciones: Ubicacion[];
    estados: EstadoArticulo[];
}

export default function EditDetalle({
    entrada,
    detalle,
    ubicaciones,
    estados,
}: Props) {
    const articulo = detalle.articulo;

    const { data, setData, put, processing, errors } = useForm({
        cantidad: String(detalle.cantidad),
        observaciones: entrada.observaciones ?? '',
        unidades: detalle.unidades.map((unidad) => ({
            id: unidad.id,
            identificador: unidad.identificador,
            serial: unidad.serial ?? '',
            ubicacion_id: String(unidad.ubicacion_id),
            estado_id: String(unidad.estado_id),
            fecha_adquisicion: unidad.fecha_adquisicion?.substring(0, 10) ?? '',
        })),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Entradas', href: '/entradas' },
        { title: articulo.nombre, href: `/entradas/${articulo.id}` },
        { title: 'Editar detalle', href: '#' },
    ];

    const cambiarUnidad = (
        index: number,
        campo: 'serial' | 'ubicacion_id' | 'estado_id' | 'fecha_adquisicion',
        valor: string,
    ) => {
        const unidades = [...data.unidades];
        unidades[index] = { ...unidades[index], [campo]: valor };
        setData('unidades', unidades);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('entradas.detalles.update', {
                entrada: entrada.id,
                detalle: detalle.id,
            }),
            {
                onSuccess: () => notify.success('Cambios guardados correctamente.'),
                onError: () => notify.error('No se pudieron guardar los cambios. Revisa los campos.'),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar detalle - ${articulo.nombre}`} />

            <form onSubmit={submit} className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold">Editar detalle de entrada</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Modifica los datos de las unidades o la cantidad registrada.
                        </p>
                    </div>

                    <Link href={route('articulos.entradas', articulo.id)}>
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </Link>
                </div>

                {/* CUADRO PRINCIPAL */}
                <div className="space-y-6 rounded-lg border bg-background p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Editar detalle de entrada
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Información de la factura, el artículo y las unidades registradas.
                        </p>
                    </div>

                    {/* LÍNEA 2: DATOS DEL ARTÍCULO */}
                    <div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input value={articulo.nombre} disabled />
                            </div>

                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Input
                                    value={articulo.marca?.nombre ?? 'Sin marca'}
                                    disabled
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Modelo</Label>
                                <Input
                                    value={articulo.modelo ?? 'Sin modelo'}
                                    disabled
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Stock actual</Label>
                                <Input value={Number(articulo.stock)} disabled />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Referencia</Label>
                                <Input value={articulo.referencia?.codigo ?? 'Sin referencia'} disabled/>
                            </div>
                        </div>
                    </div>

                    {/* LÍNEA 2: DATOS DE LA FACTURA */}
                    <div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Proveedor</Label>
                                <Input
                                    value={entrada.proveedor?.nombre ?? 'Sin proveedor'}
                                    disabled
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cantidad">Cantidad en esta entrada</Label>

                                {articulo.control_individual ? (
                                    <Input value={data.unidades.length} disabled />
                                ) : (
                                    <Input
                                        id="cantidad"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={data.cantidad}
                                        onChange={(e) => {
                                            const valor = e.target.value;
                                            if (valor === '' || /^\d+$/.test(valor)) {
                                                setData('cantidad', valor);
                                            }
                                        }}
                                    />
                                )}

                                {errors.cantidad && (<p className="text-sm text-destructive">{errors.cantidad}</p>)}
                            </div>

                            <div className="space-y-2">
                                <Label>Número de factura</Label>
                                <Input
                                    value={entrada.numero_documento ?? 'Sin documento'}
                                    disabled
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Fecha de factura</Label>
                                <Input
                                    value={entrada.fecha?.substring(0, 10) ?? ''}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* LÍNEA 3: OBSERVACIONES */}
                    <div className="space-y-2">
                        <Label htmlFor="observaciones">
                            Observaciones
                        </Label>

                        <Textarea
                            id="observaciones"
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            placeholder="Observaciones de la entrada..."
                            rows={3}
                        />

                        {errors.observaciones && (<p className="text-sm text-destructive">{errors.observaciones}</p>)}
                    </div>
                </div>

                {articulo.control_individual && (
                    <div className="space-y-4 rounded-lg border bg-background p-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                <h2 className="font-semibold">Unidades físicas</h2>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Edita el serial, estado, ubicación y fecha de cada unidad.
                                Los identificadores no se pueden modificar.
                            </p>
                            {errors.unidades && (
                                <p className="mt-2 text-sm text-destructive">{errors.unidades}</p>
                            )}
                        </div>

                        {data.unidades.length === 0 ? (
                            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                                No hay unidades asociadas a este detalle de entrada.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-3 text-left">Identificador</th>
                                            {articulo.maneja_serial && (
                                                <th className="px-3 py-3 text-left">Serial</th>
                                            )}
                                            <th className="px-3 py-3 text-left">Estado</th>
                                            <th className="px-3 py-3 text-left">Ubicación</th>
                                            {/* <th className="px-3 py-3 text-left">Fecha de adquisición</th> */}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {data.unidades.map((unidad, index) => {
                                            const errorSerial =
                                                errors[`unidades.${index}.serial` as keyof typeof errors];

                                            return (
                                                <tr key={unidad.id} className="align-top hover:bg-muted/30">
                                                    <td className="min-w-[140px] px-3 py-3">
                                                        <Input
                                                            value={unidad.identificador}
                                                            disabled
                                                            className="bg-muted"
                                                        />
                                                    </td>

                                                    {articulo.maneja_serial && (
                                                        <td className="min-w-[180px] px-3 py-3">
                                                            <Input
                                                                value={unidad.serial}
                                                                onChange={(e) =>
                                                                    cambiarUnidad(index, 'serial', e.target.value)
                                                                }
                                                                placeholder="Ingrese el serial"
                                                            />
                                                            {errorSerial && (
                                                                <p className="mt-1 text-xs text-destructive">
                                                                    {errorSerial}
                                                                </p>
                                                            )}
                                                        </td>
                                                    )}

                                                    <td className="min-w-[170px] px-3 py-3">
                                                        <select
                                                            value={unidad.estado_id}
                                                            onChange={(e) =>
                                                                cambiarUnidad(index, 'estado_id', e.target.value)
                                                            }
                                                            className="w-full rounded-md border bg-background px-3 py-2"
                                                        >
                                                            {estados.map((estado) => (
                                                                <option key={estado.id} value={estado.id}>
                                                                    {estado.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    <td className="min-w-[170px] px-3 py-3">
                                                        <select
                                                            value={unidad.ubicacion_id}
                                                            onChange={(e) =>
                                                                cambiarUnidad(index, 'ubicacion_id', e.target.value)
                                                            }
                                                            className="w-full rounded-md border bg-background px-3 py-2"
                                                        >
                                                            {ubicaciones.map((ubicacion) => (
                                                                <option key={ubicacion.id} value={ubicacion.id}>
                                                                    {ubicacion.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Link href={route('articulos.entradas', articulo.id)}>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>

                    <Button
                        type="submit"
                        disabled={processing || (articulo.control_individual && data.unidades.length === 0)}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}