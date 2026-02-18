'use client';

import { useState } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function SignUpPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ email: '', phone: '', password: '', confirmPassword: '', otp: '' });
    const [showPassword, setShowPassword] = useState(false);

    const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--cream) 0%, #FFE8D6 50%, var(--mint) 100%)',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Top bar */}
            <div style={{ padding: '1rem' }}>
                <Link href="/" className="flex items-center gap-2" style={{ display: 'inline-flex' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚡</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{APP_NAME}</span>
                </Link>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="animate-fade-in-up" style={{ maxWidth: '420px', width: '100%' }}>
                    {step === 1 ? (
                        <>
                            {/* Main Card */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏍️</div>
                                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Create Account</h1>
                                <p style={{ color: 'var(--gray-600)' }}>Join {APP_NAME} and ride electric today</p>
                            </div>

                            <div className="card card-elevated" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
                                <div className="flex flex-col gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input className="form-input" type="email" placeholder="you@example.com"
                                            value={form.email} onChange={e => updateForm('email', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>🇳🇬 +234</span>
                                            <input className="form-input" type="tel" placeholder="8012345678"
                                                style={{ paddingLeft: '5rem' }}
                                                value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters"
                                                value={form.password} onChange={e => updateForm('password', e.target.value)} />
                                            <button onClick={() => setShowPassword(!showPassword)} style={{
                                                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                                color: 'var(--gray-500)', fontSize: 'var(--text-sm)', cursor: 'pointer',
                                            }}>{showPassword ? '🙈' : '👁️'}</button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
                                        <input className="form-input" type="password" placeholder="Re-enter password"
                                            value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} />
                                    </div>
                                    <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(2)} style={{ marginTop: '0.5rem' }}>
                                        Continue →
                                    </button>
                                </div>
                            </div>

                            <div className="text-center" style={{ marginTop: '1.5rem' }}>
                                <span style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Already have an account? </span>
                                <Link href="/auth/signin" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>Sign In</Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* OTP Step */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Verify Your Number</h1>
                                <p style={{ color: 'var(--gray-600)' }}>We sent a 6-digit code to +234{form.phone}</p>
                            </div>

                            <div className="card card-elevated" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
                                <div className="flex flex-col gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Enter OTP Code</label>
                                        <input className="form-input" type="text" placeholder="000000" maxLength={6}
                                            style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', letterSpacing: '0.5em', fontWeight: 700 }}
                                            value={form.otp} onChange={e => updateForm('otp', e.target.value.replace(/\D/g, ''))} />
                                    </div>
                                    <Link href="/dashboard" className="btn btn-primary btn-full btn-lg">
                                        Verify & Create Account
                                    </Link>
                                    <div className="text-center">
                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>Resend Code</button>
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Back</button>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="text-center" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                        <Link href="#">Help</Link>
                        <span>•</span>
                        <Link href="#">Terms</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
