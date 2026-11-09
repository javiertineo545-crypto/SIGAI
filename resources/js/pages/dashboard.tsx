import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Box, Laptop, UserCheck, AlertTriangle, ArrowRight, 
    Package, FileText, Plus, Minus, ClipboardList 
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

export default function Dashboard({ 
    stats, articulosCriticos, ultimasEntradas, ultimasSalidas, chartCategorias, chartMovimientos 
}: any) {
    const { props } = usePage();
    const user = props.auth?.user as any;
    
    // Obtener fecha actual
    const today = new Date();
    const dateString = today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('dashboard') }]}>
            <Head title="Panel de Control" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 w-full">
                
                {/* 1. Saludo y Botones de Acción Rápida */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight capitalize">
                            ¡Hola, {user?.name?.split(' ')[0] || 'Administrador'}!
                        </h1>
                        <p className="text-muted-foreground capitalize">{dateString}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                            <Link href={route('entradas.create')}><Plus className="mr-2 h-4 w-4" /> Entrada</Link>
                        </Button>
                        <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                            <Link href={route('salidas.create')}><Minus className="mr-2 h-4 w-4" /> Salida</Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Link href={route('asignaciones.create')}><ClipboardList className="mr-2 h-4 w-4" /> Asignación</Link>
                        </Button>
                    </div>
                </div>

                {/* 2. Tarjetas Clickeables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href={route('articulos.index')}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Artículos</CardTitle>
                                <Box className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_articulos}</div>
                                <p className="text-xs text-muted-foreground">En catálogo</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route('articulo-unidades.index')}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Unidades Físicas</CardTitle>
                                <Laptop className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_unidades}</div>
                                <p className="text-xs text-muted-foreground">Equipos serializados</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route('asignaciones.index')}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Asignaciones</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.asignaciones_activas}</div>
                                <p className="text-xs text-muted-foreground">Activas en trabajadores</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route('reportes.index')}>
                        <Card className={`hover:bg-muted/50 transition-colors cursor-pointer h-full ${stats.stock_bajo > 0 ? "border-destructive/50 bg-destructive/5" : ""}`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Alertas Stock</CardTitle>
                                <AlertTriangle className={`h-4 w-4 ${stats.stock_bajo > 0 ? 'text-destructive' : 'text-orange-500'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stats.stock_bajo > 0 ? 'text-destructive' : ''}`}>
                                    {stats.stock_bajo}
                                </div>
                                <p className="text-xs text-muted-foreground">Bajo el mínimo</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* 3. Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
                    
                    {/* Gráfico de Barras - Movimientos */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Movimientos Recientes (Últimos 6 meses)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartMovimientos.labels.map((label: string, i: number) => ({
                                    name: label,
                                    Entradas: chartMovimientos.entradas[i],
                                    Salidas: chartMovimientos.salidas[i]
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                                    <Legend />
                                    <Bar dataKey="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Salidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Gráfico de Pastel - Categorías */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribución por Categoría</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartCategorias}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartCategorias.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* 4. Tablas y Listas Rápidas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
                    
                    {/* Lista de Stock Crítico */}
                    <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-lg">
                                <AlertTriangle className="h-5 w-5" /> Stock Crítico
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {articulosCriticos.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Todo el stock está saludable.</p>
                            ) : (
                                <div className="space-y-4">
                                    {articulosCriticos.map((art: any) => (
                                        <div key={art.id} className="flex justify-between items-center border-b border-orange-200/50 dark:border-orange-900/50 pb-2 last:border-0">
                                            <div>
                                                <p className="font-semibold text-sm">{art.nombre}</p>
                                                <p className="text-xs text-muted-foreground">Mínimo requerido: {art.stock_minimo}</p>
                                            </div>
                                            <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 font-bold px-2 py-1 rounded text-xs">
                                                Quedan {parseInt(art.stock, 10)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Últimas Entradas */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Package className="h-5 w-5 text-green-500" /> Últimas Entradas
                            </CardTitle>
                            <Link href={route('entradas.index')} className="text-sm text-primary hover:underline flex items-center gap-1">
                                Ver todo <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {ultimasEntradas.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay entradas.</p>
                            ) : (
                                <div className="space-y-4">
                                    {ultimasEntradas.map((entrada: any) => (
                                        <div key={entrada.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-semibold text-sm">{entrada.numero_documento}</p>
                                                <p className="text-xs text-muted-foreground">{entrada.proveedor?.nombre || 'N/A'}</p>
                                            </div>
                                            <p className="text-sm font-medium">{new Date(entrada.fecha).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Últimas Salidas */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-red-500" /> Últimas Salidas
                            </CardTitle>
                            <Link href={route('salidas.index')} className="text-sm text-primary hover:underline flex items-center gap-1">
                                Ver todo <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {ultimasSalidas.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay salidas.</p>
                            ) : (
                                <div className="space-y-4">
                                    {ultimasSalidas.map((salida: any) => (
                                        <div key={salida.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-semibold text-sm truncate max-w-[150px]">{salida.motivo}</p>
                                                <p className="text-xs text-muted-foreground">{salida.usuario?.name || 'N/A'}</p>
                                            </div>
                                            <p className="text-sm font-medium">{new Date(salida.fecha).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout>
    );
}