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

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hayErrorDeStock) return;
        setShowConfirm(true);
    };

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
                                    
                                    <div className="w-full flex flex-col xl:flex-row gap-4 items-start">
                                        
                                        {/* ARTÍCULO */}
                                        <div className="flex-1 w-full min-w-[200px] space-y-2">
                                            <div className="h-5 flex items-center">
                                                <Label>Artículo <span className="text-red-500">*</span></Label>
                                            </div>
                                            <Select value={detalle.articulo_id ? String(detalle.articulo_id) : undefined} onValueChange={(val) => updateRow(index, 'articulo_id', val)}>
                                                <SelectTrigger className="w-full h-10 z-50 bg-background">
                                                    <SelectValue placeholder="Seleccione artículo..." />
                                                </SelectTrigger>
                                                <SelectContent className="z-50">
                                                    {articulos.map((a: any) => (
                                                        <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* SERIAL */}
                                        <div className="flex-1 w-full min-w-[200px] space-y-2">
                                            <div className="h-5 flex items-center">
                                                <Label className={esSerializado ? "text-slate-800 font-semibold" : "text-muted-foreground"}>
                                                    Serial (Unidad) {esSerializado && <span className="text-red-500 ml-1">*</span>}
                                                </Label>
                                            </div>
                                            {esSerializado ? (
                                                <Select value={detalle.articulo_unidad_id ? String(detalle.articulo_unidad_id) : undefined} onValueChange={(val) => updateRow(index, 'articulo_unidad_id', val)}>
                                                    <SelectTrigger className="w-full h-10 z-50 bg-background">
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
                                            ) : (
                                                <div className="h-10 flex items-center justify-center px-3 border border-input rounded-md bg-muted/50 text-muted-foreground">
                                                    -
                                                </div>
                                            )}
                                        </div>

                                        {/* CANTIDAD */}
                                        <div className="w-full md:w-32 space-y-2 shrink-0">
                                            <div className="h-5 flex items-center">
                                                <Label className={!esSerializado ? "text-slate-800 font-semibold" : "text-muted-foreground"}>
                                                    Cantidad {!esSerializado && <span className="text-red-500 ml-1">*</span>}
                                                </Label>
                                            </div>
                                            {!esSerializado ? (
                                                <Input 
                                                    type="number" 
                                                    min="1" 
                                                    step="1"
                                                    value={detalle.cantidad} 
                                                    onChange={e => updateRow(index, 'cantidad', parseInt(e.target.value) || 1)}
                                                    className={`h-10 ${excede ? "border-destructive focus-visible:ring-destructive bg-background" : "bg-background"}`} 
                                                />
                                            ) : (
                                                <div className="h-10 flex items-center justify-center px-3 border border-input rounded-md bg-muted/50 text-muted-foreground">
                                                    -
                                                </div>
                                            )}
                                        </div>

                                        {/* DISPONIBLE */}
                                        <div className="w-full md:w-24 space-y-2 shrink-0">
                                            <div className="h-5 flex items-center">
                                                <span className="text-xs text-muted-foreground">Disponible</span>
                                            </div>
                                            <div className="h-10 flex items-center">
                                                {detalle.articulo_id && !esSerializado ? (
                                                    <span className={excede ? "text-destructive font-bold" : "text-green-600 font-medium"}>
                                                        {stock}
                                                    </span>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </div>
                                        </div>

                                        {/* BOTÓN ELIMINAR */}
                                        <div className="w-full md:w-auto space-y-2 shrink-0">
                                            <div className="h-5 hidden md:block"></div>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => removeRow(index)} 
                                                disabled={data.detalles.length === 1} 
                                                className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
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
                                <div className="h-5 flex items-center">
                                    <Label>Fecha <span className="text-red-500 ml-1">*</span></Label>
                                </div>
                                <Input type="date" className="h-10" value={data.fecha} onChange={e => setData('fecha', e.target.value)} />
                                {errors.fecha && <span className="text-sm text-destructive">{errors.fecha}</span>}
                            </div>
                            <div className="space-y-2">
                                <div className="h-5 flex items-center">
                                    <Label>Motivo Breve <span className="text-red-500 ml-1">*</span></Label>
                                </div>
                                <Input className="h-10" placeholder="Ej: Requerimiento de personal" value={data.motivo} onChange={e => setData('motivo', e.target.value)} />
                                {errors.motivo && <span className="text-sm text-destructive">{errors.motivo}</span>}
                            </div>
                            
                            {tieneEquipos && (
                                <div className="space-y-2">
                                    <div className="h-5 flex items-center">
                                        <Label>Tipo de Salida <span className="text-red-500 ml-1">*</span></Label>
                                    </div>
                                    <Select value={data.tipo_salida} onValueChange={(val) => setData('tipo_salida', val)}>
                                        <SelectTrigger className="w-full h-10">
                                            <SelectValue placeholder="Seleccione el tipo..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="traspaso">Traspaso</SelectItem>
                                            <SelectItem value="desincorporacion">Desincorporación</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.tipo_salida && <span className="text-sm text-destructive">{errors.tipo_salida}</span>}
                                </div>
                            )}

                            {data.tipo_salida === 'traspaso' && (
                                <div className="space-y-2 md:col-span-3">
                                    <div className="h-5 flex items-center">
                                        <Label>Entidad o Persona que Recibe el Bien <span className="text-red-500 ml-1">*</span></Label>
                                    </div>
                                    <Input 
                                        className="h-10"
                                        placeholder="Ej: Alcaldía, Oficina de Recursos Humanos, etc." 
                                        value={data.entidad_destino} 
                                        onChange={e => setData('entidad_destino', e.target.value)} 
                                    />
                                    {errors.entidad_destino && <span className="text-sm text-destructive">{errors.entidad_destino}</span>}
                                </div>
                            )}
                            
                            <div className="space-y-2 md:col-span-3">
                                <div className="h-5 flex items-center">
                                    <Label>Observaciones (Opcional)</Label>
                                </div>
                                <Textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} rows={2} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" asChild><Link href={route('salidas.index')}>Cancelar</Link></Button>
                    <Button type="submit" disabled={processing || hayErrorDeStock}>{processing ? 'Guardando...' : submitLabel}</Button>
                </div>
            </form>

            {/* MODAL DE CONFIRMACIÓN */}
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
                            {data.tipo_salida === 'traspaso' && data.entidad_destino && (
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">Entregado a:</p>
                                    <p className="font-semibold">{data.entidad_destino}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowConfirm(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={(e) => handleConfirmSubmit(e)} disabled={processing}>
                            {processing ? 'Guardando...' : submitLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}