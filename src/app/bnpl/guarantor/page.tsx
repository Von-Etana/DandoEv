'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RELATIONSHIP_TYPES } from '@/lib/constants';
import { CheckCircle2, Info } from 'lucide-react';

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

export default function GuarantorPage() {
    const router = useRouter();
    const [guarantors, setGuarantors] = useState([
        { fullName: '', email: '', phone: '', relationship: '', invited: false },
        { fullName: '', email: '', phone: '', relationship: '', invited: false }
    ]);

    useEffect(() => {
        const saved = sessionStorage.getItem('bnpl_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.guarantors && Array.isArray(parsed.guarantors)) {
                    setGuarantors(parsed.guarantors);
                }
            } catch (e) {}
        }
    }, []);

    const updateGuarantor = (index: number, field: string, value: string | boolean) => {
        setGuarantors(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleInvite = (index: number) => {
        updateGuarantor(index, 'invited', true);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0' }}>
                <div className="container flex items-center gap-4">
                    <Link href="/bnpl/financial" style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>←</Link>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>Guarantor Details</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Step 4 of 6</div>
                    </div>
                </div>
            </nav>

            <div className="container-sm" style={{ padding: '1.5rem 1rem' }}>
                <Stepper current={3} />
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Add Guarantors</h1>
                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    You must provide two guarantors. They will receive an invite to confirm their identity and accept guarantor obligations.
                </p>

                {guarantors.map((g, index) => (
                    <div key={index} className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1rem' }}>Guarantor {index + 1}</h3>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" placeholder="Guarantor's full name" value={g.fullName} onChange={e => updateGuarantor(index, 'fullName', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input className="form-input" type="email" placeholder="guarantor@email.com" value={g.email} onChange={e => updateGuarantor(index, 'email', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>🇳🇬 +234</span>
                                    <input className="form-input" type="tel" placeholder="8098765432" style={{ paddingLeft: '5rem' }}
                                        value={g.phone} onChange={e => updateGuarantor(index, 'phone', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Relationship to You</label>
                                <select className="form-select" value={g.relationship} onChange={e => updateGuarantor(index, 'relationship', e.target.value)}>
                                    <option value="">Select relationship</option>
                                    {RELATIONSHIP_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <button className="btn btn-primary btn-full" onClick={() => handleInvite(index)}>
                                {g.invited ? `✓ Invite Sent to Guarantor ${index + 1}` : `📩 Send Guarantor ${index + 1} Invite`}
                            </button>
                        </div>
                    </div>
                ))}

                {(guarantors[0].invited || guarantors[1].invited) && (
                    <div className="alert alert-success animate-fade-in-up" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                        <span style={{ display: 'flex', color: 'var(--success)' }}><CheckCircle2 size={18} /></span>
                        <div>
                            <strong>{guarantors[0].invited && guarantors[1].invited ? 'Invites sent successfully!' : 'Invite sent successfully!'}</strong>
                            <p style={{ fontSize: 'var(--text-xs)', marginTop: '0.25rem' }}>Your guarantor{guarantors[0].invited && guarantors[1].invited ? 's' : ''} will receive an email and SMS with instructions to verify their identity.</p>
                        </div>
                    </div>
                )}

                <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', background: 'var(--warning-bg)', border: '1px solid #F9E79F' }}>
                    <h4 style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={16} color="#D68910" /> Guarantor Requirements
                    </h4>
                    <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-700)', lineHeight: 1.8, listStyle: 'disc', paddingLeft: '1.25rem' }}>
                        <li>Must be a Nigerian resident aged 21 or above</li>
                        <li>Must have a valid government-issued ID and BVN</li>
                        <li>Must verify their identity via our link</li>
                        <li>Must digitally sign the guarantor agreement</li>
                        <li>Will be contacted if borrower defaults on payments</li>
                    </ul>
                </div>

                <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                    <Link href="/bnpl/financial" className="btn btn-ghost">← Back</Link>
                    <button onClick={() => {
                        const saved = JSON.parse(sessionStorage.getItem('bnpl_data') || '{}');
                        sessionStorage.setItem('bnpl_data', JSON.stringify({ ...saved, guarantors }));
                        router.push('/bnpl/loan-terms');
                    }} className={`btn btn-primary ${(!guarantors[0].invited || !guarantors[1].invited) ? 'disabled' : ''}`} style={{ opacity: (guarantors[0].invited && guarantors[1].invited) ? 1 : 0.5, pointerEvents: (guarantors[0].invited && guarantors[1].invited) ? 'auto' : 'none' }}>Continue →</button>
                </div>
            </div>
        </div>
    );
}
