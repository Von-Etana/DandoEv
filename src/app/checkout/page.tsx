'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockBikes } from '@/lib/mock-data';
import { formatNaira } from '@/lib/utils';
import { APP_NAME, PAYMENT_METHODS, NIGERIAN_STATES } from '@/lib/constants';
import { Bike, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
    const bike = mockBikes[0];
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'home'>('home');
    const [buyer, setBuyer] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [delivery, setDelivery] = useState({ address: '', city: '', state: '' });
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState('');

    // Calculate delivery fee
    const deliveryFee = deliveryType === 'pickup' ? 0 : (delivery.state === 'Lagos' ? 10000 : (delivery.state ? 20000 : 0));
    const total = bike.price + deliveryFee;

    const uB = (field: string, value: string) => setBuyer(prev => ({ ...prev, [field]: value }));
    const uD = (field: string, value: string) => setDelivery(prev => ({ ...prev, [field]: value }));

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0' }}>
                <div className="container flex items-center gap-4">
                    <Link href="/bikes" style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>←</Link>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>Checkout</span>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '900px', padding: '2rem 1rem' }}>
                <div className="grid grid-2" style={{ gap: '2rem' }}>
                    {/* Left */}
                    <div>
                        {step === 1 ? (
                            <div className="card card-elevated animate-fade-in" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>📍 Buyer & Delivery Details</h2>
                                
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">First Name</label>
                                            <input className="form-input" placeholder="First Name" value={buyer.firstName} onChange={e => uB('firstName', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Last Name</label>
                                            <input className="form-input" placeholder="Last Name" value={buyer.lastName} onChange={e => uB('lastName', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Email Address</label>
                                            <input className="form-input" type="email" placeholder="you@ex.com" value={buyer.email} onChange={e => uB('email', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input className="form-input" type="tel" placeholder="080..." value={buyer.phone} onChange={e => uB('phone', e.target.value)} />
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                        <label className="form-label">Delivery Options</label>
                                        <div className="flex gap-4" style={{ marginBottom: '1rem' }}>
                                            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input type="radio" name="dType" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} /> 
                                                <span style={{ fontWeight: 600 }}>Home Delivery</span>
                                            </label>
                                            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input type="radio" name="dType" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} /> 
                                                <span style={{ fontWeight: 600 }}>Pick Up from Hub (Free)</span>
                                            </label>
                                        </div>
                                    </div>

                                    {deliveryType === 'home' && (
                                        <div className="animate-fade-in-up flex flex-col gap-4">
                                            <div className="form-group">
                                                <label className="form-label">Delivery Address</label>
                                                <input className="form-input" placeholder="Street address" value={delivery.address} onChange={e => uD('address', e.target.value)} />
                                            </div>
                                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                                <div className="form-group">
                                                    <label className="form-label">City</label>
                                                    <input className="form-input" placeholder="City" value={delivery.city} onChange={e => uD('city', e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">State</label>
                                                    <select className="form-select" value={delivery.state} onChange={e => uD('state', e.target.value)}>
                                                        <option value="">Select</option>
                                                        {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button className="btn btn-primary btn-full" style={{ marginTop: '0.5rem' }} onClick={() => setStep(2)}>Continue to Payment →</button>
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
                                            <span style={{ fontSize: '1.5rem', display: 'flex' }}><pm.icon size={24} /></span>
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
                                    <button className="btn btn-ghost" onClick={() => setStep(1)} disabled={loading}>← Back</button>
                                    <button className="btn btn-primary flex-1" disabled={loading} onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const res = await fetch('/api/orders', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ bikeId: bike.id, bikeName: bike.name, bikeImage: bike.images[0], totalAmount: total, paymentMethod, deliveryType, buyer, delivery })
                                            });
                                            if (res.ok) {
                                                const data = await res.json();
                                                setOrderId(data.orderId);
                                                setStep(3);
                                            } else {
                                                alert('Failed to process order.');
                                            }
                                        } catch (e) {
                                            alert('Network error.');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}>{loading ? 'Processing...' : `Pay ${formatNaira(total)} →`}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="card card-elevated animate-scale-in" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', textAlign: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
                                    background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 0 10px rgba(46,204,113,0.1)',
                                }}><CheckCircle2 size={40} color="var(--success)" strokeWidth={3} /></div>
                                <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Order Confirmed!</h2>
                                <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>Your order has been placed successfully. Tracking details will be sent via email.</p>
                                <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
                                    Order ID: <strong>{orderId}</strong>
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
                                <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-lg)', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bike size={32} color="var(--primary)" /></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{bike.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Qty: 1</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                                <div className="flex justify-between"><span style={{ color: 'var(--gray-500)' }}>Subtotal</span><span>{formatNaira(bike.price)}</span></div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-500)' }}>Delivery {deliveryType === 'pickup' && '(Pick Up)'}</span>
                                    <span style={{ color: deliveryFee === 0 ? 'var(--success)' : 'inherit', fontWeight: 600 }}>{deliveryFee === 0 ? 'Free' : formatNaira(deliveryFee)}</span>
                                </div>
                                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem', marginTop: '0.25rem' }} className="flex justify-between">
                                    <span style={{ fontWeight: 700 }}>Total</span>
                                    <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--primary)' }}>{formatNaira(total)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2" style={{ marginTop: '1rem', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                <span className="flex items-center"><ShieldCheck size={16} /></span> Secured by 256-bit encryption
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
