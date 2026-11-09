import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    FileDown, 
    FileText, 
    Calendar as CalendarIcon, 
    Box, 
    Laptop, 
    PackagePlus, 
    PackageMinus, 
    UserCheck 
} from 'lucide-react';

interface FormProps {
    data: any;
    setData: (key: string, value: any) => void;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function Form({ data, setData, processing, onSubmit }: FormProps) {
    
    const today = new Date().toISOString().split('T')[0];

    const toggleModulo = (modulo: string) => {
        setData('modulos', 
            data.modulos.includes(modulo) 
                ? data.modulos.filter((m: string) => m !== modulo)
                : [...data.modulos, modulo]
        );
    };

    return (
        <form onSubmit={onSubmit} className="w-full">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-6 w-6 text-primary" /> Configurar Reporte
                    </CardTitle>
                    <CardDescription>
                        Selecciona qué información deseas incluir. Puedes marcar varias opciones a la vez.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">¿Qué módulos deseas exportar?</Label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            
                            {/* INVENTARIO */}
                            <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                                data.modulos.includes('inventario') 
                                    ? 'bg-primary/10 border-primary dark:bg-primary/20' 
                                    : 'bg-transparent border-border hover:bg-muted/50'
                            }`}>
                                <Checkbox 
                                    id="inventario" 
                                    checked={data.modulos.includes('inventario')} 
                                    onCheckedChange={() => toggleModulo('inventario')}
                                    className="mt-1"
                                />
                                <div className="flex flex-col">
                                    <Label htmlFor="inventario" className="cursor-pointer font-bold flex items-center gap-2">
                                        <Box className="h-4 w-4 text-primary" /> Inventario
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Stock actual</span>
                                </div>
                            </div>

                            {/* UNIDADES FÍSICAS */}
                            <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                                data.modulos.includes('unidades') 
                                    ? 'bg-primary/10 border-primary dark:bg-primary/20' 
                                    : 'bg-transparent border-border hover:bg-muted/50'
                            }`}>
                                <Checkbox 
                                    id="unidades" 
                                    checked={data.modulos.includes('unidades')} 
                                    onCheckedChange={() => toggleModulo('unidades')}
                                    className="mt-1"
                                />
                                <div className="flex flex-col">
                                    <Label htmlFor="unidades" className="cursor-pointer font-bold flex items-center gap-2">
                                        <Laptop className="h-4 w-4 text-primary" /> Unidades
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Equipos con serial</span>
                                </div>
                            </div>

                            {/* ENTRADAS */}
                            <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                                data.modulos.includes('entradas') 
                                    ? 'bg-primary/10 border-primary dark:bg-primary/20' 
                                    : 'bg-transparent border-border hover:bg-muted/50'
                            }`}>
                                <Checkbox 
                                    id="entradas" 
                                    checked={data.modulos.includes('entradas')} 
                                    onCheckedChange={() => toggleModulo('entradas')}
                                    className="mt-1"
                                />
                                <div className="flex flex-col">
                                    <Label htmlFor="entradas" className="cursor-pointer font-bold flex items-center gap-2">
                                        <PackagePlus className="h-4 w-4 text-primary" /> Entradas
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Compras</span>
                                </div>
                            </div>

                            {/* SALIDAS */}
                            <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                                data.modulos.includes('salidas') 
                                    ? 'bg-primary/10 border-primary dark:bg-primary/20' 
                                    : 'bg-transparent border-border hover:bg-muted/50'
                            }`}>
                                <Checkbox 
                                    id="salidas" 
                                    checked={data.modulos.includes('salidas')} 
                                    onCheckedChange={() => toggleModulo('salidas')}
                                    className="mt-1"
                                />
                                <div className="flex flex-col">
                                    <Label htmlFor="salidas" className="cursor-pointer font-bold flex items-center gap-2">
                                        <PackageMinus className="h-4 w-4 text-primary" /> Salidas
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Retiros</span>
                                </div>
                            </div>

                            {/* ASIGNACIONES */}
                            <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                                data.modulos.includes('asignaciones') 
                                    ? 'bg-primary/10 border-primary dark:bg-primary/20' 
                                    : 'bg-transparent border-border hover:bg-muted/50'
                            }`}>
                                <Checkbox 
                                    id="asignaciones" 
                                    checked={data.modulos.includes('asignaciones')} 
                                    onCheckedChange={() => toggleModulo('asignaciones')}
                                    className="mt-1"
                                />
                                <div className="flex flex-col">
                                    <Label htmlFor="asignaciones" className="cursor-pointer font-bold flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-primary" /> Asignaciones
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Entregas</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                        <div className="space-y-3">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" /> Fecha de Inicio
                            </Label>
                            <Input 
                                type="date" 
                                value={data.fecha_inicio} 
                                max={today}
                                onChange={e => setData('fecha_inicio', e.target.value)} 
                                className="bg-transparent border-input focus-visible:ring-primary"
                            />
                        </div>
                        
                        <div className="space-y-3">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" /> Fecha de Fin
                            </Label>
                            <Input 
                                type="date" 
                                value={data.fecha_fin} 
                                max={today}
                                onChange={e => setData('fecha_fin', e.target.value)} 
                                className="bg-transparent border-input focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button 
                            id="btn-generar-pdf" 
                            type="submit" 
                            disabled={processing}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 py-6 text-lg shadow-lg"
                        >
                            <FileDown className="h-5 w-5" /> {processing ? 'Generando...' : 'Descargar PDF'}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </form>
    );
}