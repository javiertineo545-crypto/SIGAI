import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

const formatFecha = (fechaString: string) => {
    if (!fechaString) return '';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

export const getColumns = (onViewDetails: (salida: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: "detalles",
        header: "Artículo",
        cell: ({ row }) => (
            <div className="font-medium border-l-4 border-blue-500 pl-3 my-1">
                {row.original.detalles?.map((detalle: any) => {
                    const tieneId = detalle.identificador && detalle.identificador !== 'N/A';
                    const tieneSerial = detalle.serial && detalle.serial !== 'N/A' && detalle.serial !== 'null';

                    return (
                        <div key={detalle.id} className="mb-3 last:mb-0 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <span className="text-red-600 block font-bold">
                                {detalle.articulo_nombre}
                            </span>
                            
                            {tieneId && (
                                <span className="text-xs text-muted-foreground block">
                                    <span className="font-semibold text-slate-700">ID:</span> {detalle.identificador}
                                </span>
                            )}

                            {tieneSerial && (
                                <span className="text-xs text-muted-foreground block">
                                    <span className="font-semibold text-slate-700">Serial:</span> {detalle.serial}
                                </span>
                            )}

                            <span className="text-xs font-semibold text-slate-700 block mt-1">
                                Cantidad: {parseInt(detalle.cantidad, 10)}
                            </span>
                        </div>
                    );
                })}
            </div>
        ),
    },
    {
        accessorKey: "usuario_name",
        header: "Salida registrada por",
        cell: ({ row }) => (
            <div>
                <span className="font-semibold">
                    {row.original.usuario_name}
                </span>
                <span className="block text-xs text-muted-foreground">
                    C.I: {row.original.usuario_cedula}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "fecha",
        header: "F. De Salida",
        cell: ({ row }) => <span className="font-medium text-sm">{formatFecha(row.original.fecha)}</span>,
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                {/* BOTÓN VER DETALLE (OJO) */}
                <button
                    type="button"
                    onClick={() => onViewDetails(row.original)}
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
            </div>
        ),
    },
];