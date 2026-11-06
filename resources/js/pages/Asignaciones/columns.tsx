import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { Pencil, Package } from "lucide-react";

const formatFecha = (fechaString: string) => {
    if (!fechaString) return '';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

export const getColumns = (onViewDetails: (asignacion: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: "articulo_nombre",
        header: "Artículo / Equipo",
        cell: ({ row }) => (
            <div className="font-medium border-l-4 border-blue-500 pl-3 my-1">
                <span className="text-red-600 block font-bold">
                    {row.original.articulo_nombre}
                </span>
                
                {row.original.es_equipo ? (
                    <span className="text-xs text-muted-foreground block">
                        <span className="font-semibold text-slate-700">ID:</span> {row.original.identificador} <br />
                        <span className="font-semibold text-slate-700">Serial:</span> {row.original.serial}
                    </span>
                ) : (
                    <span className="flex items-center gap-1 mt-1 text-xs">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                            <Package className="h-3 w-3 mr-1" /> Consumible
                        </Badge>
                        <span className="font-semibold text-slate-700 ml-1">Cant: {parseInt(row.original.cantidad, 10)}</span>
                    </span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "trabajador_nombre",
        header: "Trabajador",
        cell: ({ row }) => (
            <div>
                <span className="font-semibold">{row.original.trabajador_nombre}</span>
                <span className="block text-xs text-muted-foreground">
                    C.I: {row.original.trabajador_cedula}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "fecha_asignacion",
        header: "F. Asignación",
        cell: ({ row }) => <span className="font-medium text-sm">{formatFecha(row.original.fecha_asignacion)}</span>,
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
            const asignacion = row.original;
            const handleDevolver = () => {
                if (confirm('¿Estás seguro de registrar la devolución de este equipo?')) {
                    router.patch(route('asignaciones.devolver', asignacion.id), {
                        fecha_devolucion: new Date().toLocaleDateString('en-CA'),
                        observaciones_devolucion: 'Devuelto correctamente.'
                    }, { preserveScroll: true });
                }
            };

            return (
                <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(asignacion)}>
                        Ver Detalle
                    </Button>
                    
                    {asignacion.estado === 'activa' && (
                        <>
                            <Button variant="secondary" size="sm" asChild>
                                <a href={route('asignaciones.edit', asignacion.id)}>
                                    <Pencil className="h-3 w-3 mr-1" /> Editar
                                </a>
                            </Button>
                            
                            {asignacion.es_equipo && (
                                <Button variant="destructive" size="sm" onClick={handleDevolver}>
                                    Devolver
                                </Button>
                            )}
                        </>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
            // SI ES CONSUMIBLE, NO MOSTRAMOS EL ESTADO
            if (!row.original.es_equipo) {
                return <span className="text-muted-foreground text-sm">-</span>;
            }

            const activa = row.original.estado === 'activa';
            return (
                <Badge variant={activa ? 'default' : 'secondary'} className={activa ? 'bg-green-600' : 'bg-gray-400'}>
                    {activa ? 'Activa' : 'Devuelta'}
                </Badge>
            );
        },
    },
];