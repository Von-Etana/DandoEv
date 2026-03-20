'use client';

import { useState } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

import { useRouter } from 'next/navigation';
import { User, Eye, EyeOff, Lock } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const data = await res.json();
                // Access token is usually saved in memory or cookie (already set by API)
                router.push(redirectTo);
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'adebayo@demo.com', password: 'password123' }),
            });

            if (res.ok) {
                router.push(redirectTo);
            } else {
                setError('Demo login failed');
            }
        } catch (err) {
            setError('Network error');
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
            <div style={{ padding: '1rem' }}>
                <Link href="/" className="flex items-center gap-2" style={{ display: 'inline-flex' }}>
                    <img src="/logo.png" alt={APP_NAME} style={{ height: '32px', width: 'auto' }} />
                </Link>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="animate-fade-in-up" style={{ maxWidth: '420px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}><User size={48} /></div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome Back</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Sign in to your {APP_NAME} account</p>
                    </div>

                    <div className="card card-elevated" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
                        {error && (
                            <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input className="form-input" type="email" required placeholder="you@example.com"
                                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="form-input" type={showPassword ? 'text' : 'password'} required placeholder="Enter your password"
                                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        color: 'var(--gray-500)', fontSize: 'var(--text-sm)', background: 'none', border: 'none', cursor: 'pointer'
                                    }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                <div className="text-right">
                                    <Link href="#" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 500 }}>Forgot Password?</Link>
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '0.5rem' }} disabled={loading}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="text-center" style={{ position: 'relative', padding: '0.5rem 0' }}>
                                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--gray-200)' }}></div>
                                <span style={{ position: 'relative', background: 'var(--white)', padding: '0 0.75rem', fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>or</span>
                            </div>
                            
                            <button type="button" onClick={handleDemoLogin} className="btn btn-accent btn-full flex items-center justify-center gap-2" style={{ marginBottom: '0.5rem', fontSize: 'var(--text-sm)' }}>
                                <User size={16} /> Demo Buyer Login
                            </button>
                            <Link href="/admin" className="btn btn-outline btn-full flex items-center justify-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                                <Lock size={16} /> Admin Login
                            </Link>
                        </form>
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
