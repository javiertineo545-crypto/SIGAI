import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, User, FileText, Settings2 } from 'lucide-react';

export default function Form({
    articulos = [],
    unidades = [],
    personnels = [],
    ubicaciones = [],
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel
}: any) {
    const articuloSeleccionado = articulos.find((a: any) => a.id === Number(data.articulo_id));
    const esSerializado = Number(articuloSeleccionado?.control_individual) === 1;
    const unidadesFiltradas = unidades.filter((u: any) => u.articulo_id === Number(data.articulo_id));

    const handleArticuloChange = (val: string) => {
        setData('articulo_id', val);
        setData('articulo_unidad_id', '');
        setData('cantidad', 1);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-8 w-full max-w-5xl mx-auto">
            <Card className="rounded-2xl shadow-sm border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6 border-b border-border/50">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" /> Datos de la Asignación
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        Completa la información para registrar la entrega de un equipo o consumible.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6 md:p-8 space-y-10">
                    
                    {/* SECCIÓN 1: ARTÍCULO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm text-foreground">Artículo / Equipo</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 md:col-span-3">
                                <Label className="text-sm font-medium">Artículo o Equipo a Entregar <span className="text-red-500">*</span></Label>
                                <Select value={data.articulo_id ? String(data.articulo_id) : undefined} onValueChange={handleArticuloChange}>
                                    <SelectTrigger className="w-full h-11 rounded-lg bg-background">
                                        <SelectValue placeholder="Seleccione qué se va a entregar..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-50 rounded-lg">
                                        {articulos.map((a: any) => (
                                            <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className={esSerializado ? "text-sm font-medium" : "text-sm font-medium text-muted-foreground"}>
                                    Serial (Unidad) {esSerializado && <span className="text-red-500">*</span>}
                                </Label>
                                {esSerializado ? (
                                    <Select value={data.articulo_unidad_id ? String(data.articulo_unidad_id) : undefined} onValueChange={(val) => setData('articulo_unidad_id', val)}>
                                        <SelectTrigger className="w-full h-11 rounded-lg bg-background">
                                            <SelectValue placeholder="Seleccione el serial..." />
                                        </SelectTrigger>
                                        <SelectContent className="z-50 rounded-lg">
                                            {unidadesFiltradas.map((u: any) => (
                                                <SelectItem key={u.id} value={String(u.id)}>{u.identificador} {u.serial ? `(${u.serial})` : ''}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="h-11 flex items-center justify-center px-3 border border-input rounded-lg bg-muted/40 text-muted-foreground text-sm">
                                        No aplica (Producto sin serial)
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className={!esSerializado ? "text-sm font-medium" : "text-sm font-medium text-muted-foreground"}>
                                    Cantidad {!esSerializado && <span className="text-red-500">*</span>}
                                </Label>
                                {!esSerializado && data.articulo_id ? (
                                    <Input type="number" min="1" className="h-11 rounded-lg" value={data.cantidad} onChange={e => setData('cantidad', parseInt(e.target.value) || 1)} />
                                ) : (
                                    <div className="h-11 flex items-center justify-center px-3 border border-input rounded-lg bg-muted/40 text-muted-foreground text-sm">-</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: TRABAJADOR Y FECHAS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm text-foreground">Información de la Entrega</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Trabajador <span className="text-red-500">*</span></Label>
                                <Select value={data.personnel_id ? String(data.personnel_id) : undefined} onValueChange={(val) => setData('personnel_id', val)}>
                                    <SelectTrigger className="w-full h-11 rounded-lg bg-background">
                                        <SelectValue placeholder="Seleccione el trabajador..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-50 rounded-lg">
                                        {personnels.map((p: any) => (
                                            <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name} (C.I: {p.id_number})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Fecha de Asignación <span className="text-red-500">*</span></Label>
                                <Input type="date" className="h-11 rounded-lg" value={data.fecha_asignacion} onChange={e => setData('fecha_asignacion', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: TIPO Y LÓGICA CONDICIONAL */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Settings2 className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm text-foreground">Configuración de la Asignación</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium">Tipo de Asignación <span className="text-red-500">*</span></Label>
                                <Select value={data.tipo_asignacion} onValueChange={(val) => setData('tipo_asignacion', val)}>
                                    <SelectTrigger className="w-full h-11 rounded-lg bg-background">
                                        <SelectValue placeholder="Seleccione el tipo..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        <SelectItem value="prestamo">Préstamo</SelectItem>
                                        <SelectItem value="traslado">Traslado</SelectItem>
                                        <SelectItem value="guarda_custodia">Guarda y Custodia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Lógica Préstamo */}
                            {data.tipo_asignacion === 'prestamo' && (
                                <>
                                    <div className="md:col-span-2 flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 bg-muted/20">
                                        <Checkbox 
                                            id="es_tiempo_indefinido" 
                                            checked={data.es_tiempo_indefinido} 
                                            onCheckedChange={(checked) => {
                                                setData('es_tiempo_indefinido', checked as boolean);
                                                if(checked) setData('fecha_estimada_devolucion', '');
                                            }} 
                                            className="rounded-md"
                                        />
                                        <div className="space-y-1 leading-none">
                                            <Label htmlFor="es_tiempo_indefinido" className="cursor-pointer font-medium text-sm">
                                                Tiempo Indefinido
                                            </Label>
                                            <p className="text-xs text-muted-foreground">El equipo no tiene fecha de devolución definida.</p>
                                        </div>
                                    </div>

                                    {!data.es_tiempo_indefinido && (
                                        <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label className="text-sm font-medium">Fecha Estimada de Devolución</Label>
                                            <Input 
                                                type="date" 
                                                className="h-11 rounded-lg" 
                                                value={data.fecha_estimada_devolucion} 
                                                onChange={e => setData('fecha_estimada_devolucion', e.target.value)} 
                                                min={data.fecha_asignacion}
                                            />
                                            {errors.fecha_estimada_devolucion && <p className="text-sm text-red-500">{errors.fecha_estimada_devolucion}</p>}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Lógica Traslado */}
                            {data.tipo_asignacion === 'traslado' && (
                                <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label className="text-sm font-medium">Nueva Ubicación / Destino</Label>
                                    <Select value={data.ubicacion_destino_id ? String(data.ubicacion_destino_id) : undefined} onValueChange={(val) => setData('ubicacion_destino_id', val)}>
                                        <SelectTrigger className="w-full h-11 rounded-lg bg-background">
                                            <SelectValue placeholder="Seleccione la ubicación..." />
                                        </SelectTrigger>
                                        <SelectContent className="z-50 rounded-lg">
                                            {ubicaciones.map((u: any) => (
                                                <SelectItem key={u.id} value={String(u.id)}>{u.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN 4: EXTRAS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm text-foreground">Detalles Adicionales (Opcional)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Condición del Producto</Label>
                                <Input className="h-11 rounded-lg" value={data.condicion_entrega} onChange={e => setData('condicion_entrega', e.target.value)} placeholder="Ej: Buen estado, con rayones leves..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Observaciones</Label>
                                <Textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} placeholder="Notas adicionales..." rows={1} className="rounded-lg resize-none" />
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" asChild className="h-11 px-6 rounded-lg">
                    <Link href={route('asignaciones.index')}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={processing} className="h-11 px-8 rounded-lg shadow-md">
                    {processing ? 'Guardando...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}