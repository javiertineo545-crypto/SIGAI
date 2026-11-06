import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';

export default function Form({ articulos = [], unidades = [], data, setData, errors, processing, onSubmit, submitLabel }: any) {
    
    const addRow = () => {
        setData('detalles', [...data.detalles, { _id: Date.now().toString() + Math.random().toString(), articulo_id: '', articulo_unidad_id: '', cantidad: 1 }]);
    };

    const removeRow = (index: number) => {
        setData('detalles', data.detalles.filter((_: any, i: number) => i !== index));
    };

    const updateRow = (index: number, field: string, value: any) => {
        const newDetalles = [...data.detalles];
        newDetalles[index][field] = value;
        if (field === 'articulo_id') {
            newDetalles[index].articulo_unidad_id = '';
            newDetalles[index].cantidad = 1;
        }
        setData('detalles', newDetalles);
    };

    const getArticuloInfo = (id: string | number) => {
        return articulos.find((a: any) => a.id === Number(id)) || null;
    };

    const getUnidadesDeArticulo = (articulo_id: string | number) => {
        if (!articulo_id) return [];
        return unidades.filter((u: any) => u.articulo_id === Number(articulo_id));
    };

    let hayErrorDeStock = false;

    return (
        <form onSubmit={onSubmit} className="space-y-6 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Datos de la Salida</CardTitle>
                    <CardDescription>Información de la operación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input type="date" value={data.fecha} onChange={e => setData('fecha', e.target.value)} />
                            {errors.fecha && <span className="text-sm text-destructive">{errors.fecha}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Motivo</Label>
                            <Input placeholder="Ej: Solicitud / Baja de equipo" value={data.motivo} onChange={e => setData('motivo', e.target.value)} />
                            {errors.motivo && <span className="text-sm text-destructive">{errors.motivo}</span>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Observaciones (Opcional)</Label>
                            <Textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} rows={2} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Artículos a Retirar</CardTitle>
                        <CardDescription>Si eliges un equipo, se te pedirá el serial.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addRow}>
                        <Plus className="mr-2 h-4 w-4" /> Añadir Artículo
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.detalles.map((detalle: any, index: number) => {
                        const articulo = getArticuloInfo(detalle.articulo_id);
                        const esSerializado = Number(articulo?.control_individual) === 1;
                        const unidadesArticulo = getUnidadesDeArticulo(detalle.articulo_id);
                        
                        const stock = articulo ? parseFloat(String(articulo.stock)) : 0;
                        const excede = detalle.articulo_id ? (!esSerializado && Number(detalle.cantidad) > stock) : false;
                        if (excede) hayErrorDeStock = true;

                        const todasAsignadas = esSerializado && unidadesArticulo.length > 0 && unidadesArticulo.every((u: any) => u.asignaciones && u.asignaciones.length > 0);

                        return (
                            <div key={detalle._id || index} className={`w-full flex flex-col gap-4 p-3 rounded-lg border transition-all ${excede || todasAsignadas ? 'bg-destructive/5 border-destructive/50' : 'bg-muted/30'}`}>
                                
                                <div className="w-full flex flex-col xl:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full min-w-[200px] space-y-2">
                                        <Label>Artículo</Label>
                                        <Select value={detalle.articulo_id ? String(detalle.articulo_id) : undefined} onValueChange={(val) => updateRow(index, 'articulo_id', val)}>
                                            <SelectTrigger className="w-full z-50"><SelectValue placeholder="Seleccione artículo..." /></SelectTrigger>
                                            <SelectContent className="z-50">
                                                {articulos.map((a: any) => (
                                                    <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {esSerializado && (
                                        <div className="flex-1 w-full min-w-[200px] space-y-2">
                                            <Label>Serial (Unidad)</Label>
                                            <Select value={detalle.articulo_unidad_id ? String(detalle.articulo_unidad_id) : undefined} onValueChange={(val) => updateRow(index, 'articulo_unidad_id', val)}>
                                                <SelectTrigger className="w-full z-50"><SelectValue placeholder="Seleccione el serial..." /></SelectTrigger>
                                                <SelectContent className="z-50">
                                                    {unidadesArticulo.length === 0 ? (
                                                        <SelectItem value="no-data" disabled>No hay unidades registradas</SelectItem>
                                                    ) : (
                                                        unidadesArticulo.map((u: any) => {
                                                            const estaAsignado = u.asignaciones && u.asignaciones.length > 0;
                                                            const dueno = estaAsignado ? u.asignaciones[0].personnel : null;

                                                            return (
                                                                <SelectItem 
                                                                    key={u.id} 
                                                                    value={String(u.id)}
                                                                    disabled={estaAsignado}
                                                                    className={estaAsignado ? "opacity-50 cursor-not-allowed" : ""}
                                                                >
                                                                    {u.identificador} {u.serial ? `(${u.serial})` : ''}
                                                                    {estaAsignado && (
                                                                        <span className="text-destructive font-bold ml-2">
                                                                            [Asignado a: {dueno?.first_name} {dueno?.last_name}]
                                                                        </span>
                                                                    )}
                                                                </SelectItem>
                                                            );
                                                        })
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {!esSerializado && (
                                        <div className="w-full md:w-32 space-y-2 shrink-0">
                                            <Label>Cantidad</Label>
                                            <Input type="number" min="1" step="0.01" value={detalle.cantidad} onChange={e => updateRow(index, 'cantidad', parseFloat(e.target.value) || 0)} className={excede ? "border-destructive focus-visible:ring-destructive" : ""} />
                                        </div>
                                    )}

                                    <div className="w-full md:w-24 pb-3 text-sm font-medium shrink-0">
                                        {detalle.articulo_id && !esSerializado ? (
                                            <span className={excede ? "text-destructive font-bold" : "text-green-600"}>Disp: {stock}</span>
                                        ) : <span className="text-muted-foreground">-</span>}
                                    </div>

                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeRow(index)} disabled={data.detalles.length === 1} className="shrink-0 mb-0.5">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {todasAsignadas && (
                                    <div className="w-full flex items-center gap-2 text-destructive text-sm font-bold mt-2 bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                       No se puede retirar este artículo porque todas sus unidades están asignadas a otros trabajadores.
                                    </div>
                                )}

                                {excede && (
                                    <div className="w-full flex items-center gap-2 text-destructive text-sm font-bold mt-2 bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                        <AlertTriangle className="h-5 w-5 shrink-0" /> ¡Atención! Estás pidiendo {detalle.cantidad} en total, pero solo hay {stock} disponibles.
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {errors.detalles && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md font-medium border border-destructive/20">{errors.detalles}</div>}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild><Link href={route('salidas.index')}>Cancelar</Link></Button>
                <Button type="submit" disabled={processing || hayErrorDeStock}>{processing ? 'Guardando...' : submitLabel}</Button>
            </div>
        </form>
    );
}