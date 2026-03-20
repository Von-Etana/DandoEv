'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatNaira, calculateInstallment } from '@/lib/utils';
import { BNPL_CONFIG, NIGERIAN_STATES } from '@/lib/constants';
import { mockBikes } from '@/lib/mock-data';
import { Bike, AlertTriangle } from 'lucide-react';

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

export default function LoanTermsPage() {
    const router = useRouter();
    const bike = mockBikes[0];
    const [selectedTenure, setSelectedTenure] = useState(BNPL_CONFIG.defaultTenure);
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Delivery State
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'home'>('home');
    const [deliveryState, setDeliveryState] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    const downPayment = 0; // No down payment
    const loanAmount = bike.price;
    const { installmentAmount, totalRepayable, totalInterest, numberOfInstallments, healthInsuranceFee, totalSavings } = calculateInstallment(loanAmount, BNPL_CONFIG.interestRate, selectedTenure);

    // Compute Delivery Fee Based on State
    const deliveryFee = deliveryType === 'pickup' ? 0 : (deliveryState === 'Lagos' ? 10000 : (deliveryState ? 20000 : 0));
    
    // Add delivery to the total capitalized loan
    const totalRepayableWithDelivery = totalRepayable + deliveryFee;
    const installmentAmountWithDelivery = totalRepayableWithDelivery / numberOfInstallments;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0' }}>
                <div className="container flex items-center gap-4">
                    <Link href="/bnpl/guarantor" style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>←</Link>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>Loan Terms</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Step 5 of 6</div>
                    </div>
                </div>
            </nav>

            <div className="container-sm" style={{ padding: '1.5rem 1rem' }}>
                <Stepper current={4} />
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '1.5rem' }}>Review Loan Terms</h1>

                {/* Bike Summary */}
                <div className="card card-elevated" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <div className="flex items-center gap-4">
                        <div style={{
                            width: '64px', height: '64px', borderRadius: 'var(--radius-xl)',
                            background: 'var(--gray-100)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Bike size={32} color="var(--primary)" /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{bike.name}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{bike.category} • {bike.brand}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 'var(--text-lg)' }}>{formatNaira(bike.price)}</div>
                    </div>
                </div>

                {/* Delivery Options */}
                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Logistics & Delivery</h3>
                    <div className="flex gap-4" style={{ marginBottom: '1rem' }}>
                        <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="radio" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} /> 
                            <span style={{ fontWeight: 600 }}>Home Delivery</span>
                        </label>
                        <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="radio" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} /> 
                            <span style={{ fontWeight: 600 }}>Pick Up from Hub (Free)</span>
                        </label>
                    </div>

                    {deliveryType === 'home' && (
                        <div className="animate-fade-in-up flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Delivery Address</label>
                                <input className="form-input" placeholder="Full street address" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Destination State</label>
                                <select className="form-select" value={deliveryState} onChange={e => setDeliveryState(e.target.value)}>
                                    <option value="">Select state to calculate delivery</option>
                                    {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tenure Selection */}
                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Select Tenure</h3>
                    <div className="grid grid-3" style={{ gap: '0.5rem' }}>
                        {BNPL_CONFIG.tenureOptions.map(t => (
                            <button key={t} onClick={() => setSelectedTenure(t)}
                                style={{
                                    padding: '1rem 0.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center',
                                    border: selectedTenure === t ? '2px solid var(--primary)' : '2px solid var(--gray-200)',
                                    background: selectedTenure === t ? 'rgba(45,10,78,0.05)' : 'var(--white)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: selectedTenure === t ? 'var(--primary)' : 'var(--gray-700)' }}>{t}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>months</div>
                            </button>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                        Total <strong>{numberOfInstallments}</strong> bi-daily installments
                    </div>
                </div>

                {/* Loan Breakdown */}
                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Payment Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { label: 'Bike Price', value: formatNaira(bike.price) },
                            { label: `No Down Payment`, value: formatNaira(0) },
                            { label: 'Loan Amount', value: formatNaira(loanAmount) },
                            { label: `Monthly Interest (${BNPL_CONFIG.interestRate}%)`, value: formatNaira(totalInterest) },
                            { label: `Health Insurance Fee (Fixed)`, value: formatNaira(healthInsuranceFee || 0) },
                            { label: `Processing Fee (Fixed)`, value: formatNaira(BNPL_CONFIG.processingFee) },
                            { label: `Compulsory Savings (₦${BNPL_CONFIG.dailySavings}/day)`, value: formatNaira(totalSavings || 0) },
                            { label: `Delivery Fee ${deliveryType === 'pickup' ? '(Pick Up)' : (deliveryState ? `(${deliveryState})` : '')}`, value: deliveryFee === 0 ? 'Free' : formatNaira(deliveryFee) },
                        ].map(r => (
                            <div key={r.label} className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
                                <span style={{ color: 'var(--gray-600)' }}>{r.label}</span>
                                <span style={{ fontWeight: 600 }}>{r.value}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 700 }}>Total Repayable (inc. Savings & Delivery)</span>
                                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 'var(--text-lg)' }}>{formatNaira(totalRepayableWithDelivery)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>Bi-daily Payment (Every 2 days)</span>
                                <span style={{ fontWeight: 800, color: 'var(--accent-dark)', fontSize: 'var(--text-xl)' }}>{formatNaira(installmentAmountWithDelivery)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Late Fee Notice */}
                <div className="alert alert-warning" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', color: '#F39C12' }}><AlertTriangle size={18} /></span>
                    <div style={{ fontSize: 'var(--text-xs)' }}>
                        <strong>Late Fee Policy:</strong> A {BNPL_CONFIG.lateFeePercent}% late fee will be applied on overdue installments after a {BNPL_CONFIG.gracePeriodDays}-day grace period.
                    </div>
                </div>

                {/* Terms Acceptance */}
                <div className="card card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Terms & Conditions</h3>
                    <div style={{
                        maxHeight: '120px', overflow: 'auto', padding: '0.75rem', background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-lg)', marginBottom: '1rem',
                        fontSize: 'var(--text-xs)', color: 'var(--gray-600)', lineHeight: 1.8,
                    }}>
                        <p>1. I agree to repay the loan amount plus interest and service fees as outlined above.</p>
                        <p>2. I understand that failure to make timely payments may result in additional fees and/or legal action.</p>
                        <p>3. I authorize DandoEv to obtain my credit information and perform verification checks.</p>
                        <p>4. I agree that the financed bike remains collateral until the loan is fully repaid.</p>
                        <p>5. I acknowledge that DandoEv may enable GPS tracking and/or immobilizer features on financed bikes.</p>
                        <p>6. Early repayment is allowed with no additional penalties.</p>
                        <p>7. My guarantors will be contacted in the event of default.</p>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                            style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-700)' }}>
                            I have read and agree to the Terms & Conditions, Privacy Policy, and BNPL Agreement.
                        </span>
                    </label>
                </div>

                <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                    <Link href="/bnpl/guarantor" className="btn btn-ghost">← Back</Link>
                    <button 
                        onClick={async () => {
                            if (!accepted || (deliveryType === 'home' && (!deliveryState || !deliveryAddress))) return;
                            setLoading(true);
                            try {
                                const saved = JSON.parse(sessionStorage.getItem('bnpl_data') || '{}');
                                const payload = { bikeId: bike.id, bikeName: bike.name, bikeImage: bike.images[0], totalAmount: totalRepayableWithDelivery, tenure: selectedTenure, deliveryType, deliveryState, deliveryAddress, ...saved };
                                const res = await fetch('/api/loans', { method: 'POST', body: JSON.stringify(payload) });
                                if (res.ok) {
                                    sessionStorage.removeItem('bnpl_data');
                                    router.push('/bnpl/submit');
                                } else {
                                    alert('Failed to submit application.');
                                }
                            } catch (e) { alert('Network error.'); }
                            finally { setLoading(false); }
                        }}
                        className={`btn btn-primary ${(!accepted || (deliveryType === 'home' && (!deliveryState || !deliveryAddress)) || loading) ? 'disabled' : ''}`}
                        style={{ pointerEvents: (accepted && (deliveryType === 'pickup' || (deliveryState && deliveryAddress)) && !loading) ? 'auto' : 'none', opacity: (accepted && (deliveryType === 'pickup' || (deliveryState && deliveryAddress))) ? 1 : 0.5 }}>
                        {loading ? 'Submitting...' : 'Submit Application →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
