'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { mockLoans, mockBikes, mockDashboardStats, mockAuditLogs } from '@/lib/mock-data';
import { formatNaira, formatDate, capitalize, getStatusColor, timeAgo } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { LayoutDashboard, ClipboardList, Bike, Wallet, AlertTriangle, TrendingUp, Users, Zap, X, Menu } from 'lucide-react';

type Tab = 'overview' | 'applications' | 'bikes' | 'payments' | 'defaults' | 'reports' | 'users';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const stats = mockDashboardStats;

    const sidebarItems: { id: Tab; icon: ReactNode; label: string }[] = [
        { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { id: 'applications', icon: <ClipboardList size={18} />, label: 'Applications' },
        { id: 'bikes', icon: <Bike size={18} />, label: 'Bikes' },
        { id: 'payments', icon: <Wallet size={18} />, label: 'Payments' },
        { id: 'defaults', icon: <AlertTriangle size={18} />, label: 'Defaults' },
        { id: 'reports', icon: <TrendingUp size={18} />, label: 'Reports' },
        { id: 'users', icon: <Users size={18} />, label: 'Users' },
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
                            <Zap size={24} color="var(--accent)" />
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>{APP_NAME}</span>
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
                            {mockLoans.map(loan => (
                                <div key={loan.id} className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                    <div className="flex items-start justify-between" style={{ marginBottom: '1rem' }}>
                                        <div className="flex items-center gap-4">
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: 'var(--radius-full)',
                                                background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--white)', fontWeight: 700, fontSize: 'var(--text-sm)',
                                            }}>{loan.userName.split(' ').map(n => n[0]).join('')}</div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{loan.userName}</div>
                                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{loan.userEmail}</div>
                                            </div>
                                        </div>
                                        <span className={`badge ${getStatusColor(loan.status)}`}>{capitalize(loan.status)}</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                        {[
                                            { label: 'Bike', value: loan.bikeName },
                                            { label: 'Loan Amount', value: formatNaira(loan.loanAmount) },
                                            { label: 'Tenure', value: `${loan.tenure} months` },
                                            { label: 'Monthly', value: formatNaira(loan.monthlyRepayment) },
                                            { label: 'Risk Score', value: `${loan.riskScore}/100` },
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
                                        <span className={`badge ${loan.guarantorVerified ? 'badge-success' : 'badge-warning'}`}>
                                            {loan.guarantorVerified ? '✓ Guarantor Verified' : '⏳ Guarantor Pending'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1rem' }}>
                                        <button className="btn btn-sm" style={{ background: 'var(--success)', color: 'var(--white)' }}>✓ Approve</button>
                                        <button className="btn btn-sm btn-danger">✕ Reject</button>
                                        <button className="btn btn-sm btn-outline">📄 Request Docs</button>
                                        <button className="btn btn-sm btn-ghost">View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========== BIKES TAB ========== */}
                {activeTab === 'bikes' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{mockBikes.length} bikes in inventory</span>
                            <button className="btn btn-primary btn-sm">+ Add New Bike</button>
                        </div>
                        <div className="table-container" style={{ borderRadius: 'var(--radius-2xl)' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Bike</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>BNPL</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockBikes.map(bike => (
                                        <tr key={bike.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏍️</div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{bike.name}</div>
                                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{bike.model}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{bike.category}</td>
                                            <td style={{ fontWeight: 600 }}>{formatNaira(bike.price)}</td>
                                            <td>{bike.stockQuantity}</td>
                                            <td><span className={`badge ${getStatusColor(bike.availability)}`}>{capitalize(bike.availability)}</span></td>
                                            <td>{bike.bnplEligible ? <span className="badge badge-success">Yes</span> : <span className="badge badge-default">No</span>}</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>Edit</button>
                                                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>Delete</button>
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
                                    {mockLoans.map(loan => (
                                        <tr key={loan.id}>
                                            <td style={{ fontWeight: 600 }}>{loan.userName}</td>
                                            <td>{loan.bikeName}</td>
                                            <td>{formatNaira(loan.monthlyRepayment)}</td>
                                            <td>{formatDate(loan.createdAt)}</td>
                                            <td><span className={`badge ${getStatusColor(loan.status)}`}>{capitalize(loan.status)}</span></td>
                                            <td>₦0</td>
                                            <td><button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>View</button></td>
                                        </tr>
                                    ))}
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
                                { icon: '⚠️', label: 'Overdue', value: '5', bg: 'var(--warning-bg)' },
                                { icon: '🔴', label: 'Defaulted', value: '3', bg: 'var(--danger-bg)' },
                                { icon: '📩', label: 'Reminders Sent', value: '28', bg: 'var(--info-bg)' },
                                { icon: '⚖️', label: 'Legal Cases', value: '1', bg: '#F0EBFF' },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Collections Actions</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    { type: 'SMS Reminder', desc: 'Send automated SMS reminders to overdue accounts', icon: '📱' },
                                    { type: 'Email Notice', desc: 'Send formal notice email with payment link', icon: '📧' },
                                    { type: 'WhatsApp', desc: 'Send WhatsApp reminder with payment details', icon: '💬' },
                                    { type: 'Guarantor Notice', desc: 'Notify guarantors of overdue accounts', icon: '👤' },
                                    { type: 'Account Suspension', desc: 'Suspend customer account and activate immobilizer', icon: '🔒' },
                                    { type: 'Legal Escalation', desc: 'Flag for legal action — send demand letter', icon: '⚖️' },
                                ].map(action => (
                                    <div key={action.type} className="flex items-center gap-4" style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
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
                                        { label: 'Average Loan Size', value: formatNaira(637500), icon: '💳' },
                                        { label: 'Average Tenure', value: '10.5 months', icon: '📅' },
                                        { label: 'Approval Rate', value: '78%', icon: '✅' },
                                        { label: 'On-Time Payment Rate', value: '92.3%', icon: '⏰' },
                                        { label: 'Average Risk Score', value: '74/100', icon: '📊' },
                                        { label: 'Customer Satisfaction', value: '4.6/5.0', icon: '⭐' },
                                    ].map(m => (
                                        <div key={m.label} className="flex items-center justify-between" style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                            <span className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                                                <span>{m.icon}</span> {m.label}
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
                                <button className="btn btn-outline btn-sm">📊 Active Loans (CSV)</button>
                                <button className="btn btn-outline btn-sm">📈 Revenue Report (PDF)</button>
                                <button className="btn btn-outline btn-sm">👥 Customer Data (CSV)</button>
                                <button className="btn btn-outline btn-sm">⚠️ Default Report (PDF)</button>
                                <button className="btn btn-outline btn-sm">🏍️ Bike Sales (CSV)</button>
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
            </main>
        </div>
    );
}
