import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import { Plus, Search, CheckCircle2, Package, Calendar, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Can } from "@/components/can";

const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
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
                        <DialogDescription>Información completa de los artículos retirados.</DialogDescription>
                    </DialogHeader>

                    {selectedSalida && (
                        <div className="space-y-6 mt-4">
                            
                            <div className="bg-muted/30 p-4 rounded-lg border border-slate-200">
                                <h3 className="flex items-center gap-2 font-bold mb-3 text-slate-800">
                                    <Calendar className="h-5 w-5" /> Datos de la Operación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Motivo</p>
                                        <p className="font-bold text-sm text-slate-800">{selectedSalida.motivo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fecha de Salida</p>
                                        <p className="font-medium text-sm">{formatFecha(selectedSalida.fecha)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Registrado por</p>
                                        <p className="font-medium text-sm text-slate-800">{selectedSalida.usuario_name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg border border-slate-200">
                                <h3 className="flex items-center gap-2 font-bold mb-3 text-slate-800">
                                    <Package className="h-5 w-5" /> Artículos Retirados
                                </h3>
                                <div className="space-y-4">
                                    {selectedSalida.detalles.map((detalle: any) => {
                                        const tieneSerial = detalle.serial && detalle.serial !== 'N/A' && detalle.serial !== 'null';

                                        return (
                                            <div key={detalle.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                    
                                                    <div className="space-y-3 border-l-4 border-blue-500 pl-3 flex-1">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Artículo</p>
                                                            <p className="font-bold text-lg text-red-600">
                                                                {detalle.articulo_nombre}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {detalle.marca} - {detalle.modelo}
                                                            </p>
                                                        </div>
                                                        
                                                        {tieneSerial && (
                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">ID del Equipo</p>
                                                                    <p className="font-medium text-sm">{detalle.identificador}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Serial Físico</p>
                                                                    <p className="font-medium text-sm">{detalle.serial}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="shrink-0 w-full md:w-auto text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                                                        <p className="text-xs text-muted-foreground mb-1">Cantidad Retirada</p>
                                                        <span className="bg-slate-100 border border-slate-200 text-slate-800 font-bold px-4 py-2 rounded-lg text-lg inline-block">
                                                            {parseInt(detalle.cantidad, 10)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg border border-slate-200">
                                <h3 className="flex items-center gap-2 font-bold mb-2 text-slate-800">
                                    <AlertCircle className="h-5 w-5" /> Observaciones
                                </h3>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {selectedSalida.observaciones || 'Sin observaciones registradas.'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}