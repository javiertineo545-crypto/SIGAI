import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import { Plus, Search, CheckCircle2, Laptop, User, Calendar, AlertCircle, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

export default function Index({ asignaciones, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const { props } = usePage();
    const flash = props.flash as { success?: string };
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedAsignacion, setSelectedAsignacion] = useState<any>(null);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('asignaciones.index'), { search }, { preserveState: true });
    };

    const columns = getColumns((asignacion) => setSelectedAsignacion(asignacion));

    return (
        <AppLayout breadcrumbs={[{ title: 'Asignaciones', href: route('asignaciones.index') }]}>
            <Head title="Gestión de Asignaciones" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 w-full relative">
                {showSuccess && (
                    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-5">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">{flash.success}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Asignaciones</h1>
                        <p className="text-muted-foreground">Control de equipos y consumibles entregados a los trabajadores.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('asignaciones.create')}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Asignación
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <Input placeholder="Buscar por equipo o trabajador..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
                    <Button type="submit" variant="secondary"><Search className="h-4 w-4" /></Button>
                </form>

                <div className="rounded-md border bg-card">
                    <DataTable columns={columns} data={asignaciones.data} paginationLinks={asignaciones.links} />
                </div>
            </div>

            <Dialog open={!!selectedAsignacion} onOpenChange={(open) => !open && setSelectedAsignacion(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Detalle de la Asignación</DialogTitle>
                        <DialogDescription>Información completa de la entrega.</DialogDescription>
                    </DialogHeader>

                    {selectedAsignacion && (
                        <div className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                <div className="bg-muted/30 p-4 rounded-lg border border-slate-200">
                                    <h3 className="flex items-center gap-2 font-bold mb-3 text-slate-800">
                                        {selectedAsignacion.es_equipo ? <Laptop className="h-5 w-5" /> : <Package className="h-5 w-5" />} 
                                        {selectedAsignacion.es_equipo ? 'Equipo Entregado' : 'Consumible Entregado'}
                                    </h3>
                                    <div className="space-y-3 border-l-4 border-blue-500 pl-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Artículo</p>
                                            <p className="font-bold text-red-600 text-lg">
                                                {selectedAsignacion.articulo_nombre}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedAsignacion.marca} - {selectedAsignacion.modelo}
                                            </p>
                                        </div>
                                        
                                        {selectedAsignacion.es_equipo ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">ID del Equipo</p>
                                                    <p className="font-medium text-sm">{selectedAsignacion.identificador}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Serial Físico</p>
                                                    <p className="font-medium text-sm">{selectedAsignacion.serial}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Cantidad Entregada</p>
                                                <p className="font-bold text-lg">{parseInt(selectedAsignacion.cantidad, 10)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-muted/30 p-4 rounded-lg border border-slate-200">
                                    <h3 className="flex items-center gap-2 font-bold mb-3 text-slate-800">
                                        <User className="h-5 w-5" /> Recibido por
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Nombre Completo</p>
                                            <p className="font-bold text-lg">
                                                {selectedAsignacion.trabajador_nombre}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Cédula de Identidad</p>
                                            <p className="font-medium text-sm">{selectedAsignacion.trabajador_cedula}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg border border-slate-200">
                                <h3 className="flex items-center gap-2 font-bold mb-3 text-slate-800">
                                    <Calendar className="h-5 w-5" /> Datos de la Operación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fecha de Asignación</p>
                                        <p className="font-medium text-sm">{formatFecha(selectedAsignacion.fecha_asignacion)}</p>
                                    </div>
                                    
                                    {/* SOLO MOSTRAMOS EL ESTADO SI ES UN EQUIPO */}
                                    {selectedAsignacion.es_equipo && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Estado Actual</p>
                                            <p className={`font-bold text-sm ${selectedAsignacion.estado === 'activa' ? 'text-green-600' : 'text-gray-500'}`}>
                                                {selectedAsignacion.estado === 'activa' ? 'ACTIVA' : 'DEVUELTA'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg border border-slate-200">
                                <h3 className="flex items-center gap-2 font-bold mb-2 text-slate-800">
                                    <AlertCircle className="h-5 w-5" /> Observaciones
                                </h3>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {selectedAsignacion.observaciones || 'Sin observaciones registradas.'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}