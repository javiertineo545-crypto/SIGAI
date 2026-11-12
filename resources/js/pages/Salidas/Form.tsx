import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Plus, AlertTriangle, CheckCircle2, Package } from 'lucide-react';
import { useState } from 'react';

export default function Form({ articulos = [], unidades = [], data, setData, errors, processing, onSubmit, submitLabel }: any) {
    
    const [showConfirm, setShowConfirm] = useState(false);

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

    const getUnidadInfo = (id: string | number) => {
        return unidades.find((u: any) => u.id === Number(id)) || null;
    };

    const getUnidadesDeArticulo = (articulo_id: string | number) => {
        if (!articulo_id) return [];
        return unidades.filter((u: any) => u.articulo_id === Number(articulo_id));
    };

    let hayErrorDeStock = false;

    const tieneEquipos = data.detalles.some((detalle: any) => {
        const art = getArticuloInfo(detalle.articulo_id);
        return Number(art?.control_individual) === 1;
    });

    // Intercepta el botón de guardar para abrir el modal
    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hayErrorDeStock) return;
        setShowConfirm(true); // Abre la ventana de confirmación
    };

    // Confirmación final que envía los datos
    const handleConfirmSubmit = (e: React.FormEvent) => {
        setShowConfirm(false);
        onSubmit(e);
    };

    return (
        <>
            <form onSubmit={handlePreSubmit} className="space-y-6 w-full">
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Artículos a Retirar</CardTitle>
                            <CardDescription>Selecciona el artículo y completa sus detalles.</CardDescription>
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
                            
                            const stock = articulo ? parseInt(articulo.stock, 10) : 0;
                            const excede = detalle.articulo_id ? (!esSerializado && Number(detalle.cantidad) > stock) : false;
                            if (excede) hayErrorDeStock = true;

                            return (
                                <div key={detalle._id || index} className={`w-full flex flex-col gap-2 p-3 rounded-lg border transition-all ${excede ? 'bg-destructive/5 border-destructive/50' : 'bg-muted/30'}`}>
                                    
                                    <div className="w-full flex flex-col xl:flex-row gap-4 items-end">
                                        
                                        <div className="flex-1 w-full min-w-[200px] space-y-2">
                                            <Label>Artículo</Label>
                                            <Select value={detalle.articulo_id ? String(detalle.articulo_id) : undefined} onValueChange={(val) => updateRow(index, 'articulo_id', val)}>
                                                <SelectTrigger className="w-full z-50 bg-background">
                                                    <SelectValue placeholder="Seleccione artículo..." />
                                                </SelectTrigger>
                                                <SelectContent className="z-50">
                                                    {articulos.map((a: any) => (
                                                        <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {esSerializado && (
                                            <div className="flex-1 w-full min-w-[200px] space-y-2">
                                                <Label className="text-primary font-semibold">Serial (Unidad)</Label>
                                                <Select value={detalle.articulo_unidad_id ? String(detalle.articulo_unidad_id) : undefined} onValueChange={(val) => updateRow(index, 'articulo_unidad_id', val)}>
                                                    <SelectTrigger className="w-full z-50 bg-background">
                                                        <SelectValue placeholder="Seleccione el serial..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="z-50">
                                                        {unidadesArticulo.length === 0 ? (
                                                            <SelectItem value="no-data" disabled>No hay equipos disponibles</SelectItem>
                                                        ) : (
                                                            unidadesArticulo.map((u: any) => (
                                                                <SelectItem key={u.id} value={String(u.id)}>
                                                                    {u.identificador} {u.serial ? `(${u.serial})` : ''}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {!esSerializado && detalle.articulo_id && (
                                            <>
                                                <div className="w-full md:w-32 space-y-2 shrink-0">
                                                    <Label className="text-primary font-semibold">Cantidad</Label>
                                                    <Input 
                                                        type="number" 
                                                        min="1" 
                                                        step="1"
                                                        value={detalle.cantidad} 
                                                        onChange={e => updateRow(index, 'cantidad', parseInt(e.target.value) || 1)}
                                                        className={excede ? "border-destructive focus-visible:ring-destructive bg-background" : "bg-background"} 
                                                    />
                                                </div>
                                                <div className="w-full md:w-24 pb-3 text-sm font-medium shrink-0">
                                                    <span className={excede ? "text-destructive font-bold" : "text-green-600"}>
                                                        Disp: {stock}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeRow(index)} 
                                            disabled={data.detalles.length === 1} 
                                            className="shrink-0 mb-0.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {excede && (
                                        <div className="w-full flex items-center gap-2 text-destructive text-sm font-bold mt-2 bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                            <AlertTriangle className="h-5 w-5 shrink-0" /> ¡Atención! Estás pidiendo {detalle.cantidad}, pero solo hay {stock} disponibles.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        
                        {errors.detalles && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md font-medium border border-destructive/20">{errors.detalles}</div>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos de la Salida</CardTitle>
                        <CardDescription>Información administrativa de la operación.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input type="date" value={data.fecha} onChange={e => setData('fecha', e.target.value)} />
                                {errors.fecha && <span className="text-sm text-destructive">{errors.fecha}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Motivo Breve</Label>
                                <Input placeholder="Ej: Requerimiento de personal" value={data.motivo} onChange={e => setData('motivo', e.target.value)} />
                                {errors.motivo && <span className="text-sm text-destructive">{errors.motivo}</span>}
                            </div>
                            
                            {tieneEquipos && (
                                <div className="space-y-2">
                                    <Label>Tipo de Salida</Label>
                                    <Select value={data.tipo_salida} onValueChange={(val) => setData('tipo_salida', val)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione el tipo..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="traslado">Traslado (Temporal)</SelectItem>
                                            <SelectItem value="desincorporacion">Desincorporación (Baja Definitiva)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.tipo_salida && <span className="text-sm text-destructive">{errors.tipo_salida}</span>}
                                </div>
                            )}
                            
                            <div className="space-y-2 md:col-span-3">
                                <Label>Observaciones (Opcional)</Label>
                                <Textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} rows={2} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" asChild><Link href={route('salidas.index')}>Cancelar</Link></Button>
                    {/* Este botón ahora abre el Modal en lugar de guardar directo */}
                    <Button type="submit" disabled={processing || hayErrorDeStock}>
                        {processing ? 'Guardando...' : submitLabel}
                    </Button>
                </div>
            </form>

            {/* VENTANA DE CONFIRMACIÓN */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-primary">
                            <CheckCircle2 className="h-6 w-6" /> Confirmar Registro de Salida
                        </DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea registrar esta salida? Verifique el resumen antes de continuar.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted/30 p-4 rounded-lg border my-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Fecha</p>
                                <p className="font-semibold">{data.fecha}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Motivo</p>
                                <p className="font-semibold">{data.motivo}</p>
                            </div>
                            {tieneEquipos && (
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">Tipo de Salida</p>
                                    <p className="font-bold text-primary capitalize">{data.tipo_salida}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <p className="text-xs text-muted-foreground mb-2">Artículos a Retirar:</p>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                {data.detalles.map((detalle: any, i: number) => {
                                    const art = getArticuloInfo(detalle.articulo_id);
                                    const uni = getUnidadInfo(detalle.articulo_unidad_id);
                                    return (
                                        <div key={i} className="flex items-start gap-2 bg-background p-2 rounded border shadow-sm">
                                            <Package className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-red-600">{art?.nombre}</p>
                                                {uni && (
                                                    <p className="text-xs text-muted-foreground">
                                                        <strong>ID:</strong> {uni.identificador} | <strong>Serial:</strong> {uni.serial || 'N/A'}
                                                    </p>
                                                )}
                                                <p className="text-xs font-bold mt-1 text-slate-700">
                                                    Cantidad: {detalle.cantidad}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmSubmit} disabled={processing} className="bg-primary text-primary-foreground">
                            {processing ? 'Guardando...' : 'Sí, registrar salida'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}