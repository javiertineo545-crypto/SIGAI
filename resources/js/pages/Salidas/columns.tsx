import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Package } from "lucide-react";

const formatFecha = (fechaString: string) => {
    if (!fechaString) return '';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

const formatTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
        'traspaso': 'Traspaso',
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
                    const esConsumible = !detalle.identificador || detalle.identificador === 'N/A';

                    return (
                        <div key={detalle.id} className="mb-2 last:mb-0 border-b border-border pb-2 last:border-0 last:pb-0">
                            {/* Usamos text-destructive para el rojo adaptativo */}
                            <span className="text-destructive block font-bold">{detalle.articulo_nombre}</span>
                            
                            {esConsumible ? (
                                <span className="flex items-center gap-1 mt-1 mb-1">
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700 text-[10px] px-1.5 py-0">
                                        <Package className="h-3 w-3 mr-1" /> Consumible
                                    </Badge>
                                </span>
                            ) : (
                                <>
                                    <span className="text-xs text-muted-foreground block">
                                        {/* text-foreground adapta el color del ID y Serial */}
                                        <span className="font-semibold text-foreground">ID:</span> {detalle.identificador}
                                    </span>
                                    {detalle.serial && detalle.serial !== 'N/A' && detalle.serial !== 'null' && (
                                        <span className="text-xs text-muted-foreground block">
                                            <span className="font-semibold text-foreground">Serial:</span> {detalle.serial}
                                        </span>
                                    )}
                                </>
                            )}

                            <span className="text-xs font-semibold text-foreground block mt-1">
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
                <span className="font-semibold text-sm text-foreground">{row.original.usuario_name}</span>
                <span className="block text-xs text-muted-foreground">C.I: {row.original.usuario_cedula}</span>
            </div>
        ),
    },
    {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => <span className="font-medium text-sm text-foreground">{formatFecha(row.original.fecha)}</span>,
    },
    {
        accessorKey: "tipo_salida",
        header: () => <div className="text-center">Tipo de Salida</div>,
        cell: ({ row }) => {
            const tieneEquipos = row.original.detalles?.some(
                (d: any) => d.identificador && d.identificador !== 'N/A'
            );

            return (
                <div className="flex justify-center items-center">
                    {!tieneEquipos ? (
                        <span className="text-muted-foreground block text-center">-</span>
                    ) : (
                        <Badge variant="outline" className={row.original.tipo_salida === 'desincorporacion' ? "bg-red-600 text-white dark:bg-red-600 dark:text-white border-red-300 dark:border-red-700" : "bg-orange-600 text-white dark:bg-orange-600 dark:text-white border-orange-300 dark:border-orange-700"}>
                            {formatTipo(row.original.tipo_salida)}
                        </Badge>
                    )}
                </div>
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