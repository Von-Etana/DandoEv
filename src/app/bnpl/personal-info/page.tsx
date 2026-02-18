'use client';

import { useState } from 'react';
import Link from 'next/link';
import { APP_NAME, EMPLOYMENT_OPTIONS, NIGERIAN_STATES } from '@/lib/constants';

const BNPL_STEPS = ['Personal Info', 'Identity (KYC)', 'Financial', 'Guarantor', 'Loan Terms', 'Submit'];

function Stepper({ current }: { current: number }) {
    return (
        <div className="stepper" style={{ marginBottom: '2rem' }}>
            {BNPL_STEPS.map((label, i) => (
                <div key={i} className="stepper-step">
                    <div className={`stepper-dot ${i < current ? 'completed' : i === current ? 'active' : ''}`}>
                        {i < current ? '✓' : i + 1}
                    </div>
                    <span className="stepper-label">{label}</span>
                    {i < BNPL_STEPS.length - 1 && <div className={`stepper-line ${i < current ? 'completed' : ''}`} />}
                </div>
            ))}
        </div>
    );
}

export default function PersonalInfoPage() {
    const [form, setForm] = useState({
        firstName: '', lastName: '', dateOfBirth: '', gender: '', address: '',
        city: '', state: '', employmentStatus: '', monthlyIncome: '', employerName: '', employerAddress: '',
    });
    const u = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0' }}>
                <div className="container flex items-center gap-4">
                    <Link href="/bikes" style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>←</Link>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>BNPL Application</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Step 1 of 6</div>
                    </div>
                </div>
            </nav>

            <div className="container-sm" style={{ padding: '1.5rem 1rem' }}>
                <Stepper current={0} />

                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Personal Information</h1>
                    <div className="alert alert-warning" style={{ fontSize: 'var(--text-xs)' }}>
                        <span>⚠️</span>
                        <span>Please ensure the name matches your government-issued ID</span>
                    </div>
                </div>

                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                    <div className="flex flex-col gap-4">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input className="form-input" placeholder="Muhammad" value={form.firstName} onChange={e => u('firstName', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input className="form-input" placeholder="Abubakr" value={form.lastName} onChange={e => u('lastName', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => u('dateOfBirth', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="form-select" value={form.gender} onChange={e => u('gender', e.target.value)}>
                                    <option value="">Select</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Home Address</label>
                            <input className="form-input" placeholder="24 Sandstrip Oworoshoki" value={form.address} onChange={e => u('address', e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input className="form-input" placeholder="Lagos" value={form.city} onChange={e => u('city', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <select className="form-select" value={form.state} onChange={e => u('state', e.target.value)}>
                                    <option value="">Select state</option>
                                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: 'var(--text-base)' }}>Employment Details</h3>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Employment Status</label>
                            <select className="form-select" value={form.employmentStatus} onChange={e => u('employmentStatus', e.target.value)}>
                                <option value="">Select</option>
                                {EMPLOYMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Monthly Income (₦)</label>
                            <input className="form-input" type="number" placeholder="350000" value={form.monthlyIncome} onChange={e => u('monthlyIncome', e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Employer / Platform</label>
                                <select className="form-select" value={form.employerName} onChange={e => u('employerName', e.target.value)}>
                                    <option value="">Select Platform</option>
                                    <option value="Bolt">Bolt</option>
                                    <option value="Chowdeck">Chowdeck</option>
                                    <option value="Glovo">Glovo</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Office Address / Hub</label>
                                <input className="form-input" placeholder="Office address" value={form.employerAddress} onChange={e => u('employerAddress', e.target.value)} />
                            </div>
                        </div>

                        {(['Bolt', 'Chowdeck', 'Glovo'].includes(form.employerName)) && (
                            <div className="form-group animate-fade-in-up">
                                <label className="form-label">Upload {form.employerName} Account Dashboard</label>
                                <div style={{ border: '2px dashed var(--gray-300)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', cursor: 'pointer', background: 'var(--gray-50)' }}>
                                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📊</span>
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', fontWeight: 500 }}>Click to upload screenshot of your dashboard</span>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '0.25rem' }}>Showing total rides/earnings</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                    <Link href="/bikes" className="btn btn-ghost">Cancel</Link>
                    <Link href="/bnpl/kyc" className="btn btn-primary">Continue →</Link>
                </div>
            </div>
        </div>
    );
}
