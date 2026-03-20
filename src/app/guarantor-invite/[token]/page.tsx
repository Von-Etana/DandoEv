'use client';

import { useState } from 'react';
import { APP_NAME } from '@/lib/constants';

// This acts as a standalone web page that guarantors will open from SMS/Email
export default function GuarantorVerifyPage({ params }: { params: { token: string } }) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Mock data for the invitation token
    const loanSummary = {
        buyerName: 'Adebayo Johnson',
        bikeName: 'Dando S-Series Commuter',
        installmentAmount: '₦1,850',
        frequency: 'Bi-daily'
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="card card-elevated animate-scale-in" style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: '480px', borderRadius: 'var(--radius-2xl)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Identity Verified</h2>
                    <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        Thank you for registering as a guarantor for {loanSummary.buyerName}. Your data has been securely submitted.
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>You can close this tab safely.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'var(--primary)', padding: '1rem 0' }}>
                <div className="container-sm text-center">
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--white)' }}>{APP_NAME}</span>
                </div>
            </nav>

            <div className="container-sm" style={{ padding: '2rem 1rem' }}>
                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1.5rem', background: 'var(--gray-50)' }}>
                    <h1 style={{ fontWeight: 800, fontSize: 'var(--text-xl)', marginBottom: '1rem' }}>Guarantor Request</h1>
                    <p style={{ color: 'var(--gray-700)', fontSize: 'var(--text-sm)' }}>
                        <strong>{loanSummary.buyerName}</strong> has requested you as a guarantor for the <strong>{loanSummary.bikeName}</strong>.
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.7)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginTop: '1rem' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Buyer Commitment</div>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 'var(--text-lg)' }}>{loanSummary.installmentAmount} <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-600)' }}>{loanSummary.frequency}</span></div>
                    </div>
                </div>

                {step === 1 && (
                    <div className="card animate-fade-in-right" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Step 1: Your Details</h2>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" placeholder="As it appears on your ID" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="form-input" placeholder="080..." type="tel" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Relationship to Buyer</label>
                                <select className="form-select">
                                    <option>Select</option>
                                    <option>Parent</option>
                                    <option>Sibling</option>
                                    <option>Friend</option>
                                    <option>Colleague</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <button onClick={() => setStep(2)} className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>Continue</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="card animate-fade-in-right" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Step 2: Identity (KYC)</h2>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Bank Verification Number (BVN)</label>
                                <input className="form-input" placeholder="11-digit BVN" type="number" />
                                <span className="form-error" style={{ color: 'var(--gray-500)' }}>Your BVN is secure and only used to verify your identity.</span>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Upload Valid ID (NIN, Passport)</label>
                                <input className="form-input" type="file" accept="image/*" />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}>Back</button>
                                <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2 }}>Continue</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="card animate-fade-in-right" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Step 3: Agreement</h2>
                        
                        <div className="alert alert-warning" style={{ fontSize: 'var(--text-xs)', marginBottom: '1.5rem' }}>
                            <span>⚠️</span>
                            <strong>Legal Obligation:</strong> By accepting to be a guarantor, you agree to assume the financial responsibility of {loanSummary.buyerName}'s loan if they default.
                        </div>

                        <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--gray-700)' }}>
                            <input type="checkbox" style={{ marginTop: '0.25rem', width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                            <span>I confirm that the information provided is accurate and I agree to DandoEv's Guarantor Terms and Conditions.</span>
                        </label>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setStep(2)} className="btn btn-ghost" disabled={isSubmitting} style={{ flex: 1 }}>Back</button>
                            <button onClick={() => {
                                setIsSubmitting(true);
                                setTimeout(() => setSuccess(true), 1500);
                            }} className="btn btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                                {isSubmitting ? 'Submitting...' : 'Accept & Submit'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
