'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockBikes } from '@/lib/mock-data';
import { formatNaira, calculateInstallment, calculateDownPayment } from '@/lib/utils';
import { BNPL_CONFIG, APP_NAME } from '@/lib/constants';

export default function BikeDetailPage() {
    const params = useParams();
    const bike = mockBikes.find(b => b.id === params.id);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedTenure, setSelectedTenure] = useState(BNPL_CONFIG.defaultTenure);
    const [paymentChoice, setPaymentChoice] = useState<'buy' | 'bnpl'>('bnpl');

    if (!bike) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '4rem' }}>🔍</span>
                <h2>Bike not found</h2>
                <Link href="/bikes" className="btn btn-primary">Browse Bikes</Link>
            </div>
        );
    }

    const downPayment = 0;
    const loanAmount = bike.price;
    const { installmentAmount, numberOfInstallments, totalInterest, totalRepayable } = calculateInstallment(loanAmount, BNPL_CONFIG.interestRate, selectedTenure);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
            {/* Nav */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0',
            }}>
                <div className="container flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/bikes" style={{ fontSize: '1.25rem', color: 'var(--gray-600)' }}>←</Link>
                        <Link href="/" className="flex items-center gap-2">
                            <span style={{ fontSize: '1.5rem' }}>⚡</span>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{APP_NAME}</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/auth/signin" className="btn btn-primary btn-sm">Sign In</Link>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    {/* Left: Image */}
                    <div>
                        <div style={{
                            height: '400px', borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: bike.category === 'Sports' ? 'linear-gradient(135deg, #1A1A2E, #2D0A4E)' : 'linear-gradient(135deg, #F0EBFF, #E8FFF5)',
                            fontSize: '6rem', position: 'relative',
                        }}>
                            🏍️
                            {bike.bnplEligible && (
                                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--accent)', color: 'var(--primary-dark)', padding: '0.375rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>BNPL Available</div>
                            )}
                        </div>
                        {/* Colors */}
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.5rem' }}>Available Colors:</p>
                            <div className="flex gap-2">
                                {bike.color.map((c, i) => (
                                    <button key={c} onClick={() => setSelectedColor(i)}
                                        style={{
                                            padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-full)',
                                            border: selectedColor === i ? '2px solid var(--primary)' : '2px solid var(--gray-300)',
                                            background: selectedColor === i ? 'rgba(45,10,78,0.05)' : 'transparent',
                                            fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                                        }}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{bike.category} • {bike.brand}</div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>{bike.name}</h1>
                        <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                            <span className="flex items-center gap-1" style={{ fontWeight: 600 }}>⭐ {bike.rating}</span>
                            <span style={{ color: 'var(--gray-400)' }}>•</span>
                            <span style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>{bike.reviewCount} reviews</span>
                        </div>
                        <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{bike.description}</p>

                        {/* Specs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {[
                                { icon: '⚡', label: 'Motor', value: `${bike.motorPower}W` },
                                { icon: '🔋', label: 'Battery', value: `${bike.batteryCapacity}Wh` },
                                { icon: '🛣️', label: 'Range', value: `${bike.range}km` },
                                { icon: '🏎️', label: 'Top Speed', value: `${bike.topSpeed}km/h` },
                                { icon: '⏱️', label: 'Charge', value: `${bike.chargingTime}h` },
                                { icon: '⚖️', label: 'Weight', value: `${bike.weight}kg` },
                            ].map(s => (
                                <div key={s.label} style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.25rem' }}>{s.icon}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '0.125rem' }}>{s.label}</div>
                                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Features */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: 'var(--text-base)' }}>Features</h3>
                            <div className="flex flex-wrap gap-2">
                                {bike.features.map(f => (
                                    <span key={f} style={{ background: 'var(--mint)', color: 'var(--accent-dark)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>{f}</span>
                                ))}
                            </div>
                        </div>

                        {/* Payment Choice */}
                        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-2xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="flex gap-2" style={{ marginBottom: '1rem' }}>
                                <button onClick={() => setPaymentChoice('buy')}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-xl)', fontWeight: 700, border: paymentChoice === 'buy' ? '2px solid var(--primary)' : '2px solid var(--gray-300)', background: paymentChoice === 'buy' ? 'var(--white)' : 'transparent', color: paymentChoice === 'buy' ? 'var(--primary)' : 'var(--gray-600)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    💳 Buy Now
                                </button>
                                <button onClick={() => setPaymentChoice('bnpl')}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-xl)', fontWeight: 700, border: paymentChoice === 'bnpl' ? '2px solid var(--primary)' : '2px solid var(--gray-300)', background: paymentChoice === 'bnpl' ? 'var(--white)' : 'transparent', color: paymentChoice === 'bnpl' ? 'var(--primary)' : 'var(--gray-600)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    📅 BNPL
                                </button>
                            </div>

                            {paymentChoice === 'buy' ? (
                                <div>
                                    <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>{formatNaira(bike.price)}</div>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>One-time payment. Free delivery included.</p>
                                    <Link href="/checkout" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>Buy Now →</Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-baseline gap-2" style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--primary)' }}>{formatNaira(installmentAmount)}</span>
                                        <span style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>/ every 2 days</span>
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                                        Total {numberOfInstallments} installments over {selectedTenure} months
                                    </div>

                                    {/* Tenure selector */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--gray-600)' }}>Select Tenure:</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {BNPL_CONFIG.tenureOptions.map(t => (
                                                <button key={t} onClick={() => setSelectedTenure(t)}
                                                    style={{
                                                        padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-full)',
                                                        border: selectedTenure === t ? '2px solid var(--primary)' : '2px solid var(--gray-300)',
                                                        background: selectedTenure === t ? 'var(--primary)' : 'transparent',
                                                        color: selectedTenure === t ? 'var(--white)' : 'var(--gray-700)',
                                                        fontWeight: 600, fontSize: 'var(--text-xs)', cursor: 'pointer',
                                                    }}>
                                                    {t} months
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Breakdown */}
                                    <div style={{ fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                        <div className="flex justify-between"><span style={{ color: 'var(--gray-500)' }}>Bike Price</span><span style={{ fontWeight: 600 }}>{formatNaira(bike.price)}</span></div>
                                        <div className="flex justify-between"><span style={{ color: 'var(--gray-500)' }}>Down Payment ({bike.bnplMinDownPayment}%)</span><span style={{ fontWeight: 600 }}>{formatNaira(downPayment)}</span></div>
                                        <div className="flex justify-between"><span style={{ color: 'var(--gray-500)' }}>Loan Amount</span><span style={{ fontWeight: 600 }}>{formatNaira(loanAmount)}</span></div>
                                        <div className="flex justify-between"><span style={{ color: 'var(--gray-500)' }}>Total Interest</span><span style={{ fontWeight: 600 }}>{formatNaira(totalInterest)}</span></div>
                                        <div style={{ borderTop: '1px solid var(--gray-300)', paddingTop: '0.375rem', marginTop: '0.25rem' }} className="flex justify-between">
                                            <span style={{ fontWeight: 700 }}>Total Repayable</span><span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatNaira(totalRepayable)}</span>
                                        </div>
                                    </div>
                                    <Link href="/bnpl/personal-info" className="btn btn-accent btn-full" style={{ marginTop: '1rem' }}>Apply for BNPL →</Link>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                            <span>🛡️</span> {bike.warranty} Warranty • 🚚 Free Delivery
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
}
