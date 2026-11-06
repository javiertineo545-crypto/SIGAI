import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface FormProps {
    articulos?: any[];
    unidades?: any[];
    personnels?: any[];
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
}

export default function Form({ 
    articulos = [], 
    unidades = [], 
    personnels = [], 
    data, 
    setData, 
    errors, 
    processing, 
    onSubmit, 
    submitLabel 
}: FormProps) {
    
    const articuloSeleccionado = articulos.find((a: any) => a.id === Number(data.articulo_id));
    const esSerializado = Number(articuloSeleccionado?.control_individual) === 1;

    const unidadesFiltradas = unidades.filter((u: any) => u.articulo_id === Number(data.articulo_id));

    const handleArticuloChange = (val: string) => {
        setData('articulo_id', val);
        setData('articulo_unidad_id', '');
        setData('cantidad', 1);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Datos de la Asignación</CardTitle>
                    <CardDescription>Selecciona el artículo o equipo y el trabajador que lo recibirá.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-2 md:col-span-2">
                            <Label>Artículo o Equipo a Entregar</Label>
                            <Select 
                                value={data.articulo_id ? String(data.articulo_id) : undefined} 
                                onValueChange={handleArticuloChange}
                            >
                                <SelectTrigger className="w-full z-50">
                                    <SelectValue placeholder="Seleccione qué se va a entregar..." />
                                </SelectTrigger>
                                <SelectContent className="z-50">
                                    {articulos.length === 0 ? (
                                        <SelectItem value="no-data" disabled>No hay artículos en el inventario</SelectItem>
                                    ) : (
                                        articulos.map((a: any) => (
                                            <SelectItem key={a.id} value={String(a.id)}>
                                                {a.nombre}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.articulo_id && <span className="text-sm text-destructive">{errors.articulo_id}</span>}
                        </div>

                        {esSerializado && (
                            <div className="space-y-2">
                                <Label>Serial del Equipo</Label>
                                <Select 
                                    value={data.articulo_unidad_id ? String(data.articulo_unidad_id) : undefined} 
                                    onValueChange={(val) => setData('articulo_unidad_id', val)}
                                >
                                    <SelectTrigger className="w-full z-50">
                                        <SelectValue placeholder="Seleccione el serial..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-50">
                                        {unidadesFiltradas.length === 0 ? (
                                            <SelectItem value="no-data" disabled>No hay equipos disponibles</SelectItem>
                                        ) : (
                                            unidadesFiltradas.map((u: any) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    {u.identificador} {u.serial ? `(${u.serial})` : ''}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.articulo_unidad_id && <span className="text-sm text-destructive">{errors.articulo_unidad_id}</span>}
                            </div>
                        )}

                        {!esSerializado && data.articulo_id && (
                            <div className="space-y-2">
                                <Label>Cantidad a entregar (Consumible)</Label>
                                <Input 
                                    type="number" 
                                    min="1"
                                    step="1"
                                    value={data.cantidad} 
                                    onChange={e => setData('cantidad', parseInt(e.target.value) || 1)} 
                                />
                                {errors.cantidad && <span className="text-sm text-destructive">{errors.cantidad}</span>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Trabajador</Label>
                            <Select 
                                value={data.personnel_id ? String(data.personnel_id) : undefined} 
                                onValueChange={(val) => setData('personnel_id', val)}
                            >
                                <SelectTrigger className="w-full z-50">
                                    <SelectValue placeholder="Seleccione el trabajador..." />
                                </SelectTrigger>
                                <SelectContent className="z-50">
                                    {personnels.map((p: any) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.first_name} {p.last_name} (C.I: {p.id_number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.personnel_id && <span className="text-sm text-destructive">{errors.personnel_id}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Asignación</Label>
                            <Input 
                                type="date" 
                                value={data.fecha_asignacion} 
                                onChange={e => setData('fecha_asignacion', e.target.value)} 
                            />
                            {errors.fecha_asignacion && <span className="text-sm text-destructive">{errors.fecha_asignacion}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                            <Label>Condición del Producto</Label>
                            <Input 
                                value={data.condicion_entrega} 
                                onChange={e => setData('condicion_entrega', e.target.value)}
                                placeholder="Ej: Buen estado, con rasguños, etc..." 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Observaciones Adicionales</Label>
                            <Textarea 
                                value={data.observaciones} 
                                onChange={e => setData('observaciones', e.target.value)} 
                                placeholder="Ej: Se entrega con cargador y estuche..."
                                rows={1}
                            />
                        </div>
                    </div>

                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('asignaciones.index')}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}