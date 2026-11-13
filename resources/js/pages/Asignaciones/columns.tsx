import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, RotateCcw, AlertTriangle, CalendarClock, UserPlus } from "lucide-react";

const formatFecha = (fechaString: string) => {
    if (!fechaString) return '';
    const soloFecha = fechaString.split('T')[0];
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`;
};

export const getColumns = (
    onViewDetails: (asignacion: any) => void,
    onDevolver: (asignacion: any) => void,
    onReasignar: (asignacion: any) => void
): ColumnDef<any>[] => [
    {
        accessorKey: "articulo_nombre",
        header: "Artículo / Equipo",
        cell: ({ row }) => {
            const esConsumible = !row.original.es_equipo;
            return (
                <div className="font-medium border-l-4 border-blue-500 pl-3 my-1">
                    <span className="text-destructive block font-bold">{row.original.articulo_nombre}</span>
                    {esConsumible ? (
                        <span className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700 text-[10px] px-1.5 py-0">
                                <Package className="h-3 w-3 mr-1" /> Consumible
                            </Badge>
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground block">
                            <span className="font-semibold text-foreground">ID:</span> {row.original.identificador} <br />
                            <span className="font-semibold text-foreground">Serial:</span> {row.original.serial}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "personnel",
        header: "Trabajador",
        cell: ({ row }) => (
            <div>
                <span className="font-semibold text-foreground">{row.original.trabajador_nombre}</span>
                <span className="block text-xs text-muted-foreground">C.I: {row.original.trabajador_cedula}</span>
            </div>
        ),
    },
    {
        accessorKey: "tipo_asignacion",
        header: "Tipo",
        cell: ({ row }) => {
            const tipos: Record<string, string> = {
                'prestamo': 'Préstamo',
                'traslado': 'Traslado',
                'guarda_custodia': 'Guarda y Custodia'
            };
            return (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm text-foreground">{tipos[row.original.tipo_asignacion] || 'Préstamo'}</span>
                    {row.original.tipo_asignacion === 'traslado' && (
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={row.original.ubicacion_destino}>
                            A: {row.original.ubicacion_destino || 'No especificado'}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "fecha_asignacion",
        header: "F. Asignación",
        cell: ({ row }) => <span className="font-medium text-sm text-foreground">{formatFecha(row.original.fecha_asignacion)}</span>,
    },
    {
        id: "fecha_devolucion",
        header: "F. Devolución",
        cell: ({ row }) => {
            const esPrestamo = ['prestamo', 'guarda_custodia'].includes(row.original.tipo_asignacion);
            
            if (!esPrestamo) return <span className="text-muted-foreground block text-center">-</span>;

            if (row.original.estado === 'devuelta') {
                return (
                    <span className="text-green-600 dark:text-green-400 font-medium text-sm flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" /> {formatFecha(row.original.fecha_devolucion)}
                    </span>
                );
            }

            if (row.original.es_tiempo_indefinido) {
                return (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded border border-purple-100 dark:border-purple-800">
                        Indefinido
                    </span>
                );
            }

            if (row.original.fecha_estimada_devolucion) {
                const hoy = new Date();
                hoy.setHours(0,0,0,0);
                const fechaEst = new Date(row.original.fecha_estimada_devolucion.split('T')[0] + 'T00:00:00');
                const hayRetraso = hoy > fechaEst;

                return (
                    <div className={`flex items-center justify-center gap-1 px-2 py-1 rounded border text-xs font-medium ${
                        hayRetraso 
                        ? 'bg-red-50 text-red-600 border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600' 
                        : 'bg-muted/50 text-foreground border-border'
                    }`} title={hayRetraso ? "¡Devolución retrasada!" : "Fecha estimada de devolución"}>
                        {hayRetraso && <AlertTriangle className="h-3 w-3" />}
                        {formatFecha(row.original.fecha_estimada_devolucion)}
                    </div>
                );
            }

            return <span className="text-muted-foreground block text-center">-</span>;
        },
    },
    {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
            if (!row.original.es_equipo) return <span className="text-muted-foreground block text-center">-</span>;
            const activa = row.original.estado === 'activa';
            return (
                <div className="flex justify-center">
                    <Badge variant={activa ? 'default' : 'secondary'} className={activa ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 text-white'}>
                        {activa ? 'Activa' : 'Devuelta'}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onViewDetails(row.original)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Button>
                
                {/* BOTÓN REASIGNAR: Solo para traslados, con color primario */}
                {row.original.estado === 'activa' && row.original.es_equipo && row.original.tipo_asignacion === 'traslado' && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onReasignar(row.original)} 
                        className="hover:bg-primary/10 text-primary border-primary/20"
                        title="Reasignar a otro trabajador"
                    >
                        <UserPlus className="h-4 w-4" />
                    </Button>
                )}

                {/* BOTÓN DEVOLVER */}
                {row.original.estado === 'activa' && ['prestamo', 'guarda_custodia'].includes(row.original.tipo_asignacion) && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onDevolver(row.original)} 
                        className="hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                        title="Registrar Devolución"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                )}
            </div>
        ),
    },
];