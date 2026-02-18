'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KYC_DOCUMENT_TYPES } from '@/lib/constants';

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

export default function KYCPage() {
    const [selectedDocType, setSelectedDocType] = useState('');
    const [bvn, setBvn] = useState('');
    const [selfieUploaded, setSelfieUploaded] = useState(false);
    const [docUploaded, setDocUploaded] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0' }}>
                <div className="container flex items-center gap-4">
                    <Link href="/bnpl/personal-info" style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>←</Link>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>Verify Your Identity</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Step 2 of 6</div>
                    </div>
                </div>
            </nav>

            <div className="container-sm" style={{ padding: '1.5rem 1rem' }}>
                <Stepper current={1} />

                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Identity Verification</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                        To help us keep your money safe and secure, we are required by financial law to verify your identity.
                    </p>
                </div>



                {/* Document Type Selection */}
                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Document Type</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                        Select a government-issued ID document to verify
                    </p>
                    <div className="flex flex-col gap-2">
                        {KYC_DOCUMENT_TYPES.map(doc => (
                            <button key={doc.id} onClick={() => setSelectedDocType(doc.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '1rem', borderRadius: 'var(--radius-xl)',
                                    border: selectedDocType === doc.id ? '2px solid var(--primary)' : '2px solid var(--gray-200)',
                                    background: selectedDocType === doc.id ? 'rgba(45,10,78,0.03)' : 'var(--white)',
                                    cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left',
                                }}>
                                <span style={{ fontSize: '1.25rem' }}>{doc.icon}</span>
                                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', flex: 1 }}>{doc.name}</span>
                                <span style={{
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    border: selectedDocType === doc.id ? '6px solid var(--primary)' : '2px solid var(--gray-300)',
                                    transition: 'all 0.2s',
                                }} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Upload Document */}
                {selectedDocType && (
                    <div className="card card-elevated animate-fade-in-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Upload Document</h3>
                        <button onClick={() => setDocUploaded(true)}
                            style={{
                                width: '100%', padding: '2rem', borderRadius: 'var(--radius-xl)',
                                border: docUploaded ? '2px solid var(--success)' : '2px dashed var(--gray-300)',
                                background: docUploaded ? 'var(--success-bg)' : 'var(--gray-50)',
                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                            }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{docUploaded ? '✅' : '📄'}</div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: docUploaded ? 'var(--success)' : 'var(--gray-600)' }}>
                                {docUploaded ? 'Document uploaded successfully' : 'Tap to upload document'}
                            </div>
                            {!docUploaded && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '0.25rem' }}>JPG, PNG or PDF • Max 5MB</div>}
                        </button>
                    </div>
                )}

                {/* Selfie Capture */}
                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>📸</span> Live Selfie Capture
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                        Take a clear selfie for facial verification. We&apos;ll match it against your ID document.
                    </p>
                    <button onClick={() => setSelfieUploaded(true)}
                        style={{
                            width: '100%', padding: '2rem', borderRadius: 'var(--radius-xl)',
                            border: selfieUploaded ? '2px solid var(--success)' : '2px dashed var(--gray-300)',
                            background: selfieUploaded ? 'var(--success-bg)' : 'var(--gray-50)',
                            cursor: 'pointer', textAlign: 'center',
                        }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selfieUploaded ? '✅' : '🤳'}</div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: selfieUploaded ? 'var(--success)' : 'var(--gray-600)' }}>
                            {selfieUploaded ? 'Selfie captured successfully' : 'Tap to take a selfie'}
                        </div>
                    </button>
                </div>

                <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                    <Link href="/bnpl/personal-info" className="btn btn-ghost">← Back</Link>
                    <Link href="/bnpl/financial" className="btn btn-primary">Continue →</Link>
                </div>
            </div>
        </div>
    );
}
