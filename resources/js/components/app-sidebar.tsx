import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { User, Folder, BookUser, Tag, LayoutGrid, Shield, Ruler, Settings, MapPinned, Truck, PackageCheck, PackagePlus, Package, ArrowUpFromLine, ClipboardCheck, FileBarChart2, ScanEye } from 'lucide-react';
import AppLogo from './app-logo';
import { useCan } from '@/lib/useCan';

const homeItems: NavItem[] = [
    {
        title: 'Panel Principal',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

const inventoryItems: NavItem[] = [
    {
        title: 'Entradas',
        url: '/entradas',
        icon: PackagePlus,
        permission: 'entradas.view',
    },
    {
        title: 'Unidades',
        url: '/articulo-unidades',
        icon: ScanEye,
        permission: 'articulo-unidades.view',
    },
{
           title: 'Salidas',
           url: '/salidas',
           icon: ArrowUpFromLine,
           permission: 'salidas.view',
    },
    {
        title: 'Asignaciones',
        url: '/asignaciones',
        icon: ClipboardCheck,
        permission: 'asignaciones.view',
    },
    {
        title: 'Reportes',
        url: '/reportes',
        icon: FileBarChart2,
        permission: 'reportes.view',
    },
];

const configInventoryItems: NavItem[] = [
    {
        title: 'Artículos',
        url: '/articulos',
        icon: Package,
        permission: 'articulos.view',
    },
    {
        title: 'Categorías',
        url: '/categorias',
        icon: Folder,
        permission: 'categorias.view',
    },
    {
        title: 'Estados de Artículo',
        url: '/estados-articulo',
        icon: PackageCheck,
        permission: 'estados-articulo.view',
    },
    {
        title: 'Marcas',
        url: '/marcas',
        icon: Tag,
        permission: 'marcas.view',
    },
    {
        title: 'Proveedores',
        url: '/proveedores',
        icon: Truck,
        permission: 'proveedores.view',
    },
    {
        title: 'Referencias',
        url: '/referencias',
        icon: Tag,
        permission: 'referencias.view',
    },
    {
        title: 'Ubicaciones',
        url: '/ubicaciones',
        icon: MapPinned,
        permission: 'ubicaciones.view',
    },
];

const adminItems: NavItem[] = [
    {
        title: 'Personal',
        url: '/personnel',
        icon: BookUser,
        permission: 'personnel.view',
    },
    {
        title: 'Cargos',
        url: '/positions',
        icon: Tag,
        permission: 'positions.view',
    },
    {
        title: 'Usuarios',
        url: '/users',
        icon: User,
        permission: 'users.view',
    },
    {
        title: 'Roles y Permisos',
        url: '/roles',
        icon: Shield,
        permission: 'roles.view',
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     url: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     url: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { can } = useCan();

    const filteredHomeItems = homeItems.filter(item => !item.permission || can(item.permission));
    const filteredInventoryItems = inventoryItems.filter(item => !item.permission || can(item.permission));
    const filteredAdminItems = adminItems.filter(item => !item.permission || can(item.permission));
    const filteredConfigInventoryItems = configInventoryItems.filter(item => !item.permission || can(item.permission));

    const configGroups = [
        {
            title: 'Administrador',
            icon: Settings,
            items: filteredAdminItems,
        },
        {
            title: 'Inventario',
            icon: Folder,
            items: filteredConfigInventoryItems,
        },
    ].filter(group => group.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="floating">

            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    homeItems={filteredHomeItems}
                    inventoryItems={filteredInventoryItems}
                    configGroups={configGroups}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>

        </Sidebar>
    );
}