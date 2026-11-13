import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";
import { RotateCcw } from 'lucide-react';

export default function DevolverModal({ asignacion, isOpen, onClose }: { asignacion: any, isOpen: boolean, onClose: () => void }) {
    const [fechaDevolucion, setFechaDevolucion] = useState('');
    const [observacionesDevolucion, setObservacionesDevolucion] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && asignacion) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            setFechaDevolucion(`${yyyy}-${mm}-${dd}`);
            setObservacionesDevolucion('');
        }
    }, [isOpen, asignacion]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.patch(route('asignaciones.devolver', asignacion.id), {
            fecha_devolucion: fechaDevolucion,
            observaciones_devolucion: observacionesDevolucion
        }, {
            onSuccess: () => { onClose(); setProcessing(false); },
            onError: () => setProcessing(false)
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5 text-primary" /> Registrar Devolución
                        </DialogTitle>
                        <DialogDescription>
                            Estás devolviendo: <span className="font-bold text-foreground">{asignacion?.articulo_nombre}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Fecha de Devolución</Label>
                            <Input 
                                type="date" 
                                required 
                                value={fechaDevolucion} 
                                onChange={(e) => setFechaDevolucion(e.target.value)}
                                min={asignacion?.fecha_asignacion.split('T')[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Observaciones de Devolución (Opcional)</Label>
                            <Textarea 
                                placeholder="Ej: Se devuelve en buen estado, con cargador..." 
                                value={observacionesDevolucion}
                                onChange={(e) => setObservacionesDevolucion(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing} className="bg-primary text-white hover:bg-primary/90">
                            {processing ? 'Procesando...' : 'Confirmar Devolución'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}