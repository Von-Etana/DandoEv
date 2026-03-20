'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockBikes } from '@/lib/mock-data';
import { formatNaira, calculateEMI, capitalize } from '@/lib/utils';
import { BNPL_CONFIG, APP_NAME, BIKE_CATEGORIES } from '@/lib/constants';
import { Zap, Battery, Gauge, Star } from 'lucide-react';
import type { BikeFilters } from '@/lib/types';

export default function BikeCatalogPage() {
    const [filters, setFilters] = useState<BikeFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    const filteredBikes = useMemo(() => {
        let bikes = [...mockBikes];
        if (filters.search) {
            const s = filters.search.toLowerCase();
            bikes = bikes.filter(b => b.name.toLowerCase().includes(s) || b.brand.toLowerCase().includes(s) || b.category.toLowerCase().includes(s));
        }
        if (filters.category) bikes = bikes.filter(b => b.category === filters.category);
        if (filters.priceMin) bikes = bikes.filter(b => b.price >= filters.priceMin!);
        if (filters.priceMax) bikes = bikes.filter(b => b.price <= filters.priceMax!);
        if (filters.rangeMin) bikes = bikes.filter(b => b.range >= filters.rangeMin!);
        if (filters.motorPowerMin) bikes = bikes.filter(b => b.motorPower >= filters.motorPowerMin!);
        if (filters.availability) bikes = bikes.filter(b => b.availability === filters.availability);
        if (filters.sortBy === 'price_asc') bikes.sort((a, b) => a.price - b.price);
        else if (filters.sortBy === 'price_desc') bikes.sort((a, b) => b.price - a.price);
        else if (filters.sortBy === 'rating') bikes.sort((a, b) => b.rating - a.rating);
        return bikes;
    }, [filters]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            {/* Nav */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--gray-200)', padding: '0.75rem 0',
            }}>
                <div className="container flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt={APP_NAME} style={{ height: '36px', width: 'auto' }} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                        <Link href="/auth/signin" className="btn btn-primary btn-sm">Sign In</Link>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Header */}
                <div className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Electric Bikes</h1>
                        <p style={{ color: 'var(--gray-600)', marginTop: '0.25rem' }}>{filteredBikes.length} bikes available</p>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', gap: '0.5rem' }}>
                        🔍 Filters {showFilters ? '▲' : '▼'}
                    </button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="card animate-fade-in-down" style={{ padding: 'var(--space-6)', marginBottom: '2rem', borderRadius: 'var(--radius-2xl)' }}>
                        <div className="grid grid-4" style={{ gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label className="form-label">Search</label>
                                <input className="form-input" placeholder="Search bikes..." value={filters.search || ''}
                                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={filters.category || ''} onChange={e => setFilters(f => ({ ...f, category: e.target.value || undefined }))}>
                                    <option value="">All Categories</option>
                                    {BIKE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Min Price</label>
                                <select className="form-select" value={filters.priceMin || ''} onChange={e => setFilters(f => ({ ...f, priceMin: Number(e.target.value) || undefined }))}>
                                    <option value="">Any</option>
                                    <option value="200000">₦200,000+</option>
                                    <option value="500000">₦500,000+</option>
                                    <option value="800000">₦800,000+</option>
                                    <option value="1000000">₦1,000,000+</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sort By</label>
                                <select className="form-select" value={filters.sortBy || ''} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as BikeFilters['sortBy'] || undefined }))}>
                                    <option value="">Default</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end" style={{ marginTop: '1rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({})}>Clear Filters</button>
                        </div>
                    </div>
                )}

                {/* Bike Grid */}
                <div className="grid grid-3" style={{ gap: 'var(--space-6)' }}>
                    {filteredBikes.map((bike) => {
                        const loanAmount = bike.price * (1 - bike.bnplMinDownPayment / 100);
                        const emi = calculateEMI(loanAmount, BNPL_CONFIG.interestRate, BNPL_CONFIG.defaultTenure);
                        return (
                            <Link href={`/bikes/${bike.id}`} key={bike.id} className="card animate-fade-in-up" style={{ borderRadius: 'var(--radius-2xl)' }}>
                                <div style={{
                                    height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--gray-100)',
                                    position: 'relative', overflow: 'hidden',
                                }}>
                                    <img src={bike.images && bike.images[0] ? bike.images[0] : '/bikes/placeholder.jpg'} alt={bike.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }} />
                                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                                        <span className={`badge ${bike.availability === 'in_stock' ? 'badge-success' : bike.availability === 'pre_order' ? 'badge-warning' : 'badge-danger'}`}>
                                            {capitalize(bike.availability)}
                                        </span>
                                    </div>
                                    {bike.bnplEligible && (
                                        <div style={{
                                            position: 'absolute', top: '12px', right: '12px',
                                            background: 'var(--accent)', color: 'var(--primary-dark)',
                                            padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                                            fontSize: '0.65rem', fontWeight: 700,
                                        }}>BNPL</div>
                                    )}
                                </div>
                                <div style={{ padding: 'var(--space-5)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{bike.category}</div>
                                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>{bike.name}</h3>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {bike.description}
                                    </p>
                                    <div className="flex items-center gap-4 flex-wrap" style={{ marginBottom: '0.75rem' }}>
                                        <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}><Zap size={14} /> {bike.motorPower}W</span>
                                        <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}><Battery size={14} /> {bike.range}km</span>
                                        <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}><Gauge size={14} /> {bike.topSpeed}km/h</span>
                                        <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}><Star size={14} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} /> {bike.rating}</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem' }}>
                                        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--primary)' }}>{formatNaira(bike.price)}</div>
                                        {bike.bnplEligible && (
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '0.125rem' }}>
                                                or <strong style={{ color: 'var(--accent-dark)' }}>{formatNaira(emi)}/mo</strong> × {BNPL_CONFIG.defaultTenure} months
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {filteredBikes.length === 0 && (
                    <div className="text-center" style={{ padding: '4rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No bikes found</h3>
                        <p style={{ color: 'var(--gray-500)' }}>Try adjusting your filters</p>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setFilters({})}>Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}
