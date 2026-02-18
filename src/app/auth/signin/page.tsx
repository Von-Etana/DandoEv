'use client';

import { useState } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleDemoLogin = () => {
        setForm({ email: 'adebayo@demo.com', password: 'password123' });
        setTimeout(() => router.push('/dashboard'), 600);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--cream) 0%, var(--mint) 100%)',
            display: 'flex', flexDirection: 'column',
        }}>
            <div style={{ padding: '1rem' }}>
                <Link href="/" className="flex items-center gap-2" style={{ display: 'inline-flex' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚡</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{APP_NAME}</span>
                </Link>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="animate-fade-in-up" style={{ maxWidth: '420px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome Back</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Sign in to your {APP_NAME} account</p>
                    </div>

                    <div className="card card-elevated" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Email or Phone</label>
                                <input className="form-input" type="text" placeholder="you@example.com"
                                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                                    <button onClick={() => setShowPassword(!showPassword)} style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        color: 'var(--gray-500)', fontSize: 'var(--text-sm)',
                                    }}>{showPassword ? '🙈' : '👁️'}</button>
                                </div>
                                <div className="text-right">
                                    <Link href="#" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 500 }}>Forgot Password?</Link>
                                </div>
                            </div>
                            <Link href="/dashboard" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '0.5rem' }}>
                                Sign In
                            </Link>
                            <div className="text-center" style={{ position: 'relative', padding: '0.5rem 0' }}>
                                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--gray-200)' }}></div>
                                <span style={{ position: 'relative', background: 'var(--white)', padding: '0 0.75rem', fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>or</span>
                            </div>
                            <button onClick={handleDemoLogin} className="btn btn-accent btn-full" style={{ marginBottom: '0.5rem', fontSize: 'var(--text-sm)' }}>
                                👤 Demo Buyer Login
                            </button>
                            <Link href="/admin" className="btn btn-outline btn-full" style={{ fontSize: 'var(--text-sm)' }}>
                                🔐 Admin Login
                            </Link>
                        </div>
                    </div>

                    <div className="text-center" style={{ marginTop: '1.5rem' }}>
                        <span style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Don&apos;t have an account? </span>
                        <Link href="/auth/signup" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>Create Account</Link>
                    </div>

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
