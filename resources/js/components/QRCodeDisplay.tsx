import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
    value: string; 
    articulo?: string;
    serial?: string;
    label?: string;
}

export default function QRCodeDisplay({ value, articulo, serial, label }: QRCodeDisplayProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    // Armamos un JSON con la información para que el QR sea más completo
    const qrData = JSON.stringify({
        ID: value,
        Articulo: articulo || 'N/A',
        Serial: serial || 'N/A'
    });

    const handleDownload = () => {
        if (!qrRef.current) return;
        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-${value}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white space-y-3 shadow-sm min-w-[200px]">
            {label && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{label}</p>}
            
            <div ref={qrRef} className="bg-white p-2 rounded-lg border border-slate-100">
                {/* Aquí pasamos el JSON en lugar de solo el identificador */}
                <QRCodeSVG 
                    value={qrData} 
                    size={120}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"M"} 
                />
            </div>
            
            <Button 
                onClick={handleDownload} 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
                <Download className="h-3 w-3" /> Descargar QR
            </Button>
        </div>
    );
}