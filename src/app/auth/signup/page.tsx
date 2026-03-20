'use client';

import { useState } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Bike, Eye, EyeOff, Smartphone } from 'lucide-react';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', otp: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                }),
            });

            if (res.ok) {
                router.push(redirectTo);
            } else {
                const data = await res.json();
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--gray-50)',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Top bar */}
            <div style={{ padding: '1rem' }}>
                <Link href="/" className="flex items-center gap-2" style={{ display: 'inline-flex' }}>
                    <img src="/logo.png" alt={APP_NAME} style={{ height: '32px', width: 'auto' }} />
                </Link>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="animate-fade-in-up" style={{ maxWidth: '420px', width: '100%' }}>
                    {step === 1 ? (
                        <>
                            {/* Main Card */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}><Bike size={48} /></div>
                                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Create Account</h1>
                                <p style={{ color: 'var(--gray-600)' }}>Join {APP_NAME} and ride electric today</p>
                            </div>

                            <div className="card card-elevated" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
                                {error && (
                                    <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">First Name</label>
                                            <input className="form-input" required placeholder="John"
                                                value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Last Name</label>
                                            <input className="form-input" required placeholder="Doe"
                                                value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input className="form-input" type="email" required placeholder="you@example.com"
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
                                            }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
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
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}><Smartphone size={48} /></div>
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
                                    <button onClick={() => handleSubmit()} className="btn btn-primary btn-full btn-lg" disabled={loading}>
                                        {loading ? 'Processing...' : 'Verify & Create Account'}
                                    </button>
                                    
                                    <div className="text-center">
                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>Resend Code</button>
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} disabled={loading}>← Back</button>
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
