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
        { href: '/dashboard', label: 'Account', icon: FileText },
    ];

    return (
        <div className="hide-desktop" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--white)', borderTop: '1px solid var(--gray-200)',
            display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0.25rem',
            zIndex: 100, paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
            boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        }}>
            {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                    <Link key={item.href} href={item.href} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                        textDecoration: 'none', flex: 1,
                        padding: '0.4rem 0.25rem',
                        borderRadius: '0.75rem',
                        background: isActive ? 'rgba(45, 10, 78, 0.08)' : 'transparent',
                        color: isActive ? 'var(--primary)' : 'var(--gray-500)',
                        transition: 'background 0.2s ease, color 0.2s ease',
                        minHeight: '52px',
                        justifyContent: 'center',
                    }}>
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500, letterSpacing: '0.01em' }}>{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
