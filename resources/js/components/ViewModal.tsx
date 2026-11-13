import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, AlertCircle, Clock, MapPin, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import QRCodeDisplay from '@/components/QRCodeDisplay';

const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const soloFecha = fechaString.split('T')[0]; 
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`; 
};

const formatTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
        'prestamo': 'Préstamo',
        'traslado': 'Traslado',
        'guarda_custodia': 'Guarda y Custodia'
    };
    return tipos[tipo] || tipo || 'No aplica';
};

export default function ViewModal({ asignacion, isOpen, onClose }: { asignacion: any, isOpen: boolean, onClose: () => void }) {
    
    const calcularEstadoDevolucion = (asig: any) => {
        if (asig.estado !== 'devuelta' || !asig.fecha_devolucion || !asig.fecha_estimada_devolucion) return null;
        
        const real = new Date(asig.fecha_devolucion.split('T')[0] + 'T00:00:00');
        const estimada = new Date(asig.fecha_estimada_devolucion.split('T')[0] + 'T00:00:00');

        if (real < estimada) {
            return { texto: 'Devuelto antes de tiempo', icon: ThumbsUp, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' };
        } else if (real > estimada) {
            return { texto: 'Devuelto con retraso', icon: ThumbsDown, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' };
        } else {
            return { texto: 'Devuelto a tiempo', icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' };
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Detalle de la Asignación #{asignacion?.id}</DialogTitle>
                    <DialogDescription>Información de la operación y artículos entregados.</DialogDescription>
                </DialogHeader>

                {asignacion && (
                    <div className="space-y-6 mt-4">
                        <div className="bg-muted/40 p-5 rounded-lg border border-border">
                            <h3 className="flex items-center gap-2 font-bold mb-4 text-foreground">
                                <Calendar className="h-5 w-5" /> Datos de la Operación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs text-muted-foreground">Tipo de Asignación</p>
                                    <p className="font-bold text-base text-foreground">{formatTipo(asignacion.tipo_asignacion)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Estado</p>
                                    <Badge variant={asignacion.estado === 'activa' ? 'default' : 'secondary'} className={asignacion.estado === 'activa' ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}>
                                        {asignacion.estado.toUpperCase()}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Fecha de Asignación</p>
                                    <p className="font-medium text-base text-foreground">{formatFecha(asignacion.fecha_asignacion)}</p>
                                </div>
                                <div className="md:col-span-3">
                                    <p className="text-xs text-muted-foreground">Recibido por (Trabajador)</p>
                                    <p className="font-medium text-base text-foreground">
                                        {asignacion.trabajador_nombre} <span className="text-muted-foreground text-sm font-normal">(C.I: {asignacion.trabajador_cedula})</span>
                                    </p>
                                </div>
                            </div>

                            {asignacion.tipo_asignacion === 'prestamo' && asignacion.estado === 'activa' && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-xs text-foreground dark:text-blue-400 font-semibold mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Tiempo de Préstamo
                                    </p>
                                    {asignacion.es_tiempo_indefinido ? (
                                        <p className="font-bold text-purple-600 dark:text-purple-400 text-base">Tiempo Indefinido</p>
                                    ) : (
                                        <p className="font-bold text-blue-600 dark:text-blue-400 text-base">
                                            Devolución estimada: {asignacion.fecha_estimada_devolucion ? formatFecha(asignacion.fecha_estimada_devolucion) : 'No especificada'}
                                        </p>
                                    )}
                                </div>
                            )}

                            {asignacion.tipo_asignacion === 'traslado' && (
                                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <p className="text-xs text-foreground dark:text-orange-400 font-semibold mb-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Ubicación Destino
                                    </p>
                                    <p className="font-bold text-orange-600 dark:text-orange-400 text-base">
                                        {asignacion.ubicacion_destino || 'No registrada'}
                                    </p>
                                </div>
                            )}

                            {asignacion.estado === 'devuelta' && asignacion.fecha_devolucion && (
                                <div className={`mt-4 p-4 border rounded-lg ${calcularEstadoDevolucion(asignacion)?.color || 'bg-muted'}`}>
                                    <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Registro de Devolución
                                    </p>
                                    <p className="font-bold text-base mb-2">
                                        Devuelto el: {formatFecha(asignacion.fecha_devolucion)}
                                    </p>
                                    {calcularEstadoDevolucion(asignacion) && (
                                        <p className="text-sm font-medium flex items-center gap-1">
                                            {calcularEstadoDevolucion(asignacion)?.icon && (() => {
                                                const Icon = calcularEstadoDevolucion(asignacion)?.icon;
                                                return Icon ? <Icon className="h-4 w-4" /> : null;
                                            })()}
                                            {calcularEstadoDevolucion(asignacion)?.texto}
                                            {asignacion.fecha_estimada_devolucion && ` (Estipulado: ${formatFecha(asignacion.fecha_estimada_devolucion)})`}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> Observaciones y Condición
                                </p>
                                <p className="whitespace-pre-wrap text-sm text-foreground">
                                    <span className="font-semibold">Condición de entrega:</span> {asignacion.condicion_entrega || 'No registrada'}
                                </p>
                                <p className="whitespace-pre-wrap text-sm text-foreground mt-1">
                                    <span className="font-semibold">Notas:</span> {asignacion.observaciones || 'Sin observaciones registradas.'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted/40 p-5 rounded-lg border border-border">
                            <h3 className="flex items-center gap-2 font-bold mb-4 text-foreground">
                                <Package className="h-5 w-5" /> Artículo Entregado
                            </h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {[asignacion].map((detalle: any, idx: number) => {
                                    const esEquipo = detalle.es_equipo;
                                    return (
                                        <div key={idx} className="bg-card p-4 rounded-lg shadow-sm border border-border w-full transition-all">
                                            {esEquipo ? (
                                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                                    <div className="space-y-3 border-l-4 border-blue-500 pl-4 flex-1">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Artículo</p>
                                                            <p className="font-bold text-lg text-destructive">{detalle.articulo_nombre}</p>
                                                            <p className="text-sm text-muted-foreground">{detalle.marca} - {detalle.modelo}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">ID del Equipo</p>
                                                                <p className="font-medium text-sm text-foreground">{detalle.identificador}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Serial Físico</p>
                                                                <p className="font-medium text-sm text-foreground">{detalle.serial !== 'N/A' ? detalle.serial : 'No registrado'}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Cantidad Entregada</p>
                                                            <span className="bg-muted text-foreground border border-border font-bold px-3 py-1 rounded text-sm inline-block">
                                                                {parseInt(detalle.cantidad, 10)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 w-full md:w-auto flex justify-center">
                                                        <QRCodeDisplay value={detalle.identificador} articulo={detalle.articulo_nombre} serial={detalle.serial} label="Código QR" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-l-4 border-blue-500 pl-4">
                                                    <div className="md:col-span-2">
                                                        <p className="text-xs text-muted-foreground">Artículo</p>
                                                        <p className="font-bold text-lg text-destructive">{detalle.articulo_nombre}</p>
                                                        <p className="text-sm text-muted-foreground mb-2">{detalle.marca} - {detalle.modelo}</p>
                                                        <span className="flex items-center gap-1 mt-1">
                                                            <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                                Consumible
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Cantidad Entregada</p>
                                                        <p className="font-bold text-lg mt-1 text-foreground">{parseInt(detalle.cantidad, 10)}</p>
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
    );
}