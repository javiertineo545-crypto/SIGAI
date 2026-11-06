import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { Pencil } from "lucide-react";

const formatFecha = (fechaString: string) => {
    if (!fechaString) return '';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

export const getColumns = (onViewDetails: (asignacion: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: "articulo_nombre",
        header: "Equipo",
        cell: ({ row }) => (
            <div className="font-medium border-l-4 border-blue-500 pl-3 my-1">
                <span className="text-red-600 block font-bold">
                    {row.original.articulo_nombre}
                </span>
                <span className="text-xs text-muted-foreground block">
                    <span className="font-semibold text-slate-700">ID:</span> {row.original.identificador}
                </span>
                <span className="text-xs text-muted-foreground block">
                    <span className="font-semibold text-slate-700">Serial:</span> {row.original.serial}
                </span>
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
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
            const activa = row.original.estado === 'activa';
            return (
                <Badge variant={activa ? 'default' : 'secondary'} className={activa ? 'bg-green-600' : 'bg-gray-400'}>
                    {activa ? 'Activa' : 'Devuelta'}
                </Badge>
            );
        },
    },
    {
        id: "actions",
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
                            <Button variant="destructive" size="sm" onClick={handleDevolver}>Devolver</Button>
                        </>
                    )}
                </div>
            );
        },
    },
];