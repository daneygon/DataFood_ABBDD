import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSupplier, getSupplier, updateSupplier } from '../../api/supplierApi';

export default function SupplierForm() {
    const navigate    = useNavigate();
    const { id }      = useParams();
    const isEdit      = Boolean(id);

    const [form, setForm] = useState({
        name: '', company: '', description: '', status: 1,
        phones: [''], addresses: ['']
    });

    useEffect(() => {
        if (isEdit) {
            getSupplier(id).then(({ data }) => {
                setForm({
                    name:        data.name,
                    company:     data.company,
                    description: data.description ?? '',
                    status:      data.status,
                    phones:      data.phones?.length ? data.phones : [''],
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
        navigate('/suppliers');
    };

    return (
        <div style={{ padding: '2rem', background: '#fdf6ee', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <button onClick={() => navigate('/suppliers')}
                    style={{ background: '#4ec4c4', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '1.5rem' }}>
                Regresar
            </button>

            <h2 style={{ color: '#333' }}>{isEdit ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                <input name="name"        placeholder="Nombre"    value={form.name}        onChange={handleChange} style={inputStyle} />
                <input name="company"     placeholder="Compañía"  value={form.company}     onChange={handleChange} style={inputStyle} />
                <input name="description" placeholder="Notas"     value={form.description} onChange={handleChange} style={inputStyle} />
                <input name="phones"      placeholder="Teléfono"  value={form.phones[0]}
                       onChange={e => setForm({ ...form, phones: [e.target.value] })} style={inputStyle} />
                <input name="addresses"   placeholder="Dirección" value={form.addresses[0]}
                       onChange={e => setForm({ ...form, addresses: [e.target.value] })} style={inputStyle} />

                <button onClick={handleSubmit}
                        style={{ background: '#f07c2a', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isEdit ? 'Guardar Cambios' : 'Crear Proveedor'}
                </button>
            </div>
        </div>
    );
}

const inputStyle = {
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    border: '1.5px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
};