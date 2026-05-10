import { useState, useEffect } from 'react';
import { createSupplier, getSupplier, updateSupplier } from '../../api/supplierApi';

export default function SupplierForm({ id, onClose }) {
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name:        '',
        company:     '',
        description: '',
        status:      1,
        phones:      ['', ''],
        addresses:   [''],
    });

    useEffect(() => {
        if (isEdit) {
            getSupplier(id).then(({ data }) => {
                setForm({
                    name:        data.name        ?? '',
                    company:     data.company     ?? '',
                    description: data.description ?? '',
                    status:      data.status      ?? 1,
                    phones:      data.phones?.length >= 2 ? data.phones : [data.phones?.[0] ?? '', ''],
                    addresses:   data.addresses?.length ? data.addresses : [''],
                });
            });
        }
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (isEdit) {
            await updateSupplier(id, form);
        } else {
            await createSupplier(form);
        }
        onClose();
    };

    return (
        <div style={{ fontFamily: 'sans-serif', fontSize: '0.93rem', color: '#333' }}>

            {/* Información Básica */}
            <div style={sectionTitle}>Información Básica</div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Nombre completo</label>
                <input name="name" value={form.name} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Nombre Compañía</label>
                <input name="company" value={form.company} onChange={handleChange} style={inputStyle} />
            </div>


            {/* Contacto */}
            <div style={{ ...sectionTitle, marginTop: '1rem' }}>Contacto</div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Teléfono 1</label>
                <input
                    value={form.phones[0] ?? ''}
                    onChange={e => setForm({ ...form, phones: [e.target.value, form.phones[1] ?? ''] })}
                    style={inputStyle}
                />
            </div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Teléfono 2</label>
                <input
                    value={form.phones[1] ?? ''}
                    onChange={e => setForm({ ...form, phones: [form.phones[0] ?? '', e.target.value] })}
                    style={inputStyle}
                />
            </div>

            {/* Ubicación */}
            <div style={{ ...sectionTitle, marginTop: '1rem' }}>Ubicación</div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Dirección</label>
                <input
                    value={form.addresses[0] ?? ''}
                    onChange={e => setForm({ ...form, addresses: [e.target.value] })}
                    style={inputStyle}
                />
            </div>

            {/* Estado */}
            <div style={{ ...sectionTitle, marginTop: '1rem' }}>Estado</div>
            <div style={{ display: 'flex', gap: '1.5rem', margin: '0.5rem 0 1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                        type="radio" name="status" value={1}
                        checked={form.status === 1}
                        onChange={() => setForm({ ...form, status: 1 })}
                    />
                    Activo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                        type="radio" name="status" value={0}
                        checked={form.status === 0}
                        onChange={() => setForm({ ...form, status: 0 })}
                    />
                    Inactivo
                </label>
            </div>

            {/* Razón */}
            <div style={fieldGroup}>
                <label style={labelStyle}>Razón</label>
                <textarea
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    style={{ ...inputStyle, resize: 'vertical' }}
                />
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={onClose} style={btnCancel}>Cancelar</button>
                <button onClick={handleSubmit} style={btnSave}>Guardar</button>
            </div>
        </div>
    );
}

const sectionTitle = {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#333',
    marginBottom: '0.5rem',
    borderBottom: '1px solid #e0c9b0',
    paddingBottom: '0.25rem',
};

const fieldGroup = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.6rem',
    gap: '0.75rem',
};

const labelStyle = {
    width: '130px',
    minWidth: '130px',
    fontSize: '0.88rem',
    color: '#555',
};

const inputStyle = {
    flex: 1,
    padding: '0.45rem 0.7rem',
    borderRadius: '6px',
    border: '1.5px solid #ccc',
    fontSize: '0.9rem',
    outline: 'none',
    background: 'white',
};

const btnCancel = {
    padding: '0.5rem 1.2rem',
    borderRadius: '6px',
    border: '1.5px solid #ccc',
    background: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
};

const btnSave = {
    padding: '0.5rem 1.2rem',
    borderRadius: '6px',
    border: 'none',
    background: '#4ec4c4',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
};
