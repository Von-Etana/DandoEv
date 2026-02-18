'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NIGERIAN_BANKS } from '@/lib/constants';

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

export default function FinancialInfoPage() {
    const [form, setForm] = useState({ bankName: '', accountNumber: '', accountName: '', mandateAccepted: false });
    const [incomeVerified, setIncomeVerified] = useState(false);
    const u = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0' }}>
                <div className="container flex items-center gap-4">
                    <Link href="/bnpl/kyc" style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>←</Link>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>Financial Information</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Step 3 of 6</div>
                    </div>
                </div>
            </nav>

            <div className="container-sm" style={{ padding: '1.5rem 1rem' }}>
                <Stepper current={2} />
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '1.5rem' }}>Bank & Financial Details</h1>

                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Bank Account Details</h3>
                    <div className="flex flex-col gap-4">
                        <div className="form-group">
                            <label className="form-label">Bank Name</label>
                            <select className="form-select" value={form.bankName} onChange={e => u('bankName', e.target.value)}>
                                <option value="">Select bank</option>
                                {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Account Number</label>
                            <input className="form-input" placeholder="0123456789" maxLength={10}
                                value={form.accountNumber} onChange={e => u('accountNumber', e.target.value.replace(/\D/g, ''))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Account Holder Name</label>
                            <input className="form-input" placeholder="As it appears on your bank account"
                                value={form.accountName} onChange={e => u('accountName', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Direct Debit Mandate</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
                        By setting up a direct debit mandate, you authorize VoltRide to debit your account for monthly repayments.
                        This ensures timely payments and protects your credit score.
                    </p>
                    <div style={{ background: 'var(--info-bg)', padding: '1rem', borderRadius: 'var(--radius-xl)', marginBottom: '1rem' }}>
                        <div className="flex items-start gap-3">
                            <span>ℹ️</span>
                            <div style={{ fontSize: 'var(--text-xs)', color: '#2471A3', lineHeight: 1.6 }}>
                                <strong>Mandate Details:</strong> Debit will happen on the due date of each installment.
                                You&apos;ll be notified 3 days before each debit. You can cancel the mandate at any time (note: this may affect your BNPL terms).
                            </div>
                        </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.mandateAccepted}
                            onChange={e => u('mandateAccepted', e.target.checked)}
                            style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                            I authorize VoltRide to set up a direct debit mandate on my bank account for the purpose of monthly BNPL repayments.
                        </span>
                    </label>
                </div>

                {/* Income Verification */}
                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                        <h3 style={{ fontWeight: 700 }}>Income Verification (Required)</h3>
                        {incomeVerified && <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>✓ Verified</span>}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                        Upload a bank statement or connect via Open Banking to verify your income. This is mandatory for approval.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setIncomeVerified(true)} className={`btn btn-sm flex-1 ${incomeVerified ? 'btn-success' : 'btn-outline'}`} style={{ fontSize: 'var(--text-xs)' }}>
                            {incomeVerified ? '📄 Statement Uploaded' : '📄 Upload Statement'}
                        </button>
                        <button onClick={() => setIncomeVerified(true)} className={`btn btn-sm flex-1 ${incomeVerified ? 'btn-success' : 'btn-outline'}`} style={{ fontSize: 'var(--text-xs)' }}>
                            {incomeVerified ? '🏦 Bank Connected' : '🏦 Connect Bank'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                    <Link href="/bnpl/kyc" className="btn btn-ghost">← Back</Link>
                    <button
                        onClick={() => {
                            if (incomeVerified) {
                                window.location.href = '/bnpl/guarantor';
                            } else {
                                alert('Please complete income verification to continue.');
                            }
                        }}
                        className={`btn btn-primary ${!incomeVerified ? 'disabled' : ''}`}
                        style={{ opacity: incomeVerified ? 1 : 0.5, cursor: incomeVerified ? 'pointer' : 'not-allowed' }}
                    >
                        Continue →
                    </button>
                </div>
            </div>
        </div>
    );
}
