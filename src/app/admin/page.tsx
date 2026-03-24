'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { mockLoans, mockBikes, mockDashboardStats, mockAuditLogs } from '@/lib/mock-data';
import { formatNaira, formatDate, capitalize, getStatusColor, timeAgo } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { LayoutDashboard, ClipboardList, Bike, Wallet, AlertTriangle, TrendingUp, Users, Zap, X, Menu, XCircle, Mail, Scale, MessageSquare, UserCheck, Lock, Calendar, CheckCircle, Clock, BarChart2, Star } from 'lucide-react';
import BikeModal from '@/components/admin/BikeModal';

type Tab = 'overview' | 'applications' | 'bikes' | 'payments' | 'defaults' | 'reports' | 'users' | 'settings';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loans, setLoans] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [bikes, setBikes] = useState<any[]>([]);
    const [loadingBikes, setLoadingBikes] = useState(false);

    // Modal State для редактирования / добавления байка
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBike, setSelectedBike] = useState<any | null>(null);

    // Live Data Extensions (Phase 4)
    const [delinquentData, setDelinquentData] = useState<{ totalAtRisk: number; repayments: any[] }>({ totalAtRisk: 0, repayments: [] });
    const [systemConfig, setSystemConfig] = useState<Record<string, string>>({});
    const [configLoading, setConfigLoading] = useState(false);

    const fetchBikes = async () => {
        setLoadingBikes(true);
        try {
            const r = await fetch('/api/admin/bikes');
            if (r.ok) {
                const data = await r.json();
                setBikes(data);
            }
        } catch (e) {
            console.error('Failed to fetch bikes', e);
        } finally {
            setLoadingBikes(false);
        }
    };

    const fetchDelinquent = async () => {
        try {
            const r = await fetch('/api/admin/loans/delinquent');
            if (r.ok) {
                const d = await r.json();
                setDelinquentData(d.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchConfig = async () => {
        try {
            const r = await fetch('/api/admin/config');
            if (r.ok) {
                const d = await r.json();
                setSystemConfig(d.data);
            }
        } catch (e) {}
    };

    useEffect(() => {
        Promise.all([
            fetch('/api/loans').then(r => r.json()),
            fetch('/api/orders').then(r => r.json())
        ]).then(([l, o]) => {
            setLoans(Array.isArray(l) ? l.reverse() : []);
            setOrders(Array.isArray(o) ? o.reverse() : []);
        }).catch(e => console.error(e));

        fetchBikes();
        fetchDelinquent();
        fetchConfig();
    }, []);

    const totalRev = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0) + loans.reduce((acc, l) => acc + (l.totalAmount || 0), 0);
    const pendingApps = loans.filter(l => l.status === 'under_review' || l.status === 'pending').length;
    const activeLoansCount = loans.filter(l => l.status === 'active' || l.status === 'approved').length;

    const stats = {
        ...mockDashboardStats,
        totalRevenue: mockDashboardStats.totalRevenue + totalRev,
        pendingApplications: pendingApps,
        activeLoans: mockDashboardStats.activeLoans + activeLoansCount,
        totalUsers: mockDashboardStats.totalUsers + loans.length + orders.length,
    };

    const sidebarItems: { id: Tab; icon: ReactNode; label: string }[] = [
        { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { id: 'applications', icon: <ClipboardList size={18} />, label: 'Applications' },
        { id: 'bikes', icon: <Bike size={18} />, label: 'Bikes' },
        { id: 'payments', icon: <Wallet size={18} />, label: 'Payments' },
        { id: 'defaults', icon: <AlertTriangle size={18} />, label: 'Defaults' },
        { id: 'reports', icon: <TrendingUp size={18} />, label: 'Reports' },
        { id: 'users', icon: <Users size={18} />, label: 'Users' },
        { id: 'settings', icon: <Lock size={18} />, label: 'Settings' },
    ];

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
            {/* Mobile Overlay */}
            <div className={`admin-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt={APP_NAME} style={{ height: '40px', width: 'auto' }} />
                        </Link>
                        {/* Close button for mobile */}
                        <button className="hide-desktop" onClick={() => setSidebarOpen(false)} style={{ color: 'var(--white)', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20} /></button>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '0.25rem' }}>Admin Dashboard</div>
                </div>
                <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {sidebarItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                                background: activeTab === item.id ? 'rgba(74, 234, 175, 0.15)' : 'transparent',
                                color: activeTab === item.id ? 'var(--accent)' : 'var(--gray-400)',
                                fontWeight: activeTab === item.id ? 600 : 400,
                                fontSize: 'var(--text-sm)', cursor: 'pointer',
                                transition: 'all 0.15s', width: '100%', textAlign: 'left', border: 'none',
                            }}>
                            <span>{item.icon}</span> {item.label}
                            {item.id === 'applications' && (
                                <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'var(--white)', borderRadius: 'var(--radius-full)', padding: '0.125rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                                    {stats.pendingApplications}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-3">
                        <div style={{
                            width: '36px', height: '36px', borderRadius: 'var(--radius-lg)',
                            background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 'var(--text-sm)',
                        }}>SA</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>System Admin</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Super Admin</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
                    <div className="flex items-center">
                        <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
                        <div>
                            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                                {sidebarItems.find(i => i.id === activeTab)?.label}
                            </h1>
                            <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                                {activeTab === 'overview' && 'Welcome to the admin panel'}
                                {activeTab === 'applications' && 'Review and manage BNPL applications'}
                                {activeTab === 'bikes' && 'Manage bike inventory'}
                                {activeTab === 'payments' && 'Track repayments and transactions'}
                                {activeTab === 'defaults' && 'Manage defaults and collections'}
                                {activeTab === 'reports' && 'View analytics and reports'}
                                {activeTab === 'users' && 'Manage customer accounts'}
                                {activeTab === 'settings' && 'Manage Global Risk Controller setups Parameters constants setup'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="btn btn-ghost btn-sm">Customer View</Link>
                        <Link href="/" className="btn btn-outline btn-sm">🏠 Home</Link>
                    </div>
                </div>

                {/* ========== OVERVIEW TAB ========== */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        {/* Stats Cards */}
                        <div className="grid grid-4" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
                            {[
                                { icon: <Users size={22} />, label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: '+12%', bg: '#F0EBFF', positive: true },
                                { icon: <ClipboardList size={22} />, label: 'Active Loans', value: stats.activeLoans.toString(), change: '+5', bg: 'var(--info-bg)', positive: true },
                                { icon: <Wallet size={22} />, label: 'Total Revenue', value: formatNaira(stats.totalRevenue), change: '+18%', bg: 'var(--success-bg)', positive: true },
                                { icon: <AlertTriangle size={22} />, label: 'Default Rate', value: `${stats.defaultRate}%`, change: '-0.5%', bg: 'var(--danger-bg)', positive: true },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                    <div className={`stat-change ${s.positive ? 'positive' : 'negative'}`}>
                                        <TrendingUp size={12} /> {s.change}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid-cols-2-1" style={{ marginBottom: '2rem' }}>
                            {/* Revenue Chart (simplified bar chart) */}
                            <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Monthly Revenue</h3>
                                <div className="flex items-end gap-3" style={{ height: '200px' }}>
                                    {stats.monthlyRevenue.map(m => {
                                        const maxRev = Math.max(...stats.monthlyRevenue.map(x => x.revenue));
                                        const height = (m.revenue / maxRev) * 100;
                                        return (
                                            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                                                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-600)' }}>
                                                    {formatNaira(m.revenue).replace('NGN', '').trim().split(',')[0]}M
                                                </div>
                                                <div style={{
                                                    width: '100%', height: `${height}%`, minHeight: '20px',
                                                    background: 'var(--primary-gradient)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                                    transition: 'height 0.5s ease',
                                                }} />
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{m.month}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Loans by Status */}
                            <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Loans by Status</h3>
                                <div className="flex flex-col gap-3">
                                    {stats.loansByStatus.map(l => {
                                        const total = stats.loansByStatus.reduce((a, b) => a + b.count, 0);
                                        const pct = (l.count / total) * 100;
                                        const color = l.status === 'Active' ? 'var(--success)' : l.status === 'Pending' ? 'var(--warning)' : l.status === 'Completed' ? 'var(--info)' : l.status === 'Defaulted' ? 'var(--danger)' : 'var(--gray-400)';
                                        return (
                                            <div key={l.status}>
                                                <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)', marginBottom: '0.25rem' }}>
                                                    <span>{l.status}</span>
                                                    <span style={{ fontWeight: 600 }}>{l.count}</span>
                                                </div>
                                                <div style={{ height: '6px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card card-elevated" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                            <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
                                <h3 style={{ fontWeight: 700 }}>Recent Activity</h3>
                            </div>
                            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                                <table className="table">
                                    <thead>
                                        <tr><th>User</th><th>Action</th><th>Details</th><th>Time</th></tr>
                                    </thead>
                                    <tbody>
                                        {mockAuditLogs.map(log => (
                                            <tr key={log.id}>
                                                <td style={{ fontWeight: 600 }}>{log.userName}</td>
                                                <td><span className="badge badge-primary">{log.action.replace(/_/g, ' ')}</span></td>
                                                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{timeAgo(log.timestamp)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== APPLICATIONS TAB ========== */}
                {activeTab === 'applications' && (
                    <div className="animate-fade-in">
                        <div className="flex gap-2" style={{ marginBottom: '1.5rem' }}>
                            {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map(f => (
                                <button key={f} className="btn btn-sm" style={{
                                    background: f === 'All' ? 'var(--primary)' : 'var(--white)',
                                    color: f === 'All' ? 'var(--white)' : 'var(--gray-700)',
                                    border: '1px solid var(--gray-200)',
                                }}>
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4">
                            {loans.length === 0 && <div style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem' }}>No BNPL applications found.</div>}
                            {loans.map(loan => {
                                const uName = loan.personalInfo ? `${loan.personalInfo.firstName} ${loan.personalInfo.lastName}` : (loan.userName || 'Applicant');
                                const uEmail = loan.personalInfo?.email || loan.userEmail || 'No Email';
                                return (
                                <div key={loan.id} className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                    <div className="flex items-start justify-between" style={{ marginBottom: '1rem' }}>
                                        <div className="flex items-center gap-4">
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: 'var(--radius-full)',
                                                background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--white)', fontWeight: 700, fontSize: 'var(--text-sm)',
                                            }}>{uName.slice(0, 2).toUpperCase()}</div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{uName}</div>
                                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{uEmail}</div>
                                            </div>
                                        </div>
                                        <span className={`badge ${getStatusColor(loan.status)}`}>{capitalize(loan.status)}</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                        {[
                                            { label: 'Bike', value: loan.bikeName || 'Unknown Bike' },
                                            { label: 'Loan Total', value: formatNaira(loan.totalAmount || loan.loanAmount || 0) },
                                            { label: 'Tenure', value: `${loan.tenure || 'N/A'} months` },
                                            { label: 'Delivery', value: loan.deliveryType === 'pickup' ? 'Pick Up' : (loan.deliveryState || 'N/A') },
                                            { label: 'Risk Score', value: `${loan.riskScore || 85}/100` },
                                        ].map(d => (
                                            <div key={d.label}>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: '0.125rem' }}>{d.label}</div>
                                                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{d.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                                        <span className={`badge ${loan.kycVerified ? 'badge-success' : 'badge-warning'}`}>
                                            {loan.kycVerified ? '✓ KYC Verified' : '⏳ KYC Pending'}
                                        </span>
                                        <span className={`badge ${loan.guarantorsVerified ? 'badge-success' : 'badge-warning'}`}>
                                            {loan.guarantorsVerified ? '✓ Guarantors Verified' : '⏳ Guarantors Pending'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1rem' }}>
                                        <button className="btn btn-sm" style={{ background: 'var(--success)', color: 'var(--white)' }}>✓ Approve</button>
                                        <button className="btn btn-sm btn-danger">✕ Reject</button>
                                        <button className="btn btn-sm btn-outline">📄 Request Docs</button>
                                        <button className="btn btn-sm btn-ghost">View Details</button>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                )}

                {/* ========== BIKES TAB ========== */}
                {activeTab === 'bikes' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                                {loadingBikes ? 'Loading...' : `${bikes.length} bikes in inventory`}
                            </span>
                            <button className="btn btn-primary btn-sm" onClick={() => { setSelectedBike(null); setIsModalOpen(true); }}>+ Add New Bike</button>
                        </div>
                        <div className="table-container" style={{ borderRadius: 'var(--radius-2xl)' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Bike</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>BNPL</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bikes.length === 0 && !loadingBikes && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)' }}>No bikes found</td></tr>}
                                    {bikes.map(bike => (
                                        <tr key={bike.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bike size={18} color='var(--primary)' /></div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{bike.name}</div>
                                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{bike.brand} {bike.model}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{bike.category || 'N/A'}</td>
                                            <td style={{ fontWeight: 600 }}>{formatNaira(bike.price)}</td>
                                            <td>{bike.stockQuantity}</td>
                                            <td><span className={`badge ${getStatusColor(bike.availability)}`}>{capitalize(bike.availability.replace(/_/g, ' '))}</span></td>
                                            <td>{bike.bnplEligible ? <span className="badge badge-success">Yes</span> : <span className="badge badge-default">No</span>}</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button onClick={() => { setSelectedBike(bike); setIsModalOpen(true); }} className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>Edit</button>
                                                    <button onClick={async () => {
                                                        if (confirm('Are you sure you want to delete this bike?')) {
                                                            await fetch(`/api/admin/bikes/${bike.id}`, { method: 'DELETE' });
                                                            fetchBikes();
                                                        }
                                                    }} className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========== PAYMENTS TAB ========== */}
                {activeTab === 'payments' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-3" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
                            {[
                                { icon: '✅', label: 'Successful', value: '241', bg: 'var(--success-bg)' },
                                { icon: '❌', label: 'Failed', value: '8', bg: 'var(--danger-bg)' },
                                { icon: '⏳', label: 'Upcoming', value: '156', bg: 'var(--warning-bg)' },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label} Payments</div>
                                </div>
                            ))}
                        </div>
                        <div className="table-container" style={{ borderRadius: 'var(--radius-2xl)' }}>
                            <table className="table">
                                <thead>
                                    <tr><th>Customer</th><th>Loan</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Late Fee</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {loans.map(loan => {
                                        const uName = loan.personalInfo ? `${loan.personalInfo.firstName} ${loan.personalInfo.lastName}` : (loan.userName || 'Applicant');
                                        return (
                                        <tr key={loan.id}>
                                            <td style={{ fontWeight: 600 }}>{uName}</td>
                                            <td>{loan.bikeName}</td>
                                            <td>{formatNaira(loan.totalAmount || loan.monthlyRepayment || 0)}</td>
                                            <td>{formatDate(loan.createdAt)}</td>
                                            <td><span className={`badge ${getStatusColor(loan.status)}`}>{capitalize(loan.status)}</span></td>
                                            <td>₦0</td>
                                            <td><button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>View</button></td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========== DEFAULTS TAB ========== */}
                {activeTab === 'defaults' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-4" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
                            {[
                                { icon: <AlertTriangle size={18} />, label: 'Overdue Total', value: delinquentData.repayments.length.toString(), bg: 'var(--warning-bg)' },
                                { icon: <Wallet size={18} />, label: 'Value At Risk', value: formatNaira(delinquentData.totalAtRisk), bg: 'var(--danger-bg)' },
                                { icon: <Mail size={18} />, label: 'Reminders Sent', value: '28', bg: 'var(--info-bg)' },
                                { icon: <Scale size={18} />, label: 'Legal Cases', value: '1', bg: '#F0EBFF' },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {delinquentData.repayments.length > 0 && (
                            <div className="table-container" style={{ borderRadius: 'var(--radius-2xl)', marginBottom: '2rem' }}>
                                <table className="table">
                                    <thead>
                                        <tr><th>User</th><th>Bike</th><th>Amount Due</th><th>Days Overdue</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {delinquentData.repayments.map(r => (
                                            <tr key={r.repaymentId}>
                                                <td style={{ fontWeight: 600 }}>{r.user.firstName} {r.user.lastName}</td>
                                                <td>{r.bike.name}</td>
                                                <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatNaira(r.amount - r.amountPaid)}</td>
                                                <td><span className="badge badge-warning">{r.daysOverdue} days</span></td>
                                                <td>
                                                    <button className="btn btn-ghost btn-sm" onClick={async () => {
                                                        const overrideReason = prompt('Enter offline clear setup reason triggers validation:');
                                                        if (overrideReason) {
                                                           await fetch(`/api/admin/repayments/${r.repaymentId}/reconcile`, {
                                                              method: 'POST',
                                                              body: JSON.stringify({ overrideReason })
                                                           });
                                                           fetchDelinquent();
                                                        }
                                                    }}>Clear Debt Offline</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Collections Actions</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    { type: 'SMS Reminder', desc: 'Send automated SMS reminders to overdue accounts', icon: <MessageSquare size={18} /> },
                                    { type: 'Email Notice', desc: 'Send formal notice email with payment link', icon: <Mail size={18} /> },
                                    { type: 'WhatsApp', desc: 'Send WhatsApp reminder with payment details', icon: <MessageSquare size={18} /> },
                                    { type: 'Guarantor Notice', desc: 'Notify guarantors of overdue accounts', icon: <UserCheck size={18} /> },
                                    { type: 'Account Suspension', desc: 'Suspend customer account and activate immobilizer', icon: <Lock size={18} /> },
                                    { type: 'Legal Escalation', desc: 'Flag for legal action — send demand letter', icon: <Scale size={18} /> },
                                ].map(action => (
                                    <div key={action.type} className="flex items-center gap-4" style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)' }}>
                                        <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--gray-100)', color: 'var(--primary)' }}>{action.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{action.type}</div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{action.desc}</div>
                                        </div>
                                        <button className="btn btn-outline btn-sm">Execute</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== REPORTS TAB ========== */}
                {activeTab === 'reports' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-2" style={{ gap: 'var(--space-6)', marginBottom: '2rem' }}>
                            {/* Top selling bikes */}
                            <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Top Selling Bikes</h3>
                                <div className="flex flex-col gap-3">
                                    {stats.topBikes.map((bike, i) => {
                                        const maxSales = Math.max(...stats.topBikes.map(b => b.sales));
                                        return (
                                            <div key={bike.name}>
                                                <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)', marginBottom: '0.375rem' }}>
                                                    <span className="flex items-center gap-2">
                                                        <span style={{ fontWeight: 700, color: 'var(--primary)', width: '1.25rem' }}>{i + 1}.</span>
                                                        {bike.name}
                                                    </span>
                                                    <span style={{ fontWeight: 600 }}>{bike.sales} sold</span>
                                                </div>
                                                <div style={{ height: '8px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)' }}>
                                                    <div style={{
                                                        height: '100%', width: `${(bike.sales / maxSales) * 100}%`,
                                                        background: i === 0 ? 'var(--primary-gradient)' : i === 1 ? 'var(--accent)' : 'var(--gray-400)',
                                                        borderRadius: 'var(--radius-full)',
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Key Metrics</h3>
                                <div className="flex flex-col gap-4">
                                    {[
                                        { label: 'Average Loan Size', value: formatNaira(637500), icon: <Wallet size={16} /> },
                                        { label: 'Average Tenure', value: '10.5 months', icon: <Calendar size={16} /> },
                                        { label: 'Approval Rate', value: '78%', icon: <CheckCircle size={16} /> },
                                        { label: 'On-Time Payment Rate', value: '92.3%', icon: <Clock size={16} /> },
                                        { label: 'Average Risk Score', value: '74/100', icon: <BarChart2 size={16} /> },
                                        { label: 'Customer Satisfaction', value: '4.6/5.0', icon: <Star size={16} /> },
                                    ].map(m => (
                                        <div key={m.label} className="flex items-center justify-between" style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                            <span className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                                                <span style={{ color: 'var(--primary)' }}>{m.icon}</span> {m.label}
                                            </span>
                                            <span style={{ fontWeight: 700 }}>{m.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Export Actions */}
                        <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Export Reports</h3>
                            <div className="flex gap-3 flex-wrap">
                                <button className="btn btn-outline btn-sm flex items-center justify-center gap-1"><BarChart2 size={14} /> Active Loans (CSV)</button>
                                <button className="btn btn-outline btn-sm flex items-center justify-center gap-1"><TrendingUp size={14} /> Revenue Report (PDF)</button>
                                <button className="btn btn-outline btn-sm flex items-center justify-center gap-1"><Users size={14} /> Customer Data (CSV)</button>
                                <button className="btn btn-outline btn-sm flex items-center justify-center gap-1"><AlertTriangle size={14} /> Default Report (PDF)</button>
                                <button className="btn btn-outline btn-sm flex items-center justify-center gap-1"><Bike size={14} /> Bike Sales (CSV)</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== USERS TAB ========== */}
                {activeTab === 'users' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-3" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
                            {[
                                { icon: '👥', label: 'Total', value: '1,247', bg: '#F0EBFF' },
                                { icon: '✅', label: 'Active BNPL', value: '89', bg: 'var(--success-bg)' },
                                { icon: '🔴', label: 'Suspended', value: '4', bg: 'var(--danger-bg)' },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label} Users</div>
                                </div>
                            ))}
                        </div>
                        <div className="table-container" style={{ borderRadius: 'var(--radius-2xl)' }}>
                            <table className="table">
                                <thead>
                                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>KYC</th><th>Joined</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Adebayo Johnson', email: 'adebayo.j@email.com', phone: '08012345678', status: 'active_bnpl', kyc: 'verified', joined: '2025-10-15' },
                                        { name: 'Chioma Okafor', email: 'chioma.o@email.com', phone: '09098765432', status: 'bnpl_applicant', kyc: 'pending', joined: '2026-01-05' },
                                        { name: 'Emeka Nnamdi', email: 'emeka.n@email.com', phone: '07012349876', status: 'registered', kyc: 'pending', joined: '2026-02-01' },
                                        { name: 'Fatima Bello', email: 'fatima.b@email.com', phone: '08145678901', status: 'active_bnpl', kyc: 'verified', joined: '2025-09-20' },
                                        { name: 'Olumide Adekunle', email: 'olumide.a@email.com', phone: '09034567890', status: 'defaulted', kyc: 'verified', joined: '2025-08-12' },
                                    ].map(u => (
                                        <tr key={u.email}>
                                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{u.phone}</td>
                                            <td><span className={`badge ${getStatusColor(u.status)}`}>{capitalize(u.status)}</span></td>
                                            <td><span className={`badge ${getStatusColor(u.kyc)}`}>{capitalize(u.kyc)}</span></td>
                                            <td>{formatDate(u.joined)}</td>
                                            <td><button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {isModalOpen && (
                    <BikeModal 
                        bike={selectedBike} 
                        onClose={() => { setIsModalOpen(false); setSelectedBike(null); }} 
                        onSave={() => { setIsModalOpen(false); setSelectedBike(null); fetchBikes(); }} 
                    />
                )}
            </main>
        </div>
    );
}
