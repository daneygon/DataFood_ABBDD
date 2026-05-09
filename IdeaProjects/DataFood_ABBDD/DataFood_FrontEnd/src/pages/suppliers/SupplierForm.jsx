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

    // NUEVO: Estado para manejar los mensajes de error
    const [errorMsg, setErrorMsg] = useState('');

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
        // NUEVO: Limpiar el error cuando el usuario empieza a escribir
        if (errorMsg) setErrorMsg('');
    };

    const handleSubmit = async () => {
        // Limpiamos errores previos antes de validar
        setErrorMsg('');

        // VALIDACIONES
        if (!form.name.trim()) {
            setErrorMsg('El nombre es obligatorio');
            return;
        }

        if (!form.phones[0].trim()) {
            setErrorMsg('El teléfono 1 es obligatorio');
            return;
        }

        for (const phone of form.phones) {
            if (phone.trim() === '') continue;
            if (!/^\d{8}$/.test(phone)) {
                setErrorMsg('Los teléfonos deben tener exactamente 8 dígitos');
                return;
            }
        }

        try {
            if (isEdit) {
                await updateSupplier(id, form);
            } else {
                await createSupplier(form);
            }
            onClose();

        } catch (error) {
            // Manejo del error del backend (Spring Boot)
            const backendError = error.response?.data;
            setErrorMsg(typeof backendError === 'string' ? backendError : 'Error al guardar proveedor');
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', fontSize: '0.93rem', color: '#333' }}>

            {/* NUEVO: Contenedor del Mensaje de Error */}
            {errorMsg && (
                <div style={errorBannerStyle}>
                    <span style={{ marginRight: '8px' }}>⚠️</span>
                    {errorMsg}
                </div>
            )}

            {/* Información Básica */}
            <div style={sectionTitle}>Información Básica</div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Nombre completo</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                        setForm({ ...form, name: value });
                        if (errorMsg) setErrorMsg('');
                    }}
                    style={inputStyle}
                />
            </div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Nombre Compañía</label>
                <input
                    name="company"
                    value={form.company}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                        setForm({ ...form, company: value });
                        if (errorMsg) setErrorMsg('');
                    }}
                    style={inputStyle}
                />
            </div>


            {/* Contacto */}
            <div style={{ ...sectionTitle, marginTop: '1rem' }}>Contacto</div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Teléfono 1</label>
                <input
                    type="text"
                    maxLength={8}
                    value={form.phones[0] ?? ''}
                    onChange={e => {
                        const value = e.target.value.replace(/\D/g, '');
                        setForm({ ...form, phones: [value, form.phones[1] ?? ''] });
                        if (errorMsg) setErrorMsg('');
                    }}
                    style={inputStyle}
                />
            </div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Teléfono 2</label>
                <input
                    type="text"
                    maxLength={8}
                    value={form.phones[1] ?? ''}
                    onChange={e => {
                        const value = e.target.value.replace(/\D/g, '');
                        setForm({ ...form, phones: [form.phones[0] ?? '', value] });
                        if (errorMsg) setErrorMsg('');
                    }}
                    style={inputStyle}
                />
            </div>

            {/* Ubicación */}
            <div style={{ ...sectionTitle, marginTop: '1rem' }}>Ubicación</div>
            <div style={fieldGroup}>
                <label style={labelStyle}>Dirección</label>
                <input
                    value={form.addresses[0] ?? ''}
                    onChange={e => {
                        setForm({ ...form, addresses: [e.target.value] });
                        if (errorMsg) setErrorMsg('');
                    }}
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
                <label style={labelStyle}>Notas</label>
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

// Estilos
const errorBannerStyle = {
    backgroundColor: '#fee2e2', // Fondo rojo muy claro
    color: '#dc2626',           // Texto rojo oscuro
    padding: '0.8rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    border: '1px solid #f87171',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500'
};

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