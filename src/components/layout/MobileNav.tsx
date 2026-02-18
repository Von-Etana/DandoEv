'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bike, FileText, User } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();

    // Hide on Auth pages or Admin
    if (pathname.startsWith('/auth') || pathname.startsWith('/admin')) return null;

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/bikes', label: 'Bikes', icon: Bike },
        { href: '/bnpl/personal-info', label: 'Apply', icon: FileText },
        { href: '/dashboard', label: 'Profile', icon: User },
    ];

    return (
        <div className="hide-desktop" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--white)', borderTop: '1px solid var(--gray-200)',
            display: 'flex', justifyContent: 'space-around', padding: '0.75rem 0.5rem',
            zIndex: 100, paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        }}>
            {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                    <Link key={item.href} href={item.href} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                        color: isActive ? 'var(--primary)' : 'var(--gray-500)',
                        textDecoration: 'none', flex: 1,
                    }}>
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
