import { useEffect, useState } from 'react';
import { createSupply, updateSupply } from '../../api/Supplyapi.js';

export default function SupplyForm({ supply, categories, onClose }) {
    const [form, setForm] = useState({
        name: '',
        unitOfMeasure: '',
        availableQuantity: 0,
        minimumQuantity: 0,
        supplyCategoryId: '',
    });

    useEffect(() => {
        if (supply) {
            setForm({
                name: supply.name ?? '',
                unitOfMeasure: supply.unitOfMeasure ?? '',
                availableQuantity: supply.availableQuantity ?? 0,
                minimumQuantity: supply.minimumQuantity ?? 0,
                supplyCategoryId: supply.supplyCategory?.supplyCategoryId ?? '',
            });
        }
    }, [supply]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (supply) {
                await updateSupply(supply.supplyId, form);
            } else {
                await createSupply(form);
            }
            onClose();
        } catch (err) { console.error(err); }
    };

    const fieldStyle = {
        width: '100%', padding: '0.5rem 0.8rem',
        borderRadius: '8px', border: '1px solid #ccc',
        fontSize: '0.9rem', marginBottom: '1rem',
    };
    const labelStyle = { fontSize: '0.85rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' };

    return (
        <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Nombre</label>
            <input style={fieldStyle} name="name" value={form.name} onChange={handleChange} required />

            <label style={labelStyle}>Unidad de Medida</label>
            <input style={fieldStyle} name="unitOfMeasure" value={form.unitOfMeasure} onChange={handleChange} required />

            <label style={labelStyle}>Cantidad Disponible</label>
            <input style={fieldStyle} type="number" name="availableQuantity" value={form.availableQuantity} onChange={handleChange} min={0} required />

            <label style={labelStyle}>Cantidad Mínima</label>
            <input style={fieldStyle} type="number" name="minimumQuantity" value={form.minimumQuantity} onChange={handleChange} min={0} required />

            <label style={labelStyle}>Categoría</label>
            <select style={fieldStyle} name="supplyCategoryId" value={form.supplyCategoryId} onChange={handleChange} required>
                <option value="">-- Seleccionar --</option>
                {categories.map(c => (
                    <option key={c.supplyCategoryId} value={c.supplyCategoryId}>{c.name}</option>
                ))}
            </select>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={onClose}
                        style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}>
                    Cancelar
                </button>
                <button type="submit"
                        style={{ padding: '0.5rem 1.4rem', borderRadius: '8px', border: 'none', background: '#f97316', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {supply ? 'Guardar' : 'Crear'}
                </button>
            </div>
        </form>
    );
}