'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function CheckoutCallbackPage() {
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        if (!reference) {
            setStatus('failed');
            setMessage('No payment reference found.');
            return;
        }

        const verifyPayment = async () => {
            try {
                const token = document.cookie.split('token=')[1]?.split(';')[0];
                const res = await fetch(`/api/payments/verify?reference=${reference}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data.status === 'success') {
                        setStatus('success');
                        setMessage('Your payment was successful and your order is confirmed!');
                    } else {
                        setStatus('failed');
                        setMessage('Payment verification failed.');
                    }
                } else {
                    setStatus('failed');
                    setMessage('Failed to verify payment with server.');
                }
            } catch (error) {
                setStatus('failed');
                setMessage('Network error during verification.');
            }
        };

        verifyPayment();
    }, [reference]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card card-elevated animate-scale-in" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                {status === 'verifying' && (
                    <>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
                            background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Loader2 size={40} color="var(--primary)" className="animate-spin" />
                        </div>
                        <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Verifying Payment</h2>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
                            background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 0 10px rgba(46,204,113,0.1)',
                        }}>
                            <CheckCircle2 size={40} color="var(--success)" strokeWidth={3} />
                        </div>
                        <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Order Confirmed!</h2>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>{message}</p>
                        <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
                            Reference: <strong>{reference}</strong>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link href="/dashboard" className="btn btn-primary btn-full">Go to Dashboard</Link>
                            <Link href="/bikes" className="btn btn-outline btn-full">Continue Shopping</Link>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
                            background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 0 10px rgba(231,76,60,0.1)',
                        }}>
                            <XCircle size={40} color="var(--danger)" strokeWidth={3} />
                        </div>
                        <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Payment Failed</h2>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>{message}</p>
                        <div className="flex flex-col gap-2">
                            <Link href="/checkout" className="btn btn-primary btn-full">Try Again</Link>
                            <Link href="/dashboard" className="btn btn-outline btn-full">Go to Dashboard</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
