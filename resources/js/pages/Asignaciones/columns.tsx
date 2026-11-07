import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { router } from "@inertiajs/react";
import { Eye, Undo2, Package } from "lucide-react";

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
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
            if (!row.original.es_equipo) return <span className="text-muted-foreground text-sm">-</span>;
            const activa = row.original.estado === 'activa';
            return (
                <Badge variant={activa ? 'default' : 'secondary'} className={activa ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}>
                    {activa ? 'Activa' : 'Devuelta'}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
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
                <div className="flex justify-end gap-2">
                    {/* BOTÓN VER DETALLE (OJO) */}
                    <button
                        type="button"
                        onClick={() => onViewDetails(asignacion)}
                        title="Ver Detalle"
                        className="
                            inline-flex h-9 w-9 items-center justify-center
                            rounded-md border bg-background
                            text-blue-600
                            hover:border-blue-300
                            hover:bg-blue-50
                            hover:text-blue-700
                            transition-all duration-200
                            hover:scale-105
                        "
                    >
                        <Eye className="h-4 w-4" />
                    </button>

                    {/* BOTÓN DEVOLVER */}
                    {asignacion.estado === 'activa' && asignacion.es_equipo && (
                        <button
                            type="button"
                            onClick={handleDevolver}
                            title="Registrar Devolución"
                            className="
                                inline-flex h-9 w-9 items-center justify-center
                                rounded-md border bg-background
                                text-red-600
                                hover:border-red-300
                                hover:bg-red-50
                                hover:text-red-700
                                transition-all duration-200
                                hover:scale-105
                            "
                        >
                            <Undo2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            );
        },
    },
];