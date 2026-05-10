import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    getProductCategories, createProductCategory, updateProductCategory, deleteProductCategory,
    getProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus
} from '../../api/productosApi';
import './Productos.css';

export default function Productos() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const [view, setView] = useState(location.state?.view || 'lista');

    const [categories, setCategories] = useState([]);
    const [products,   setProducts]   = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState('');

    const [selectedCatTab, setSelectedCatTab] = useState(null);
    const [searchList,     setSearchList]     = useState('');
    const [filterStatus,   setFilterStatus]   = useState('');
    const [sortAZ,         setSortAZ]         = useState(false);

    const [catForm,  setCatForm]  = useState({ id: null, name: '' });
    const [prodForm, setProdForm] = useState({ id: null, name: '', productCategoryId: '', price: '' });
    const [errors,   setErrors]   = useState({});

    const [adminSearch,    setAdminSearch]    = useState('');
    const [adminCatFilter, setAdminCatFilter] = useState('');

    useEffect(() => { loadCategories(); }, []);
    useEffect(() => { loadProducts(); }, [selectedCatTab, filterStatus, searchList, sortAZ]);
    useEffect(() => { if (location.state?.view) setView(location.state.view); }, [location.state]);

    const loadCategories = async () => {
        try {
            const { data } = await getProductCategories();
            setCategories(data);
        } catch { setError('No se pudieron cargar las categorías.'); }
    };

    const loadProducts = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const params = {};
            if (selectedCatTab !== null) params.categoryId = selectedCatTab;
            if (filterStatus !== '')     params.status     = filterStatus;
            if (searchList.trim())       params.search     = searchList.trim();
            if (sortAZ)                  params.sortAZ     = true;
            const { data } = await getProducts(params);
            setProducts(data);
        } catch { setError('No se pudieron cargar los productos.'); }
        finally  { setLoading(false); }
    }, [selectedCatTab, filterStatus, searchList, sortAZ]);

    const handleToggleStatus = async (id) => {
        try {
            const { data: updated } = await toggleProductStatus(id);
            setProducts(prev => prev.map(p => p.productId === id ? updated : p));
        } catch { setError('Error al cambiar el estado del producto.'); }
    };

    const validateCategory = () => {
        const errs = {};
        if (!catForm.name.trim()) errs.catName = 'El nombre es obligatorio.';
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(catForm.name)) errs.catName = 'Solo letras.';
        setErrors(errs); return Object.keys(errs).length === 0;
    };

    const validateProduct = () => {
        const errs = {};
        if (!prodForm.name.trim())       errs.prodName     = 'El nombre es obligatorio.';
        if (!prodForm.productCategoryId) errs.prodCategory = 'Seleccione una categoría.';
        if (!prodForm.price || isNaN(prodForm.price) || Number(prodForm.price) <= 0)
            errs.prodPrice = 'Debe ser mayor a 0.';
        setErrors(errs); return Object.keys(errs).length === 0;
    };

    const handleSaveNewCat = async () => {
        if (!validateCategory()) return;
        try {
            await createProductCategory({ name: catForm.name });
            setCatForm({ id: null, name: '' }); setErrors({});
            await loadCategories();
        } catch (e) { setError(e.response?.data?.message || 'Error al guardar categoría.'); }
    };

    const handleSaveEditCat = async () => {
        if (!catForm.id || !validateCategory()) return;
        try {
            await updateProductCategory(catForm.id, { name: catForm.name });
            setCatForm({ id: null, name: '' }); setErrors({});
            await loadCategories(); await loadProducts();
        } catch (e) { setError(e.response?.data?.message || 'Error al actualizar categoría.'); }
    };

    const handleDeleteCat = async (id) => {
        if (!window.confirm('¿Eliminar esta categoría?')) return;
        try { await deleteProductCategory(id); await loadCategories(); await loadProducts(); }
        catch { setError('No se puede eliminar: tiene platillos asociados.'); }
    };

    const handleSaveNewProd = async () => {
        if (!validateProduct()) return;
        try {
            await createProduct({ name: prodForm.name, productCategoryId: Number(prodForm.productCategoryId), price: Number(prodForm.price) });
            setProdForm({ id: null, name: '', productCategoryId: '', price: '' }); setErrors({});
            await loadProducts();
        } catch (e) { setError(e.response?.data?.message || 'Error al guardar producto.'); }
    };

    const handleSaveEditProd = async () => {
        if (!prodForm.id || !validateProduct()) return;
        try {
            await updateProduct(prodForm.id, { name: prodForm.name, productCategoryId: Number(prodForm.productCategoryId), price: Number(prodForm.price) });
            setProdForm({ id: null, name: '', productCategoryId: '', price: '' }); setErrors({});
            await loadProducts();
        } catch (e) { setError(e.response?.data?.message || 'Error al actualizar producto.'); }
    };

    const handleDeleteProd = async (id) => {
        if (!window.confirm('¿Eliminar este platillo?')) return;
        try { await deleteProduct(id); await loadProducts(); }
        catch { setError('Error al eliminar el platillo.'); }
    };

    const handleEditProd = (prod) => {
        setProdForm({ id: prod.productId, name: prod.name, productCategoryId: prod.productCategoryId, price: prod.price });
        setErrors({});
    };

    const adminFiltered = products.filter(p => {
        const matchName = p.name.toLowerCase().includes(adminSearch.toLowerCase());
        const matchCat  = !adminCatFilter || p.productCategoryId === Number(adminCatFilter);
        return matchName && matchCat;
    });

    return (
        <div className="prod-page">
            <div className="prod-top-actions">
                <button className="btn-regresar" onClick={() => navigate('/')}>Dashboard</button>
                <button className="btn-admin-toggle" onClick={() => setView(view === 'lista' ? 'admin' : 'lista')}>
                    {view === 'lista' ? '⚙️ Administrar Productos y Categorías' : '📋 Ver Lista de Productos'}
                </button>
            </div>

            {error && (
                <div className="prod-error">
                    {error}
                    <button onClick={() => setError('')}> ✕</button>
                </div>
            )}

            {view === 'lista' && (
                <div className="prod-list-container">
                    <div className="prod-filters">
                        <select className="prod-select" value={selectedCatTab ?? ''} onChange={e => setSelectedCatTab(e.target.value === '' ? null : Number(e.target.value))}>
                            <option value="">Categoría</option>
                            {categories.map(c => <option key={c.productCategoryId} value={c.productCategoryId}>{c.name}</option>)}
                        </select>
                        <select className="prod-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All</option>
                            <option value="1">Activo</option>
                            <option value="0">Inactivo</option>
                        </select>
                        <button className={`prod-input ${sortAZ ? 'active-filter' : ''}`} style={{ width: '60px', cursor: 'pointer' }} onClick={() => setSortAZ(v => !v)}>A-Z</button>
                        <div className="prod-search">
                            <span>🔍</span>
                            <input type="text" placeholder="Buscar platillo..." value={searchList} onChange={e => setSearchList(e.target.value)} />
                        </div>
                    </div>

                    <div className="prod-tabs">
                        <button className={`prod-tab ${selectedCatTab === null ? 'active' : ''}`} onClick={() => setSelectedCatTab(null)}>Todos</button>
                        {categories.map(c => (
                            <button key={c.productCategoryId} className={`prod-tab ${selectedCatTab === c.productCategoryId ? 'active' : ''}`} onClick={() => setSelectedCatTab(c.productCategoryId)}>{c.name}</button>
                        ))}
                    </div>

                    {loading ? <p style={{ padding: '20px', textAlign: 'center' }}>Cargando...</p> : (
                        <table className="prod-table">
                            <thead><tr><th>Categoría</th><th>Nombre Platillo</th><th>Estado</th><th>Precio</th><th>Acciones</th></tr></thead>
                            <tbody>
                            {products.map(p => (
                                <tr key={p.productId}>
                                    <td className="cat-highlight">{p.categoryName}</td>
                                    <td className="fw-bold">{p.name}</td>
                                    <td className={p.status === 1 ? 'text-active' : 'text-inactive'}>{p.status === 1 ? 'ACTIVO' : 'INACTIVO'}</td>
                                    <td>C$ {Number(p.price).toFixed(0)}</td>
                                    <td>
                                        <label className="prod-switch">
                                            <input type="checkbox" checked={p.status === 1} onChange={() => handleToggleStatus(p.productId)} />
                                            <span className="prod-slider"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && <tr><td colSpan="5" className="text-center">No hay productos.</td></tr>}
                            </tbody>
                        </table>
                    )}
                    <div className="watermark">Platillos</div>
                </div>
            )}

            {view === 'admin' && (
                <div className="prod-admin-grid">
                    <div className="admin-panel">
                        <div className="admin-header">Administrar Categorias</div>
                        <div className="admin-body">
                            <div className="admin-input-group">
                                <input type="text" className={`prod-input full-width ${errors.catName ? 'input-error' : ''}`} placeholder="Nombre Categoria" value={catForm.name}
                                       onChange={e => { setCatForm({ ...catForm, name: e.target.value }); if (errors.catName) setErrors({ ...errors, catName: '' }); }} />
                                {errors.catName && <span className="error-text">{errors.catName}</span>}
                            </div>
                            <div className="admin-form-actions">
                                <button className="btn-save-new" onClick={handleSaveNewCat}>Guardar Nuevo</button>
                                <button className="btn-save-edit" onClick={handleSaveEditCat} disabled={!catForm.id}>Guardar Cambios</button>
                            </div>
                            <table className="admin-table mt-3">
                                <thead><tr><th style={{ background: '#444' }}>Nombre de Categoría</th><th style={{ background: '#444', width: '80px' }}>Acciones</th></tr></thead>
                                <tbody>
                                {categories.map(c => (
                                    <tr key={c.productCategoryId} className={catForm.id === c.productCategoryId ? 'row-selected' : ''}>
                                        <td className="fw-bold">{c.name}</td>
                                        <td className="actions-cell">
                                            <button className="icon-btn edit" onClick={() => { setCatForm({ id: c.productCategoryId, name: c.name }); setErrors({}); }}>✏️</button>
                                            <button className="icon-btn delete" onClick={() => handleDeleteCat(c.productCategoryId)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="admin-panel">
                        <div className="admin-header">Administrar Platillos y Precios</div>
                        <div className="admin-body">
                            <div className="admin-filters" style={{ justifyContent: 'flex-start' }}>
                                <div className="prod-search" style={{ maxWidth: '200px' }}>
                                    <span style={{ marginLeft: '5px' }}>🔍</span>
                                    <input type="text" placeholder="Buscar Plato" value={adminSearch} onChange={e => setAdminSearch(e.target.value)} />
                                </div>
                                <select className="prod-input" value={adminCatFilter} onChange={e => setAdminCatFilter(e.target.value)}>
                                    <option value="">Categoría</option>
                                    {categories.map(c => <option key={c.productCategoryId} value={c.productCategoryId}>{c.name}</option>)}
                                </select>
                            </div>
                            <table className="admin-table mt-3">
                                <thead><tr><th style={{ background: '#444' }}>Platillo</th><th style={{ background: '#444' }}>Precio Venta</th><th style={{ background: '#444' }}>Categoría</th><th style={{ background: '#444', width: '80px' }}>Acciones</th></tr></thead>
                                <tbody>
                                {adminFiltered.map(p => (
                                    <tr key={p.productId} className={prodForm.id === p.productId ? 'row-selected' : ''}>
                                        <td className="fw-bold">{p.name}</td>
                                        <td>C$ {Number(p.price).toFixed(0)}</td>
                                        <td>{p.categoryName}</td>
                                        <td className="actions-cell">
                                            <button className="icon-btn edit" onClick={() => handleEditProd(p)}>✏️</button>
                                            <button className="icon-btn delete" onClick={() => handleDeleteProd(p.productId)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className="admin-form-actions mt-3">
                                <button className="btn-save-new" onClick={handleSaveNewProd}>Guardar Nuevo</button>
                                <button className="btn-save-edit" onClick={handleSaveEditProd} disabled={!prodForm.id}>Guardar Cambios</button>
                            </div>
                            <div className="admin-inputs-row mt-3">
                                <div style={{ flex: 2 }}>
                                    <input type="text" className={`prod-input full-width ${errors.prodName ? 'input-error' : ''}`} placeholder="Nombre Plato" value={prodForm.name}
                                           onChange={e => { setProdForm({ ...prodForm, name: e.target.value }); if (errors.prodName) setErrors({ ...errors, prodName: '' }); }} />
                                    {errors.prodName && <span className="error-text">{errors.prodName}</span>}
                                </div>
                            </div>
                            <div className="admin-inputs-row mt-2">
                                <div style={{ flex: 1 }}>
                                    <select className={`prod-input full-width ${errors.prodCategory ? 'input-error' : ''}`} value={prodForm.productCategoryId}
                                            onChange={e => { setProdForm({ ...prodForm, productCategoryId: e.target.value }); if (errors.prodCategory) setErrors({ ...errors, prodCategory: '' }); }}>
                                        <option value="">Categoria Asignada</option>
                                        {categories.map(c => <option key={c.productCategoryId} value={c.productCategoryId}>{c.name}</option>)}
                                    </select>
                                    {errors.prodCategory && <span className="error-text">{errors.prodCategory}</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input type="number" className={`prod-input full-width ${errors.prodPrice ? 'input-error' : ''}`} placeholder="Precio" value={prodForm.price}
                                           onChange={e => { setProdForm({ ...prodForm, price: e.target.value }); if (errors.prodPrice) setErrors({ ...errors, prodPrice: '' }); }} />
                                    {errors.prodPrice && <span className="error-text">{errors.prodPrice}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
