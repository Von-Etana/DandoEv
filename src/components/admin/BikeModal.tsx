'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface BikeModalProps {
    bike?: any; // If present, we are editing
    onClose: () => void;
    onSave: () => void;
}

export default function BikeModal({ bike, onClose, onSave }: BikeModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        brand: '',
        model: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '0',
        availability: 'in_stock',
        bnplEligible: true,
        bnplMinDownPayment: '0',
    });

    useEffect(() => {
        if (bike) {
            setForm({
                name: bike.name || '',
                brand: bike.brand || '',
                model: bike.model || '',
                description: bike.description || '',
                price: bike.price ? bike.price.toString() : '',
                category: bike.category || '',
                stockQuantity: bike.stockQuantity ? bike.stockQuantity.toString() : '0',
                availability: bike.availability || 'in_stock',
                bnplEligible: bike.bnplEligible !== undefined ? bike.bnplEligible : true,
                bnplMinDownPayment: bike.bnplMinDownPayment ? bike.bnplMinDownPayment.toString() : '0',
            });
        }
    }, [bike]);

    const u = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            ...form,
            price: parseFloat(form.price),
            stockQuantity: parseInt(form.stockQuantity, 10),
            bnplMinDownPayment: parseInt(form.bnplMinDownPayment, 10),
        };

        try {
            const url = bike ? `/api/admin/bikes/${bike.id}` : '/api/admin/bikes';
            const method = bike ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onSave();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save bike details');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--white)', padding: '2rem', borderRadius: 'var(--radius-2xl)',
                maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }} onClick={e => e.stopPropagation()}>
                
                <button onClick={onClose} style={{
                    position: 'absolute', right: '1.5rem', top: '1.5rem',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)'
                }}><X size={20} /></button>

                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '1.5rem' }}>
                    {bike ? 'Edit Bike' : 'Add New Bike'}
                </h2>

                {error && (
                    <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-input" required value={form.name} onChange={e => u('name', e.target.value)} placeholder="e.g. Model X" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Brand</label>
                            <input className="form-input" required value={form.brand} onChange={e => u('brand', e.target.value)} placeholder="e.g. Dando" />
                        </div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Model (Optional)</label>
                            <input className="form-input" value={form.model} onChange={e => u('model', e.target.value)} placeholder="e.g. 2026" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <input className="form-input" value={form.category} onChange={e => u('category', e.target.value)} placeholder="e.g. Mountain / City" />
                        </div>
                    </div>

                    <div className="grid grid-3" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Price (₦)</label>
                            <input className="form-input" type="number" required value={form.price} onChange={e => u('price', e.target.value)} placeholder="500000" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Stock Qty</label>
                            <input className="form-input" type="number" required value={form.stockQuantity} onChange={e => u('stockQuantity', e.target.value)} placeholder="10" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Availability</label>
                            <select className="form-select" value={form.availability} onChange={e => u('availability', e.target.value)}>
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                                <option value="pre_order">Pre Order</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={3} value={form.description} onChange={e => u('description', e.target.value)} placeholder="Describe the bike features and specs..." style={{ resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                            <input type="checkbox" checked={form.bnplEligible} onChange={e => u('bnplEligible', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                            BNPL Eligible
                        </label>
                        {form.bnplEligible && (
                            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                <label className="form-label" style={{ fontSize: '11px', marginBottom: '2px' }}>Min Downpayment (%)</label>
                                <input className="form-input" type="number" min={0} max={100} value={form.bnplMinDownPayment} onChange={e => u('bnplMinDownPayment', e.target.value)} style={{ padding: '0.375rem 0.75rem' }} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline flex-1" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
                            {loading && <Loader2 className="animate-spin" size={16} />}
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
