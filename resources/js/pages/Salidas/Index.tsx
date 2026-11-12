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
import QRCodeDisplay from '@/components/QRCodeDisplay';

const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

const formatTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
        'traslado': 'Traslado',
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

            {/* MODAL DE DETALLES VERTICAL */}
            <Dialog open={!!selectedSalida} onOpenChange={(open) => !open && setSelectedSalida(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Detalle de la Salida</DialogTitle>
                        <DialogDescription>Información de la operación y artículos retirados.</DialogDescription>
                    </DialogHeader>

                    {selectedSalida && (
                        <div className="space-y-6 mt-4">
                            
                            <div className="bg-muted/30 p-5 rounded-lg border border-slate-200">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800">
                                    <Calendar className="h-5 w-5" /> Datos de la Operación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Motivo</p>
                                        <p className="font-bold text-base text-slate-800">{selectedSalida.motivo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tipo de Salida</p>
                                        <p className={`font-bold ${selectedSalida.tipo_salida === 'traslado' ? 'text-orange-500' : 'text-red-500'}`}>
                                            {formatTipo(selectedSalida.tipo_salida)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fecha de Salida</p>
                                        <p className="font-medium text-base">{formatFecha(selectedSalida.fecha)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Registrado por</p>
                                        <p className="font-medium text-base text-slate-800">{selectedSalida.usuario_name}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> Observaciones
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                                        {selectedSalida.observaciones || 'Sin observaciones registradas.'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-5 rounded-lg border border-slate-200">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800">
                                    <Package className="h-5 w-5" /> Artículos Retirados
                                </h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {selectedSalida.detalles.map((detalle: any) => {
                                        const esEquipo = detalle.identificador && detalle.identificador !== 'N/A';

                                        return (
                                            <div key={detalle.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 w-full transition-all">
                                                
                                                {esEquipo ? (
                                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                                        <div className="space-y-3 border-l-4 border-blue-500 pl-4 flex-1">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Artículo</p>
                                                                <p className="font-bold text-lg text-red-600">
                                                                    {detalle.articulo_nombre}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {detalle.marca} - {detalle.modelo}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">ID del Equipo</p>
                                                                    <p className="font-medium text-sm">{detalle.identificador}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Serial Físico</p>
                                                                    <p className="font-medium text-sm">{detalle.serial !== 'N/A' ? detalle.serial : 'No registrado'}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Cantidad Retirada</p>
                                                                <span className="bg-slate-100 border border-slate-200 text-slate-800 font-bold px-3 py-1 rounded text-sm inline-block">
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
                                                            <p className="font-bold text-lg text-red-600">
                                                                {detalle.articulo_nombre}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {detalle.marca} - {detalle.modelo}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Cantidad Retirada</p>
                                                            <p className="font-bold text-lg mt-1">
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