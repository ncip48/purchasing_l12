import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { CalendarCheck, CreditCard, LayoutGrid, Lock, Tag } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    // {
    //     title: 'Product',
    //     url: '/product',
    //     icon: Package,
    // },
    {
        title: 'Voucher',
        url: '/voucher',
        icon: Tag,
    },
    {
        title: 'Transaction',
        url: '/transaction',
        icon: CreditCard,
    },
    {
        title: 'Attendance',
        url: '/attendance',
        icon: CalendarCheck,
        items: [
            {
                title: 'Facial Photo',
                url: '/attendance/facial-photo',
            },
            {
                title: 'Attendance Daily',
                url: '/attendance/attendance-daily',
            },
        ],
    },
    {
        title: 'Role & Permission',
        url: '/role-permission',
        icon: Lock,
        items: [
            {
                title: 'Permissions',
                url: '/role-permission/permissions',
            },
            {
                title: 'Roles',
                url: '/role-permission/roles',
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
