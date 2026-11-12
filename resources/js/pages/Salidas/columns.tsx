import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

const formatFecha = (fechaString: string) => {
    if (!fechaString) return '';
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
                        <div key={detalle.id} className="mb-2 last:mb-0 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <span className="text-red-600 block font-bold">{detalle.articulo_nombre}</span>
                            
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
        header: "Registrado por",
        cell: ({ row }) => (
            <div>
                <span className="font-semibold text-sm">{row.original.usuario_name}</span>
                <span className="block text-xs text-muted-foreground">C.I: {row.original.usuario_cedula}</span>
            </div>
        ),
    },
    {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => <span className="font-medium text-sm">{formatFecha(row.original.fecha)}</span>,
    },
    {
        accessorKey: "tipo_salida",
        header: "Tipo de Salida",
        cell: ({ row }) => {
            const esDesincorporacion = row.original.tipo_salida === 'desincorporacion';
            return (
                <Badge variant="outline" className={esDesincorporacion ? "bg-red-600 text-white border-red-300" : "bg-orange-600 text-white border-orange-300"}>
                    {formatTipo(row.original.tipo_salida)}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onViewDetails(row.original)}>
                    <Eye className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];