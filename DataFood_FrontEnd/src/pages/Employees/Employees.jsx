import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from "../../api/employeeApi";import './Employees.css';

export default function Employees() {
    const navigate = useNavigate();

    // Estados principales
    const [employees, setEmployees] = useState([]);
    const [view, setView] = useState('activos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('Todos');

    // Estados para modales, formulario y errores
    const [modalType, setModalType] = useState(null);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [formData, setFormData] = useState({
        name: '', lastName: '', dni: '', phone: '', role: '', salary: '', email: ''
    });
    const [errors, setErrors] = useState({});

    // Cargar empleados desde la Base de Datos
    const loadEmployees = async () => {
        try {
            const data = await employeeApi.getAll();
            // Transformamos el 'status' (1 o 0) del backend a texto para el frontend
            const formattedData = data.map(emp => ({
                ...emp,
                status: emp.status === 1 ? 'Activo' : 'Inactivo',
                // Como no agregamos fechas a la BD, usamos N/A por defecto
                date: 'N/A',
                inactiveDate: 'N/A',
                reason: 'Inhabilitado por sistema'
            }));
            setEmployees(formattedData);
        } catch (error) {
            console.error("Error al cargar empleados:", error);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    // Manejar cambios en los inputs del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // --- LÓGICA DE VALIDACIÓN ---
    const validate = () => {
        let tempErrors = {};
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        const dniRegex = /^\d{3}-\d{6}-\d{4}[a-zA-Z]$/i;
        const phoneRegex = /^\d{4}-?\d{4}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) tempErrors.name = "El nombre es obligatorio.";
        else if (!nameRegex.test(formData.name)) tempErrors.name = "Solo letras.";

        if (!formData.lastName.trim()) tempErrors.lastName = "El apellido es obligatorio.";
        else if (!nameRegex.test(formData.lastName)) tempErrors.lastName = "Solo letras.";

        if (!formData.phone.trim()) tempErrors.phone = "El teléfono es obligatorio.";
        else if (!phoneRegex.test(formData.phone)) tempErrors.phone = "Formato inválido (Ej: 8888-8888).";

        if (!formData.role) tempErrors.role = "Seleccione un cargo.";

        if (!formData.salary) tempErrors.salary = "El salario es obligatorio.";
        else if (isNaN(formData.salary) || Number(formData.salary) <= 0) tempErrors.salary = "Mayor a 0.";

        if (modalType === 'add') {
            if (!formData.dni.trim()) tempErrors.dni = "La cédula es obligatoria.";
            else if (!dniRegex.test(formData.dni)) tempErrors.dni = "Inválido (Ej: 001-123456-0001A).";

            if (!formData.email.trim()) tempErrors.email = "El correo es obligatorio.";
            else if (!emailRegex.test(formData.email)) tempErrors.email = "Correo inválido.";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // Abrir modal y limpiar/cargar datos
    const openModal = (type, employee = null) => {
        setModalType(type);
        setErrors({});
        if (type === 'edit' && employee) {
            setSelectedEmp(employee);
            setFormData({
                name: employee.name,
                lastName: employee.lastName,
                phone: employee.phone || '',
                role: employee.role,
                salary: employee.salary,
                email: employee.email, // El email normalmente no se edita, pero se carga
                dni: employee.dni || ''
            });
        } else {
            setFormData({ name: '', lastName: '', dni: '', phone: '', role: '', salary: '', email: '' });
        }
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedEmp(null);
        setErrors({});
    };

    // --- LÓGICA DE GUARDAR NUEVO Y ACTUALIZAR (CONECTADO A BD) ---
    const handleSaveNew = async () => {
        if (!validate()) return;
        try {
            await employeeApi.create(formData);
            await loadEmployees(); // Recarga la tabla
            closeModal();
        } catch (error) {
            console.error("Error guardando empleado:", error);
            alert(error.response?.data?.message || "Error al guardar el empleado. Asegúrate de que el DNI/Email no estén repetidos.");
        }
    };

    const handleUpdate = async () => {
        if (!validate()) return;
        try {
            await employeeApi.update(selectedEmp.id, formData);
            await loadEmployees(); // Recarga la tabla
            closeModal();
        } catch (error) {
            console.error("Error actualizando empleado:", error);
            alert("Error al actualizar los datos.");
        }
    };

    // --- LÓGICA DE INHABILITAR Y REACTIVAR (CONECTADO A BD) ---
    const handleToggleStatus = async (id) => {
        try {
            await employeeApi.toggleStatus(id);
            await loadEmployees(); // Recarga la tabla para ver el nuevo estado
        } catch (error) {
            console.error("Error al cambiar el estado:", error);
            alert("No se pudo cambiar el estado del empleado.");
        }
    };

    // Filtrado
    const activos = employees.filter(emp => emp.status === 'Activo');
    const inactivos = employees.filter(emp => emp.status === 'Inactivo');
    let baseList = view === 'activos' ? activos : view === 'inactivos' ? inactivos : employees;

    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        baseList = baseList.filter(emp =>
            emp.name.toLowerCase().includes(lowerSearch) ||
            emp.lastName.toLowerCase().includes(lowerSearch) ||
            emp.email.toLowerCase().includes(lowerSearch)
        );
    }
    if (selectedRole !== 'Todos') {
        baseList = baseList.filter(emp => emp.role === selectedRole);
    }

    return (
        <div className="employees-page">
            <div className="top-bar-actions">
                <button className="btn-regresar" onClick={() => navigate('/')}>Regresar</button>
                <button className="btn-regresar" onClick={() => openModal('add')}>+ Agregar Empleado</button>
            </div>

            <div className="main-content-card">
                <header className="employees-header">
                    <div>
                        <h1 className="page-title">👤 Empleados</h1>
                        <p className="page-subtitle">Administra los empleados del sistema.</p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className={`stat-card ${view === 'activos' ? 'active-view' : ''}`} onClick={() => setView('activos')}>
                        <div className="stat-icon green">👤</div>
                        <div className="stat-info">
                            <span className="stat-label">Empleados activos</span>
                            <span className="stat-value">{activos.length}</span>
                        </div>
                    </div>
                    <div className={`stat-card ${view === 'inactivos' ? 'active-view' : ''}`} onClick={() => setView('inactivos')}>
                        <div className="stat-icon orange">👤</div>
                        <div className="stat-info">
                            <span className="stat-label">Empleados inactivos</span>
                            <span className="stat-value">{inactivos.length}</span>
                        </div>
                    </div>
                    <div className={`stat-card ${view === 'todos' ? 'active-view' : ''}`} onClick={() => setView('todos')}>
                        <div className="stat-icon teal">👤</div>
                        <div className="stat-info">
                            <span className="stat-label">Total empleados</span>
                            <span className="stat-value">{employees.length}</span>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <div className="table-header">
                        <h2>Lista de Empleados {view === 'inactivos' ? 'Inactivos' : view === 'todos' ? '(Todos)' : 'Activos'}</h2>
                        <div className="table-filters">
                            <input type="text" placeholder="🔍 Buscar..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <select className="role-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                                <option value="Administrador">Administrador</option>
                                <option value="Todos">Todos</option>
                                <option value="Cajero">Cajero</option>
                                <option value="Cocinero">Cocinero</option>
                                <option value="Motociclista">Motociclista</option>
                            </select>
                        </div>
                    </div>

                    <table className="custom-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Cargo</th>
                            <th>Gmail</th>
                            <th>Salario</th>
                            {view === 'inactivos' ? (
                                <><th>Fecha inactivación</th><th>Motivo</th><th>Acciones</th></>
                            ) : (
                                <><th>Estado</th><th>Fecha ingreso</th><th>Acciones</th></>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {baseList.map((emp, i) => (
                            <tr key={emp.id}>
                                <td>{i + 1}</td>
                                <td className="fw-bold">{emp.name} {emp.lastName}</td>
                                <td>{emp.role}</td>
                                <td>{emp.email}</td>
                                <td>{Number(emp.salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>

                                {view === 'inactivos' ? (
                                    <>
                                        <td>{emp.inactiveDate}</td>
                                        <td>{emp.reason}</td>
                                        <td className="actions-cell">
                                            <button className="btn-action reactivate" onClick={() => handleToggleStatus(emp.id)}>🔄 Reactivar</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>
                        <span className={`badge ${emp.status === 'Activo' ? 'active' : 'inactive'}`} style={emp.status === 'Inactivo' ? { background: '#f3f4f6', color: '#6b7280' } : {}}>
                          {emp.status}
                        </span>
                                        </td>
                                        <td>{emp.date}</td>
                                        <td className="actions-cell">
                                            {emp.status === 'Activo' ? (
                                                <>
                                                    <button className="btn-action edit" onClick={() => openModal('edit', emp)} title="Editar">✏️</button>
                                                    <button className="btn-action disable" onClick={() => handleToggleStatus(emp.id)} title="Inhabilitar">🚫</button>
                                                </>
                                            ) : (
                                                <button className="btn-action reactivate" onClick={() => handleToggleStatus(emp.id)} title="Reactivar">🔄 Reactivar</button>
                                            )}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {baseList.length === 0 && (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No hay empleados para mostrar.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── MODAL AGREGAR ── */}
            {modalType === 'add' && (
                <div className="modal-overlay">
                    <div className="modal-content modal-lg">
                        <div className="modal-header bg-orange">
                            <h2>Agregar Empleado</h2>
                            <button className="btn-close" onClick={closeModal}>✖</button>
                        </div>
                        <div className="modal-body form-grid">
                            <div className="form-column">
                                <h3>1. Información personal</h3>
                                <label>
                                    Nombres:
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={errors.name ? 'input-error' : ''} />
                                    {errors.name && <span className="error-text">{errors.name}</span>}
                                </label>
                                <label>
                                    Apellidos:
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={errors.lastName ? 'input-error' : ''}/>
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </label>
                                <label>
                                    DNI / Cédula:
                                    <input type="text" name="dni" placeholder="Ej. 001-123456-0001A" value={formData.dni} onChange={handleInputChange} className={errors.dni ? 'input-error' : ''}/>
                                    {errors.dni && <span className="error-text">{errors.dni}</span>}
                                </label>
                                <label>
                                    Teléfono:
                                    <input type="text" name="phone" placeholder="Ej. 8888-8888" value={formData.phone} onChange={handleInputChange} className={errors.phone ? 'input-error' : ''}/>
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                </label>
                                <label>
                                    Cargo:
                                    <select name="role" value={formData.role} onChange={handleInputChange} className={errors.role ? 'input-error' : ''}>
                                        <option value="">Seleccione...</option>
                                        <option value="Cajero">Cajero</option>
                                        <option value="Cocinero">Cocinero</option>
                                        <option value="Motociclista">Motociclista</option>
                                    </select>
                                    {errors.role && <span className="error-text">{errors.role}</span>}
                                </label>
                            </div>
                            <div className="form-column">
                                <h3>2. Información laboral</h3>
                                <label>
                                    Salario mensual (C$):
                                    <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className={errors.salary ? 'input-error' : ''}/>
                                    {errors.salary && <span className="error-text">{errors.salary}</span>}
                                </label>
                                <h3 className="mt-4">3. Usuario de acceso</h3>
                                <label>
                                    Gmail:
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={errors.email ? 'input-error' : ''}/>
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-save teal" onClick={handleSaveNew}>Guardar Empleado</button>
                            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL EDITAR ── */}
            {modalType === 'edit' && (
                <div className="modal-overlay">
                    <div className="modal-content modal-md">
                        <div className="modal-header bg-orange">
                            <h2>Editar Empleado</h2>
                            <button className="btn-close" onClick={closeModal}>✖</button>
                        </div>
                        <div className="modal-body form-grid">
                            <div className="form-column">
                                <h3>1. Información personal</h3>
                                <label>
                                    Nombres:
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={errors.name ? 'input-error' : ''}/>
                                    {errors.name && <span className="error-text">{errors.name}</span>}
                                </label>
                                <label>
                                    Apellidos:
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={errors.lastName ? 'input-error' : ''}/>
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </label>
                                <label>
                                    Teléfono:
                                    <input type="text" name="phone" placeholder="Ej. 8888-8888" value={formData.phone} onChange={handleInputChange} className={errors.phone ? 'input-error' : ''}/>
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                </label>
                            </div>
                            <div className="form-column">
                                <h3>2. Información laboral</h3>
                                <label>
                                    Cargo:
                                    <select name="role" value={formData.role} onChange={handleInputChange} className={errors.role ? 'input-error' : ''}>
                                        <option value="Cajero">Cajero</option>
                                        <option value="Cocinero">Cocinero</option>
                                        <option value="Motociclista">Motociclista</option>
                                    </select>
                                    {errors.role && <span className="error-text">{errors.role}</span>}
                                </label>
                                <label>
                                    Salario mensual (C$):
                                    <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className={errors.salary ? 'input-error' : ''}/>
                                    {errors.salary && <span className="error-text">{errors.salary}</span>}
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-save teal" onClick={handleUpdate}>Guardar Cambios</button>
                            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}