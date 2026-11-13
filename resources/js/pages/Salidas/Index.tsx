import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import { Plus, Search, CheckCircle2, Package, Calendar, AlertCircle, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Can } from "@/components/can";
import QRCodeDisplay from '@/components/QRCodeDisplay';

const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

const formatTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
        'traspaso': 'Traspaso',
        'desincorporacion': 'Desincorporación'
    };
    return tipos[tipo] || tipo || 'No aplica';
};

export default function Index({ salidas, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const { props } = usePage();
    const flash = props.flash as { success?: string };
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedSalida, setSelectedSalida] = useState<any>(null);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('salidas.index'), { search }, { preserveState: true });
    };

    const columns = getColumns((salida) => setSelectedSalida(salida));

    return (
        <AppLayout breadcrumbs={[{ title: 'Salidas', href: route('salidas.index') }]}>
            <Head title="Gestión de Salidas" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 w-full relative">
                {showSuccess && (
                    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-5">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">{flash.success}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Salidas de Inventario</h1>
                        <p className="text-muted-foreground">Control de artículos y equipos retirados.</p>
                    </div>
                    
                    <Can permission="salidas.create">
                        <Button asChild>
                            <Link href={route('salidas.create')}>
                                <Plus className="mr-2 h-4 w-4" /> Nueva Salida
                            </Link>
                        </Button>
                    </Can>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <Input placeholder="Buscar por artículo o modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
                    <Button type="submit" variant="secondary"><Search className="h-4 w-4" /></Button>
                </form>

                <div className="rounded-md border bg-card">
                    <DataTable columns={columns} data={salidas.data} paginationLinks={salidas.links} />
                </div>
            </div>

            <Dialog open={!!selectedSalida} onOpenChange={(open) => !open && setSelectedSalida(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Detalle de la Salida</DialogTitle>
                        <DialogDescription>Información de la operación y artículos retirados.</DialogDescription>
                    </DialogHeader>

                    {selectedSalida && (
                        <div className="space-y-6 mt-4">
                            
                            {/* DATOS DE LA OPERACIÓN */}
                            <div className="bg-muted/40 p-5 rounded-lg border border-border">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-foreground">
                                    <Calendar className="h-5 w-5" /> Datos de la Operación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Motivo</p>
                                        <p className="font-bold text-base text-foreground">{selectedSalida.motivo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tipo de Salida</p>
                                        <p className={`font-bold text-base ${selectedSalida.tipo_salida === 'desincorporacion' ? 'text-destructive' : 'text-orange-600 dark:text-orange-400'}`}>
                                            {formatTipo(selectedSalida.tipo_salida)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fecha de Salida</p>
                                        <p className="font-medium text-base text-foreground">{formatFecha(selectedSalida.fecha)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Registrado por</p>
                                        <p className="font-medium text-base text-foreground">{selectedSalida.usuario_name}</p>
                                    </div>
                                </div>

                                {/* AQUÍ ESTÁ EL RECUADRO DE ENTIDAD DESTINO */}
                                {selectedSalida.tipo_salida === 'traspaso' && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-xs text-foreground dark:text-red-400 font-semibold mb-1 flex items-center gap-1">
                                            <User className="h-3 w-3" /> Entregado a (Entidad/Persona)
                                        </p>
                                        <p className="font-bold text-red-600 dark:text-red-400 text-base">
                                            {selectedSalida.entidad_destino || 'No registrado'}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> Observaciones
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm text-foreground">
                                        {selectedSalida.observaciones || 'Sin observaciones registradas.'}
                                    </p>
                                </div>
                            </div>

                            {/* ARTÍCULOS */}
                            <div className="bg-muted/40 p-5 rounded-lg border border-border">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-foreground">
                                    <Package className="h-5 w-5" /> Artículos Retirados
                                </h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {selectedSalida.detalles.map((detalle: any) => {
                                        const esEquipo = detalle.identificador && detalle.identificador !== 'N/A';

                                        return (
                                            <div key={detalle.id} className="bg-card p-4 rounded-lg shadow-sm border border-border w-full transition-all">
                                                
                                                {esEquipo ? (
                                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                                        <div className="space-y-3 border-l-4 border-blue-500 pl-4 flex-1">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Artículo</p>
                                                                <p className="font-bold text-lg text-destructive">
                                                                    {detalle.articulo_nombre}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {detalle.marca} - {detalle.modelo}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">ID del Equipo</p>
                                                                    <p className="font-medium text-sm text-foreground">{detalle.identificador}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Serial Físico</p>
                                                                    <p className="font-medium text-sm text-foreground">{detalle.serial !== 'N/A' ? detalle.serial : 'No registrado'}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Cantidad Retirada</p>
                                                                <span className="bg-muted text-foreground border border-border font-bold px-3 py-1 rounded text-sm inline-block">
                                                                    {parseInt(detalle.cantidad, 10)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0 w-full md:w-auto flex justify-center">
                                                            <QRCodeDisplay 
                                                                value={detalle.identificador} 
                                                                articulo={detalle.articulo_nombre}
                                                                serial={detalle.serial}
                                                                label="Código QR" 
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-l-4 border-blue-500 pl-4">
                                                        <div className="md:col-span-2">
                                                            <p className="text-xs text-muted-foreground">Artículo</p>
                                                            <p className="font-bold text-lg text-destructive">
                                                                {detalle.articulo_nombre}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {detalle.marca} - {detalle.modelo}
                                                            </p>
                                                            
                                                            <span className="flex items-center gap-1 mt-1">
                                                                <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                                    Consumible
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Cantidad Retirada</p>
                                                            <p className="font-bold text-lg mt-1 text-foreground">
                                                                {parseInt(detalle.cantidad, 10)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}