'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockBikes } from '@/lib/mock-data';
import { formatNaira } from '@/lib/utils';
import { APP_NAME, PAYMENT_METHODS, NIGERIAN_STATES } from '@/lib/constants';

export default function CheckoutPage() {
    const bike = mockBikes[0];
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [delivery, setDelivery] = useState({ address: '', city: '', state: '', phone: '' });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0' }}>
                <div className="container flex items-center gap-4">
                    <Link href="/bikes" style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>←</Link>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>Checkout</span>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '900px', padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    {/* Left */}
                    <div>
                        {step === 1 ? (
                            <div className="card card-elevated animate-fade-in" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>📍 Delivery Details</h2>
                                <div className="flex flex-col gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Delivery Address</label>
                                        <input className="form-input" placeholder="Street address" value={delivery.address} onChange={e => setDelivery(d => ({ ...d, address: e.target.value }))} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">City</label>
                                            <input className="form-input" placeholder="City" value={delivery.city} onChange={e => setDelivery(d => ({ ...d, city: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">State</label>
                                            <select className="form-select" value={delivery.state} onChange={e => setDelivery(d => ({ ...d, state: e.target.value }))}>
                                                <option value="">Select</option>
                                                {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input className="form-input" type="tel" placeholder="08012345678" value={delivery.phone} onChange={e => setDelivery(d => ({ ...d, phone: e.target.value }))} />
                                    </div>
                                    <button className="btn btn-primary btn-full" onClick={() => setStep(2)}>Continue to Payment →</button>
                                </div>
                            </div>
                        ) : step === 2 ? (
                            <div className="card card-elevated animate-fade-in" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>💳 Payment Method</h2>
                                <div className="flex flex-col gap-3" style={{ marginBottom: '1.5rem' }}>
                                    {PAYMENT_METHODS.map(pm => (
                                        <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '1rem',
                                                padding: '1rem', borderRadius: 'var(--radius-xl)',
                                                border: paymentMethod === pm.id ? '2px solid var(--primary)' : '2px solid var(--gray-200)',
                                                background: paymentMethod === pm.id ? 'rgba(45,10,78,0.03)' : 'var(--white)',
                                                cursor: 'pointer', width: '100%', textAlign: 'left',
                                            }}>
                                            <span style={{ fontSize: '1.5rem' }}>{pm.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{pm.name}</div>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{pm.description}</div>
                                            </div>
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '50%',
                                                border: paymentMethod === pm.id ? '6px solid var(--primary)' : '2px solid var(--gray-300)',
                                            }} />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                                    <button className="btn btn-primary flex-1" onClick={() => setStep(3)}>Pay {formatNaira(bike.price)} →</button>
                                </div>
                            </div>
                        ) : (
                            <div className="card card-elevated animate-scale-in" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', textAlign: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
                                    background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', boxShadow: '0 0 0 10px rgba(46,204,113,0.1)',
                                }}>✅</div>
                                <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Order Confirmed!</h2>
                                <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>Your order has been placed successfully. Tracking details will be sent via email.</p>
                                <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
                                    Order ID: <strong>VR-ORD-{Math.random().toString(36).substring(2, 8).toUpperCase()}</strong>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Link href="/dashboard" className="btn btn-primary btn-full">Go to Dashboard</Link>
                                    <Link href="/bikes" className="btn btn-outline btn-full">Continue Shopping</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Order Summary */}
                    <div>
                        <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', position: 'sticky', top: '5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
                            <div className="flex items-center gap-3" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-lg)', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🏍️</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{bike.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Qty: 1</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                                <div className="flex justify-between"><span style={{ color: 'var(--gray-500)' }}>Subtotal</span><span>{formatNaira(bike.price)}</span></div>
                                <div className="flex justify-between"><span style={{ color: 'var(--gray-500)' }}>Delivery</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>Free</span></div>
                                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem', marginTop: '0.25rem' }} className="flex justify-between">
                                    <span style={{ fontWeight: 700 }}>Total</span>
                                    <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--primary)' }}>{formatNaira(bike.price)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2" style={{ marginTop: '1rem', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                <span>🔒</span> Secured by 256-bit encryption
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
