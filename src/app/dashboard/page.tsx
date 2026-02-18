'use client';

import Link from 'next/link';
import { mockLoans, mockRepayments, mockOrders, mockBikes } from '@/lib/mock-data';
import { formatNaira, formatDate, capitalize, getStatusColor } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { Wallet, Calendar, CheckCircle, Bike, ClipboardList, Phone, Settings, Zap, Package } from 'lucide-react';

export default function CustomerDashboard() {
    const user = { firstName: 'Adebayo', lastName: 'Johnson' };
    const activeLoan = mockLoans.find(l => l.status === 'active');
    const nextPayment = mockRepayments.find(r => r.status === 'upcoming');
    const recentOrder = mockOrders[0];
    const paidCount = mockRepayments.filter(r => r.status === 'paid').length;
    const totalCount = mockRepayments.length;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            {/* Nav */}
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0' }}>
                <div className="container flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Zap size={24} color="var(--accent-dark)" />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{APP_NAME}</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/bikes" className="btn btn-ghost btn-sm">Browse Bikes</Link>
                        <Link href="/admin" className="btn btn-outline btn-sm">Admin</Link>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Greeting */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>
                        Welcome back, {user.firstName}! 👋
                    </h1>
                    <p style={{ color: 'var(--gray-600)' }}>Here&apos;s your account overview</p>
                </div>

                {/* Stats */}
                <div className="grid grid-4" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
                    {[
                        { icon: <Wallet size={22} />, label: 'Active Loan', value: activeLoan ? formatNaira(activeLoan.loanAmount) : 'None', bg: '#F0EBFF' },
                        { icon: <Calendar size={22} />, label: 'Next Payment', value: nextPayment ? formatNaira(nextPayment.amount) : 'N/A', bg: 'var(--warning-bg)' },
                        { icon: <CheckCircle size={22} />, label: 'Payments Made', value: `${paidCount}/${totalCount}`, bg: 'var(--success-bg)' },
                        { icon: <Bike size={22} />, label: 'My Bikes', value: '1', bg: 'var(--mint)' },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                            <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid-cols-2-1">
                    {/* Main Content */}
                    <div>
                        {/* Active Loan Card */}
                        {activeLoan && (
                            <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1.5rem' }}>
                                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                                    <h2 style={{ fontWeight: 700 }}>Active Loan</h2>
                                    <span className={`badge ${getStatusColor(activeLoan.status)}`}>{capitalize(activeLoan.status)}</span>
                                </div>
                                <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, #F0EBFF, #E8FFF5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>🏍️</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>{activeLoan.bikeName}</div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{activeLoan.tenure} months tenure</div>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div className="flex justify-between" style={{ fontSize: 'var(--text-xs)', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--gray-500)' }}>Repayment Progress</span>
                                        <span style={{ fontWeight: 600 }}>{paidCount} of {activeLoan.tenure} payments</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(paidCount / activeLoan.tenure) * 100}%`, background: 'var(--accent)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Monthly</div>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{formatNaira(activeLoan.monthlyRepayment)}</div>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Total Paid</div>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--success)' }}>{formatNaira(activeLoan.monthlyRepayment * paidCount)}</div>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Remaining</div>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>{formatNaira(activeLoan.totalRepayable - (activeLoan.monthlyRepayment * paidCount))}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Schedule */}
                        <div className="card card-elevated" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                            <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
                                <h2 style={{ fontWeight: 700 }}>Payment Schedule</h2>
                            </div>
                            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Amount</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                            <th>Late Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockRepayments.map(r => (
                                            <tr key={r.id}>
                                                <td style={{ fontWeight: 600 }}>{r.installmentNumber}</td>
                                                <td>{formatNaira(r.amount)}</td>
                                                <td>{formatDate(r.dueDate)}</td>
                                                <td><span className={`badge ${getStatusColor(r.status)}`}>{capitalize(r.status)}</span></td>
                                                <td>{r.lateFee > 0 ? formatNaira(r.lateFee) : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Next Payment Card */}
                        {nextPayment && (
                            <div style={{
                                padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem',
                                background: 'var(--primary-gradient)', color: 'var(--white)',
                            }}>
                                <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: '0.25rem' }}>Next Payment Due</p>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.25rem' }}>{formatNaira(nextPayment.amount)}</div>
                                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: '1rem' }}>{formatDate(nextPayment.dueDate)}</div>
                                <button className="btn btn-accent btn-full btn-sm">Pay Now</button>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="card card-elevated" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: 'var(--text-sm)' }}>Quick Actions</h3>
                            <div className="flex flex-col gap-2">
                                {[
                                    { icon: <Bike size={18} />, label: 'Browse Bikes', href: '/bikes' },
                                    { icon: <ClipboardList size={18} />, label: 'Apply for BNPL', href: '/bnpl/personal-info' },
                                    { icon: <Phone size={18} />, label: 'Contact Support', href: '#' },
                                    { icon: <Settings size={18} />, label: 'Account Settings', href: '#' },
                                ].map(a => (
                                    <Link key={a.label} href={a.href}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem', borderRadius: 'var(--radius-lg)',
                                            background: 'var(--gray-50)', fontSize: 'var(--text-sm)', fontWeight: 500,
                                            transition: 'all 0.15s',
                                        }}>
                                        <span style={{ color: 'var(--primary)' }}>{a.icon}</span> {a.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Order */}
                        {recentOrder && (
                            <div className="card card-elevated" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-2xl)' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: 'var(--text-sm)' }}>Recent Order</h3>
                                <div className="flex items-center gap-3">
                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏍️</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{recentOrder.bikeName}</div>
                                        <span className={`badge ${getStatusColor(recentOrder.status)}`}>{capitalize(recentOrder.status)}</span>
                                    </div>
                                </div>
                                {recentOrder.trackingNumber && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                        Tracking: <strong>{recentOrder.trackingNumber}</strong>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
