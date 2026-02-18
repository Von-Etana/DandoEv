'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockBikes } from '@/lib/mock-data';
import { formatNaira, calculateEMI } from '@/lib/utils';
import { BNPL_CONFIG, APP_NAME } from '@/lib/constants';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const featuredBikes = mockBikes.slice(0, 3);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* ========== NAVBAR ========== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255, 245, 235, 0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        padding: '0.75rem 0',
      }}>
        <div className="container flex items-center justify-between">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>⚡</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/bikes" className="hide-mobile" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Browse Bikes</Link>
            <Link href="/bnpl/personal-info" className="hide-mobile" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>BNPL</Link>
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section style={{
        paddingTop: '120px', paddingBottom: '80px',
        background: 'linear-gradient(180deg, var(--cream) 0%, #FFE8D6 50%, var(--cream) 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', right: '-20%', width: '600px', height: '600px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,234,175,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '-10%', width: '400px', height: '400px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,10,78,0.08) 0%, transparent 70%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col items-center text-center" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className={mounted ? 'animate-fade-in-up' : ''} style={{ opacity: mounted ? 1 : 0 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(45, 10, 78, 0.08)', borderRadius: 'var(--radius-full)',
                padding: '0.5rem 1rem', marginBottom: '1.5rem',
                fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--primary)',
              }}>
                🇳🇬 Nigeria&apos;s #1 E-Bike Marketplace
              </div>
            </div>
            <h1 className={mounted ? 'animate-fade-in-up stagger-1' : ''} style={{
              opacity: mounted ? 1 : 0,
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 900, lineHeight: 1.1, color: 'var(--dark)',
              marginBottom: '1.5rem',
            }}>
              Shop now, pay later with{' '}
              <span style={{
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{APP_NAME}</span>
            </h1>
            <p className={mounted ? 'animate-fade-in-up stagger-2' : ''} style={{
              opacity: mounted ? 1 : 0,
              fontSize: 'var(--text-lg)', color: 'var(--gray-600)',
              maxWidth: '520px', marginBottom: '2rem', lineHeight: 1.7,
            }}>
              Ride electric, pay smart. Get your dream e-bike today with flexible installment plans starting from {formatNaira(calculateEMI(300000, 15, 12))}/month.
            </p>
            <div className={`flex gap-4 flex-wrap justify-center ${mounted ? 'animate-fade-in-up stagger-3' : ''}`} style={{ opacity: mounted ? 1 : 0 }}>
              <Link href="/bikes" className="btn btn-primary btn-lg">
                Browse Bikes <span>→</span>
              </Link>
              <Link href="/auth/signup" className="btn btn-outline btn-lg">
                Create Account
              </Link>
            </div>
            {/* Trust Badges */}
            <div className={`flex items-center gap-6 flex-wrap justify-center ${mounted ? 'animate-fade-in-up stagger-4' : ''}`}
              style={{ opacity: mounted ? 1 : 0, marginTop: '3rem' }}>
              {[
                { icon: '🔒', text: 'Secure Payments' },
                { icon: '✅', text: 'KYC Verified' },
                { icon: '🚚', text: 'Free Delivery' },
                { icon: '🛡️', text: 'NDPR Compliant' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                  <span style={{ fontSize: '1.25rem' }}>{badge.icon}</span>
                  <span style={{ fontWeight: 500 }}>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section style={{ padding: '80px 0', background: 'var(--white)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.75rem' }}>
              How Buy Now, Pay Later Works
            </h2>
            <p style={{ color: 'var(--gray-600)', maxWidth: '500px', margin: '0 auto' }}>
              Get your electric bike in 4 simple steps
            </p>
          </div>
          <div className="grid grid-4" style={{ gap: 'var(--space-6)' }}>
            {[
              { step: '01', icon: '🔍', title: 'Choose Your Bike', desc: 'Browse our collection of premium electric bikes and find your perfect match.' },
              { step: '02', icon: '📋', title: 'Apply for BNPL', desc: 'Complete a quick application with your personal information and KYC documents.' },
              { step: '03', icon: '✅', title: 'Get Approved', desc: 'Our team reviews your application within 24 hours. Quick and hassle-free.' },
              { step: '04', icon: '🏍️', title: 'Ride & Repay', desc: 'Receive your bike and pay in comfortable monthly installments.' },
            ].map((item, i) => (
              <div key={i} className="card" style={{
                padding: 'var(--space-8)', textAlign: 'center', border: 'none',
                background: i === 0 ? 'var(--cream)' : i === 1 ? 'var(--mint)' : i === 2 ? '#F0EBFF' : 'var(--gray-50)',
                borderRadius: 'var(--radius-3xl)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>{item.icon}</div>
                <div style={{
                  fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--primary)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-2)',
                }}>Step {item.step}</div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{item.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED BIKES ========== */}
      <section style={{ padding: '80px 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="flex items-end justify-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Featured E-Bikes</h2>
              <p style={{ color: 'var(--gray-600)' }}>Premium electric bikes for every rider</p>
            </div>
            <Link href="/bikes" className="btn btn-outline btn-sm hide-mobile">View All →</Link>
          </div>
          <div className="grid grid-3" style={{ gap: 'var(--space-6)' }}>
            {featuredBikes.map((bike) => {
              const monthlyEMI = calculateEMI(
                bike.price * (1 - bike.bnplMinDownPayment / 100),
                BNPL_CONFIG.interestRate,
                BNPL_CONFIG.defaultTenure
              );
              return (
                <Link href={`/bikes/${bike.id}`} key={bike.id} className="card" style={{
                  borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
                  transition: 'all var(--transition-base)',
                }}>
                  <div style={{
                    height: '220px',
                    background: bike.category === 'Sports' ? 'linear-gradient(135deg, #1A1A2E, #2D0A4E)' :
                      bike.category === 'Commuter' ? 'linear-gradient(135deg, #E8FFF5, #C5F5E0)' :
                        'linear-gradient(135deg, #FFF5EB, #FFE8D6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '4rem', position: 'relative',
                  }}>
                    🏍️
                    {bike.bnplEligible && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'var(--accent)', color: 'var(--primary-dark)',
                        padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)', fontWeight: 700,
                      }}>BNPL Available</div>
                    )}
                  </div>
                  <div style={{ padding: 'var(--space-5)' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>{bike.category}</span>
                      <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
                        ⭐ {bike.rating}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>{bike.name}</h3>
                    <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: '0.75rem' }}>
                      <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>⚡ {bike.motorPower}W</span>
                      <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>🔋 {bike.range}km</span>
                      <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>🏎️ {bike.topSpeed}km/h</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--primary)' }}>{formatNaira(bike.price)}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '0.125rem' }}>
                        or from <strong style={{ color: 'var(--accent-dark)' }}>{formatNaira(monthlyEMI)}/mo</strong> with BNPL
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center show-mobile" style={{ marginTop: '1.5rem', display: 'none' }}>
            <Link href="/bikes" className="btn btn-outline">View All Bikes →</Link>
          </div>
        </div>
      </section>

      {/* ========== BNPL CTA ========== */}
      <section style={{
        padding: '80px 0',
        background: 'var(--primary-gradient)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '0', right: '0', width: '300px', height: '300px',
          borderRadius: '50%', background: 'rgba(74, 234, 175, 0.1)', transform: 'translate(50%, -50%)',
        }} />
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--white)', marginBottom: '1rem' }}>
            Can&apos;t afford to pay all at once?
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.8)', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Apply for our Buy Now, Pay Later plan and spread your payments over up to 24 months.
          </p>
          <Link href="/bnpl/personal-info" className="btn btn-accent btn-lg">
            Apply for BNPL <span>→</span>
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{
        padding: '60px 0 30px',
        background: 'var(--dark)',
        color: 'var(--gray-400)',
      }}>
        <div className="container">
          <div className="grid grid-4" style={{ gap: 'var(--space-8)', marginBottom: '3rem' }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--white)' }}>{APP_NAME}</span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                Nigeria&apos;s premier electric bike marketplace with flexible payment options.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--white)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products</h4>
              <div className="flex flex-col gap-2">
                <Link href="/bikes" style={{ fontSize: 'var(--text-sm)' }}>Browse Bikes</Link>
                <Link href="/bnpl/personal-info" style={{ fontSize: 'var(--text-sm)' }}>BNPL Plans</Link>
                <Link href="/bikes" style={{ fontSize: 'var(--text-sm)' }}>Accessories</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--white)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
              <div className="flex flex-col gap-2">
                <Link href="#" style={{ fontSize: 'var(--text-sm)' }}>About Us</Link>
                <Link href="#" style={{ fontSize: 'var(--text-sm)' }}>Careers</Link>
                <Link href="#" style={{ fontSize: 'var(--text-sm)' }}>Contact</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--white)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal</h4>
              <div className="flex flex-col gap-2">
                <Link href="#" style={{ fontSize: 'var(--text-sm)' }}>Privacy Policy</Link>
                <Link href="#" style={{ fontSize: 'var(--text-sm)' }}>Terms of Service</Link>
                <Link href="#" style={{ fontSize: 'var(--text-sm)' }}>NDPR Compliance</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center', fontSize: 'var(--text-xs)' }}>
            © 2026 {APP_NAME}. All rights reserved. Licensed by the Central Bank of Nigeria.
          </div>
        </div>
      </footer>
    </div>
  );
}
