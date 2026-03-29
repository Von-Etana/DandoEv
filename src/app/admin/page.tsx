'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { mockLoans, mockBikes, mockDashboardStats, mockAuditLogs } from '@/lib/mock-data';
import { formatNaira, formatDate, capitalize, getStatusColor, timeAgo } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { LayoutDashboard, ClipboardList, Bike, Wallet, AlertTriangle, TrendingUp, Users, Zap, X, Menu, XCircle, Mail, Scale, MessageSquare, UserCheck, Lock, Calendar, CheckCircle, Clock, BarChart2, Star } from 'lucide-react';
import BikeModal from '@/components/admin/BikeModal';

type Tab = 'overview' | 'applications' | 'bikes' | 'payments' | 'defaults' | 'reports' | 'users' | 'settings' | 'reconciliation' | 'compliance' | 'activity';

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

    // New API States
    const [adminStats, setAdminStats] = useState<any>(null);
    const [userList, setUserList] = useState<any[]>([]);
    const [reconData, setReconData] = useState<any>({ logs: [], settlements: [] });
    const [kycDocs, setKycDocs] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchAdminStats = async () => {
        setStatsLoading(true);
        try {
            const r = await fetch('/api/admin/stats');
            if (r.ok) {
                const d = await r.json();
                setAdminStats(d.data);
            }
        } catch (e) {} finally { setStatsLoading(false); }
    };

    const fetchUserList = async () => {
        try {
            const r = await fetch('/api/admin/users');
            if (r.ok) {
                const d = await r.json();
                setUserList(d.data);
            }
        } catch (e) {}
    };

    const fetchReconData = async () => {
        try {
            const r = await fetch('/api/admin/reconciliation');
            if (r.ok) {
                const d = await r.json();
                setReconData(d);
            }
        } catch (e) {}
    };

    const fetchKycDocs = async () => {
        try {
            const r = await fetch('/api/admin/kyc?status=pending');
            if (r.ok) {
                const d = await r.json();
                setKycDocs(d.data);
            }
        } catch (e) {}
    };

    const fetchAuditLogs = async () => {
        try {
            const r = await fetch('/api/admin/audit-logs');
            if (r.ok) {
                const d = await r.json();
                setAuditLogs(d.data);
            }
        } catch (e) {}
    };

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

    const handleLoanAction = async (loanId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this application?`)) return;
        
        try {
            const res = await fetch(`/api/admin/loans/${loanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, adminNotes: `Action performed via dashboard: ${action}` })
            });
            
            if (res.ok) {
                alert(`Loan ${action}ed successfully`);
                // Refresh loans
                const lRes = await fetch('/api/loans');
                const lData = await lRes.json();
                setLoans(Array.isArray(lData.data) ? lData.data.reverse() : []);
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Failed to process action'}`);
            }
        } catch (e) {
            alert('Network error');
        }
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
        fetchAdminStats();
        fetchUserList();
        fetchReconData();
        fetchKycDocs();
        fetchAuditLogs();
    }, []);

    const totalRev = orders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0) + loans.reduce((acc: number, l: any) => acc + (l.totalAmount || 0), 0);
    const pendingApps = loans.filter(l => l.status === 'under_review' || l.status === 'pending').length;
    const activeLoansCount = loans.filter(l => l.status === 'active' || l.status === 'approved').length;

    const stats = {
        ...mockDashboardStats,
        totalRevenue: adminStats?.totalRevenue || 0,
        pendingApplications: adminStats?.pendingApplications || 0,
        activeLoans: adminStats?.activeLoans || 0,
        totalUsers: adminStats?.totalUsers || 0,
        defaultRate: adminStats?.defaultRate || 0,
        loansByStatus: adminStats?.loansByStatus || [],
        recentUsers: adminStats?.recentUsers || [],
    };

    const sidebarItems: { id: Tab; icon: ReactNode; label: string }[] = [
        { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { id: 'applications', icon: <ClipboardList size={18} />, label: 'Applications' },
        { id: 'compliance', icon: <UserCheck size={18} />, label: 'Compliance' },
        { id: 'bikes', icon: <Bike size={18} />, label: 'Bikes' },
        { id: 'payments', icon: <Wallet size={18} />, label: 'Payments' },
        { id: 'reconciliation', icon: <Scale size={18} />, label: 'Reconciliation' },
        { id: 'defaults', icon: <AlertTriangle size={18} />, label: 'Defaults' },
        { id: 'reports', icon: <TrendingUp size={18} />, label: 'Reports' },
        { id: 'users', icon: <Users size={18} />, label: 'Users' },
        { id: 'activity', icon: <Clock size={18} />, label: 'Audit Logs' },
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
                                {activeTab === 'reconciliation' && 'Monitor payment settlements and matching'}
                                {activeTab === 'compliance' && 'Verify customer identity documents'}
                                {activeTab === 'activity' && 'System audit trail and security logs'}
                                {activeTab === 'settings' && 'Manage Global System Parameters'}
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
                                    {stats.loansByStatus.map((l: any) => {
                                        const total = stats.loansByStatus.reduce((a: number, b: any) => a + b.count, 0);
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
                                        {auditLogs.slice(0, 10).map(log => (
                                            <tr key={log.id}>
                                                <td style={{ fontWeight: 600 }}>{log.user?.firstName} {log.user?.lastName}</td>
                                                <td><span className="badge badge-primary">{log.action.replace(/_/g, ' ')}</span></td>
                                                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{timeAgo(log.createdAt)}</td>
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
                                        <button 
                                            onClick={() => handleLoanAction(loan.id, 'approve')}
                                            className="btn btn-sm" style={{ background: 'var(--success)', color: 'var(--white)' }}>✓ Approve</button>
                                        <button 
                                            onClick={() => handleLoanAction(loan.id, 'reject')}
                                            className="btn btn-sm btn-danger">✕ Reject</button>
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
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={async () => {
                                                                if (!confirm('Attempt matching record to card auto debit?')) return;
                                                                const res = await fetch(`/api/admin/repayments/${r.repaymentId}/collect`, { method: 'POST' });
                                                                if (res.ok) fetchDelinquent();
                                                            }}
                                                            className="btn btn-primary btn-sm">Collect Now</button>
                                                        <button className="btn btn-ghost btn-sm" onClick={async () => {
                                                            const overrideReason = prompt('Enter offline clear setup reason:');
                                                            if (overrideReason) {
                                                               await fetch(`/api/admin/repayments/${r.repaymentId}/reconcile`, {
                                                                  method: 'POST',
                                                                  body: JSON.stringify({ overrideReason })
                                                               });
                                                               fetchDelinquent();
                                                            }
                                                        }}>Offline Clear</button>
                                                    </div>
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
                                <button onClick={() => window.open('/api/admin/reports/export?type=loans')} className="btn btn-outline btn-sm flex items-center justify-center gap-1"><BarChart2 size={14} /> Active Loans (CSV)</button>
                                <button onClick={() => window.open('/api/admin/reports/export?type=repayments')} className="btn btn-outline btn-sm flex items-center justify-center gap-1"><TrendingUp size={14} /> Repayments (CSV)</button>
                                <button onClick={() => window.open('/api/admin/reports/export?type=users')} className="btn btn-outline btn-sm flex items-center justify-center gap-1"><Users size={14} /> Customer Data (CSV)</button>
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
                                    {userList.map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                                            <td>{u.email}</td>
                                            <td>{u.phone}</td>
                                            <td><span className={`badge ${getStatusColor(u.customerStatus)}`}>{capitalize(u.customerStatus)}</span></td>
                                            <td><span className={`badge ${getStatusColor(u.kycStatus)}`}>{capitalize(u.kycStatus)}</span></td>
                                            <td>{formatDate(u.createdAt)}</td>
                                            <td><button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========== RECONCILIATION TAB ========== */}
                {activeTab === 'reconciliation' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="card card-elevated" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Matching Logs</h3>
                                <div className="flex flex-col gap-2">
                                    {(reconData?.logs || []).map((log: any) => (
                                        <div key={log.id} style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{formatDate(log.startedAt)}</div>
                                                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Matched {log.totalMatched}/{log.totalProcessed}</div>
                                            </div>
                                            <span className={`badge ${log.totalFlagged > 0 ? 'badge-danger' : 'badge-success'}`}>
                                                {log.totalFlagged} Flags
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card card-elevated" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Settlements</h3>
                                <div className="flex flex-col gap-2">
                                    {(reconData?.settlements || []).map((s: any) => (
                                        <div key={s.id} style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{formatNaira(s.amount)}</div>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{s.provider.toUpperCase()} • {formatDate(s.payoutDate)}</div>
                                            </div>
                                            <span className="badge badge-primary">{s.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== COMPLIANCE TAB ========== */}
                {activeTab === 'compliance' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col gap-4">
                            {kycDocs.length === 0 && <div className="text-center py-10 text-gray-400">No pending documents for review.</div>}
                            {kycDocs.map((doc: any) => (
                                <div key={doc.id} className="card card-elevated" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '200px', height: '140px', background: 'var(--gray-100)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                        <img src={doc.fileUrl} alt="KYC Document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 style={{ fontWeight: 700 }}>{capitalize(doc.type.replace(/_/g, ' '))}</h4>
                                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                                                    User: {doc.user.firstName} {doc.user.lastName} ({doc.user.email})
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={async () => {
                                                        const res = await fetch(`/api/admin/kyc/${doc.id}`, {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ status: 'verified' })
                                                        });
                                                        if (res.ok) fetchKycDocs();
                                                    }}
                                                    className="btn btn-success btn-sm">Verified</button>
                                                <button 
                                                    onClick={async () => {
                                                        const reason = prompt('Rejection reason:');
                                                        if (reason) {
                                                            await fetch(`/api/admin/kyc/${doc.id}`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
                                                            });
                                                            fetchKycDocs();
                                                        }
                                                    }}
                                                    className="btn btn-danger btn-sm">Reject</button>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>
                                            <a href={doc.fileUrl} target="_blank" className="btn btn-ghost btn-sm">View Full Document</a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========== ACTIVITY LOGS TAB ========== */}
                {activeTab === 'activity' && (
                    <div className="animate-fade-in">
                        <div className="table-container" style={{ borderRadius: 'var(--radius-2xl)' }}>
                            <table className="table">
                                <thead>
                                    <tr><th>User</th><th>Action</th><th>Details</th><th>IP Address</th><th>Time</th></tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map(log => (
                                        <tr key={log.id}>
                                            <td style={{ fontWeight: 600 }}>{log.user?.firstName} {log.user?.lastName}</td>
                                            <td><span className="badge badge-primary">{log.action.replace(/_/g, ' ')}</span></td>
                                            <td style={{ maxWidth: '400px' }}>{log.details}</td>
                                            <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>{log.ipAddress || 'internal'}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{timeAgo(log.createdAt)}</td>
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
