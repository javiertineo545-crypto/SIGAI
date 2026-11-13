import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';

export default function ReasignarModal({ asignacion, personnels, ubicaciones, isOpen, onClose }: { asignacion: any, personnels: any[], ubicaciones: any[], isOpen: boolean, onClose: () => void }) {
    const [newPersonnelId, setNewPersonnelId] = useState('');
    const [fechaReasignacion, setFechaReasignacion] = useState('');
    const [ubicacionDestinoId, setUbicacionDestinoId] = useState('');
    const [observacionesReasignacion, setObservacionesReasignacion] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && asignacion) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            setFechaReasignacion(`${yyyy}-${mm}-${dd}`);
            setNewPersonnelId('');
            setUbicacionDestinoId('');
            setObservacionesReasignacion('');
        }
    }, [isOpen, asignacion]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('asignaciones.reasignar', asignacion.id), {
            new_personnel_id: newPersonnelId,
            fecha_reasignacion: fechaReasignacion,
            ubicacion_destino_id: ubicacionDestinoId,
            observaciones_reasignacion: observacionesReasignacion
        }, {
            onSuccess: () => { onClose(); setProcessing(false); },
            onError: () => setProcessing(false)
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" /> Reasignar Equipo
                        </DialogTitle>
                        <DialogDescription>
                            Vas a transferir: <span className="font-bold text-foreground">{asignacion?.articulo_nombre} (ID: {asignacion?.identificador})</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="bg-muted/50 p-3 rounded-lg border mb-2">
                            <p className="text-sm text-muted-foreground">Actualmente en posesión de:</p>
                            <p className="font-semibold text-sm">{asignacion?.trabajador_nombre} (C.I: {asignacion?.trabajador_cedula})</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Nuevo Trabajador <span className="text-red-500">*</span></Label>
                            <Select value={newPersonnelId} onValueChange={setNewPersonnelId} required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el nuevo trabajador..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {personnels.map((p: any) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name} (C.I: {p.id_number})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Nueva Ubicación / Destino <span className="text-red-500">*</span></Label>
                            <Select value={ubicacionDestinoId} onValueChange={setUbicacionDestinoId} required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el destino (Ej: Depósito)..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ubicaciones.map((u: any) => (
                                        <SelectItem key={u.id} value={String(u.id)}>{u.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Reasignación</Label>
                            <Input 
                                type="date" 
                                required 
                                value={fechaReasignacion} 
                                onChange={(e) => setFechaReasignacion(e.target.value)}
                                min={asignacion?.fecha_asignacion.split('T')[0]}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Observaciones (Opcional)</Label>
                            <Textarea 
                                placeholder="Motivo del traslado, condición en la que se entrega..." 
                                value={observacionesReasignacion}
                                onChange={(e) => setObservacionesReasignacion(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing || !newPersonnelId || !ubicacionDestinoId}>
                            {processing ? 'Procesando...' : 'Confirmar Reasignación'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}