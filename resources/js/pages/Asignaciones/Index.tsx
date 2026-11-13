import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import { Plus, Search, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Can } from "@/components/can";

// Importaciones modales
import ViewModal from '@/components/DevolverModal';
import DevolverModal from '@/components/DevolverModal';
import ReasignarModal from '@/components/ReasignarModal';

export default function Index({ asignaciones, filters, personnels = [], ubicaciones = [] }: any) {
    const [search, setSearch] = useState(filters?.search || '');
    const { props } = usePage();
    const flash = props.flash as { success?: string };
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Estados para controlar qué modal está abierto
    const [selectedAsignacion, setSelectedAsignacion] = useState<any>(null);
    const [asignacionToDevolver, setAsignacionToDevolver] = useState<any>(null);
    const [asignacionToReasignar, setAsignacionToReasignar] = useState<any>(null);

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

    const columns = getColumns(
        (asignacion) => setSelectedAsignacion(asignacion),
        (asignacion) => setAsignacionToDevolver(asignacion),
        (asignacion) => setAsignacionToReasignar(asignacion)
    );

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
                        <p className="text-muted-foreground">Historial de equipos y consumibles entregados al personal.</p>
                    </div>
                    
                    <Can permission="asignaciones.create">
                        <Button asChild>
                            <Link href={route('asignaciones.create')}>
                                <Plus className="mr-2 h-4 w-4" /> Nueva Asignación
                            </Link>
                        </Button>
                    </Can>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <Input placeholder="Buscar por artículo o trabajador..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
                    <Button type="submit" variant="secondary"><Search className="h-4 w-4" /></Button>
                </form>

                <div className="rounded-md border bg-card">
                    <DataTable columns={columns} data={asignaciones.data} />
                </div>
            </div>

            {/* RENDERIZADO DE LOS MODALES */}
            <ViewModal 
                asignacion={selectedAsignacion} 
                isOpen={!!selectedAsignacion} 
                onClose={() => setSelectedAsignacion(null)} 
            />

            <DevolverModal 
                asignacion={asignacionToDevolver} 
                isOpen={!!asignacionToDevolver} 
                onClose={() => setAsignacionToDevolver(null)} 
            />

            <ReasignarModal 
                asignacion={asignacionToReasignar} 
                personnels={personnels}
                ubicaciones={ubicaciones}
                isOpen={!!asignacionToReasignar} 
                onClose={() => setAsignacionToReasignar(null)} 
            />

        </AppLayout>
    );
}