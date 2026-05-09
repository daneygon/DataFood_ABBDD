import { useEffect, useState } from 'react';
import { getSupplies } from '../../api/Supplyapi.js';
import { createPurchase, updatePurchase } from '../../api/Supplyapi.js';

export default function NuevaCompraModal({ purchase, suppliers, onClose }) {
    const [supplies, setSupplies] = useState([]);
    const [form, setForm] = useState({
        supplyId:    '',
        supplierId:  '',
        quantity:    1,
        price:       0,
        purchaseDate: new Date().toISOString().slice(0, 16),
    });

    useEffect(() => {
        getSupplies().then(r => setSupplies(r.data)).catch(console.error);
        if (purchase) {
            setForm({
                supplyId:     purchase.supply?.supplyId ?? '',
                supplierId:   purchase.supplier?.supplierId ?? '',
                quantity:     purchase.quantity,
                price:        purchase.price,
                purchaseDate: purchase.purchaseDate?.slice(0, 16) ?? '',
            });
        }
    }, [purchase]);

    const total = (Number(form.quantity) * Number(form.price)).toFixed(2);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        const payload = {
            quantity:     Number(form.quantity),
            price:        Number(form.price),
            total:        Number(total),
            purchaseDate: form.purchaseDate,
            supply:       { supplyId:   Number(form.supplyId) },
            supplier:     { supplierId: Number(form.supplierId) },
        };
        try {
            if (purchase) {
                await updatePurchase(purchase.purchaseId, payload);
            } else {
                await createPurchase(payload);
            }
            onClose();
        } catch (err) { console.error(err); }
    };

    const fieldStyle = {
        width: '100%', padding: '0.5rem 0.8rem',
        borderRadius: '8px', border: '1px solid #ccc',
        fontSize: '0.9rem', marginBottom: '1rem',
    };
    const labelStyle = {
        fontSize: '0.85rem', fontWeight: 600, color: '#555',
        display: 'block', marginBottom: '4px',
    };

    return (
        <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Insumo</label>
            <select style={fieldStyle} name="supplyId" value={form.supplyId} onChange={handleChange} required>
                <option value="">-- Seleccionar Insumo --</option>
                {supplies.map(s => (
                    <option key={s.supplyId} value={s.supplyId}>{s.name}</option>
                ))}
            </select>

            <label style={labelStyle}>Proveedor</label>
            <select style={fieldStyle} name="supplierId" value={form.supplierId} onChange={handleChange} required>
                <option value="">-- Seleccionar Proveedor --</option>
                {suppliers.map(s => (
                    <option key={s.supplierId} value={s.supplierId}>{s.name}</option>
                ))}
            </select>

            <label style={labelStyle}>Cantidad</label>
            <input style={fieldStyle} type="number" name="quantity" value={form.quantity}
                   onChange={handleChange} min={1} required />

            <label style={labelStyle}>Precio Unitario ($)</label>
            <input style={fieldStyle} type="number" name="price" value={form.price}
                   onChange={handleChange} min={0} step="0.01" required />

            <label style={labelStyle}>Fecha de Compra</label>
            <input style={fieldStyle} type="datetime-local" name="purchaseDate" value={form.purchaseDate}
                   onChange={handleChange} required />

            <div style={{ background: '#f97316', color: '#fff', borderRadius: '8px',
                padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 700,
                fontSize: '1rem', marginBottom: '1rem' }}>
                TOTAL: ${total}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose}
                        style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}>
                    Cancelar
                </button>
                <button type="submit"
                        style={{ padding: '0.5rem 1.4rem', borderRadius: '8px', border: 'none',
                            background: '#f97316', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {purchase ? 'Guardar Cambios' : 'Registrar Compra'}
                </button>
            </div>
        </form>
    );
}