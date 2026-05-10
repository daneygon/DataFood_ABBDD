import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Productos.css';

// ── DATOS DE EJEMPLO SINCRONIZADOS CON VENTAS ──
const initialCategories = [
  { id: 1, name: 'Desayunos' },
  { id: 2, name: 'Almuerzos' },
  { id: 3, name: 'Cenas' },
  { id: 4, name: 'Bebidas' }
];

const initialProducts = [
  { id: 1, category: 'Desayunos', name: 'Tajada Con queso', price: 80, status: 'ACTIVO' },
  { id: 2, category: 'Almuerzos', name: 'Pollo Asado', price: 100, status: 'ACTIVO' },
  { id: 3, category: 'Almuerzos', name: 'Cerdo Frito', price: 120, status: 'ACTIVO' },
  { id: 4, category: 'Bebidas', name: 'Gaseosa 500ml', price: 30, status: 'ACTIVO' },
  { id: 5, category: 'Cenas', name: 'Tacos (3)', price: 90, status: 'INACTIVO' },
];

export default function Productos() {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState(location.state?.view || 'lista');

  useEffect(() => {
    if (location.state?.view) {
      setView(location.state.view);
    }
  }, [location.state]);

  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [selectedCatTab, setSelectedCatTab] = useState('Todos');
  const [searchList, setSearchList] = useState('');

  const [catForm, setCatForm] = useState({ id: null, name: '' });
  const [prodForm, setProdForm] = useState({ id: null, name: '', category: '', price: '' });
  const [errors, setErrors] = useState({});

  // ── Lógica para Activar / Inactivar producto ──
  const toggleProductStatus = (id) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, status: p.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' } : p
    ));
  };

  const filteredList = products.filter(p => {
    const matchCat = selectedCatTab === 'Todos' || p.category === selectedCatTab;
    const matchSearch = p.name.toLowerCase().includes(searchList.toLowerCase());
    return matchCat && matchSearch;
  });

  const validateCategory = () => {
    let tempErrors = {};
    if (!catForm.name.trim()) tempErrors.catName = "El nombre es obligatorio.";
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(catForm.name)) tempErrors.catName = "Solo letras.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateProduct = () => {
    let tempErrors = {};
    if (!prodForm.name.trim()) tempErrors.prodName = "El nombre es obligatorio.";
    if (!prodForm.category) tempErrors.prodCategory = "Seleccione categoría.";
    if (!prodForm.price || isNaN(prodForm.price) || Number(prodForm.price) <= 0) {
      tempErrors.prodPrice = "Debe ser > 0.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSaveCat = () => {
    if (!validateCategory()) return;
    if (catForm.id) {
      setCategories(categories.map(c => c.id === catForm.id ? { ...c, name: catForm.name } : c));
    } else {
      setCategories([...categories, { id: Date.now(), name: catForm.name }]);
    }
    setCatForm({ id: null, name: '' });
    setErrors({});
  };

  const handleEditCat = (cat) => { setCatForm(cat); setErrors({}); };
  const handleDeleteCat = (id) => setCategories(categories.filter(c => c.id !== id));

  const handleSaveProd = () => {
    if (!validateProduct()) return;
    if (prodForm.id) {
      setProducts(products.map(p => p.id === prodForm.id ? { ...p, ...prodForm } : p));
    } else {
      setProducts([...products, { ...prodForm, id: Date.now(), status: 'ACTIVO' }]);
    }
    setProdForm({ id: null, name: '', category: '', price: '' });
    setErrors({});
  };

  const handleEditProd = (prod) => { setProdForm(prod); setErrors({}); };
  const handleDeleteProd = (id) => setProducts(products.filter(p => p.id !== id));

  return (
    <div className="prod-page">
      <div className="prod-top-actions">
        <button className="btn-regresar" onClick={() => navigate('/')}>Regresar al Dashboard</button>
        <button className="btn-admin-toggle" onClick={() => setView(view === 'lista' ? 'admin' : 'lista')}>
          {view === 'lista' ? '⚙️ Administrar Productos y Categorías' : '📋 Ver Lista de Productos'}
        </button>
      </div>

      {view === 'lista' && (
        <div className="prod-list-container">
          <div className="prod-filters">
            <select className="prod-select"><option>Categoría</option></select>
            <select className="prod-select"><option>All</option></select>
            <input type="text" className="prod-input" placeholder="A-Z" style={{width: '60px'}} />
            <div className="prod-search">
              <span>🔍</span>
              <input type="text" placeholder="Buscar platillo..." value={searchList} onChange={e => setSearchList(e.target.value)}/>
            </div>
          </div>

          <div className="prod-tabs">
            <button className={`prod-tab ${selectedCatTab === 'Todos' ? 'active' : ''}`} onClick={() => setSelectedCatTab('Todos')}>Todos</button>
            {categories.map(c => (
              <button key={c.id} className={`prod-tab ${selectedCatTab === c.name ? 'active' : ''}`} onClick={() => setSelectedCatTab(c.name)}>{c.name}</button>
            ))}
          </div>

          <table className="prod-table">
            <thead>
              <tr><th>Categoría</th><th>Nombre Platillo</th><th>Estado</th><th>Precio</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filteredList.map(p => (
                <tr key={p.id}>
                  <td className="cat-highlight">{p.category}</td>
                  <td className="fw-bold">{p.name}</td>
                  <td className={p.status === 'ACTIVO' ? 'text-active' : 'text-inactive'}>{p.status}</td>
                  <td>C$ {p.price}</td>
                  <td>
                    {/* AQUI ESTÁN LAS CLASES NUEVAS (prod-switch y prod-slider) */}
                    <label className="prod-switch">
                      <input type="checkbox" checked={p.status === 'ACTIVO'} onChange={() => toggleProductStatus(p.id)} />
                      <span className="prod-slider"></span>
                    </label>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && <tr><td colSpan="5" className="text-center">No hay productos.</td></tr>}
            </tbody>
          </table>
          <div className="watermark">Platillos</div>
        </div>
      )}

      {view === 'admin' && (
        <div className="prod-admin-grid">
          <div className="admin-panel">
            <div className="admin-header">Administrar Categorias</div>
            <div className="admin-body">
              <div className="admin-filters">
                <div className="prod-search"><span style={{marginLeft:'5px'}}>🔍</span><input type="text" /></div>
                <input type="text" className="prod-input" placeholder="A-Z" style={{width: '60px'}} />
              </div>
              <div className="admin-form-actions">
                <button className="btn-save-new" onClick={() => { setCatForm({...catForm, id: null}); handleSaveCat(); }}>Guardar Nuevo</button>
                <button className="btn-save-edit" onClick={handleSaveCat} disabled={!catForm.id}>Guardar Cambios</button>
              </div>
              <div className="admin-input-group">
                <input type="text" className={`prod-input full-width ${errors.catName ? 'input-error' : ''}`} placeholder="Nombre Categoria" value={catForm.name} onChange={e => { setCatForm({...catForm, name: e.target.value}); if(errors.catName) setErrors({...errors, catName: ''}); }}/>
                {errors.catName && <span className="error-text">{errors.catName}</span>}
              </div>
              <table className="admin-table mt-3">
                <thead><tr><th style={{background: '#444'}}>Nombre de Categoría</th><th style={{background: '#444', width: '80px'}}>Acciones</th></tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.name}</td>
                      <td className="actions-cell">
                        <button className="icon-btn edit" onClick={() => handleEditCat(c)}>✏️</button>
                        <button className="icon-btn delete" onClick={() => handleDeleteCat(c.id)}>🗑️</button>
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
              <div className="admin-filters" style={{justifyContent: 'flex-start'}}>
                <div className="prod-search" style={{maxWidth: '200px'}}><span style={{marginLeft:'5px'}}>🔍</span><input type="text" placeholder="Buscar Plato"/></div>
                <select className="prod-input"><option>Categoria</option></select>
              </div>
              <table className="admin-table mt-3">
                <thead><tr><th style={{background: '#444'}}>Platillo</th><th style={{background: '#444'}}>Precio Venta</th><th style={{background: '#444'}}>Categoría</th><th style={{background: '#444', width: '80px'}}>Acciones</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.name}</td><td>C$ {p.price}</td><td>{p.category}</td>
                      <td className="actions-cell">
                        <button className="icon-btn edit" onClick={() => handleEditProd(p)}>✏️</button>
                        <button className="icon-btn delete" onClick={() => handleDeleteProd(p.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="admin-form-actions mt-3">
                <button className="btn-save-new" onClick={() => { setProdForm({...prodForm, id: null}); handleSaveProd(); }}>Guardar Nuevo</button>
                <button className="btn-save-edit" onClick={handleSaveProd} disabled={!prodForm.id}>Guardar Cambios</button>
              </div>
              <div className="admin-inputs-row mt-3">
                <div style={{flex: 2}}>
                  <input type="text" className={`prod-input full-width ${errors.prodName ? 'input-error' : ''}`} placeholder="Nombre Plato" value={prodForm.name} onChange={e => { setProdForm({...prodForm, name: e.target.value}); if(errors.prodName) setErrors({...errors, prodName: ''}); }}/>
                  {errors.prodName && <span className="error-text">{errors.prodName}</span>}
                </div>
              </div>
              <div className="admin-inputs-row mt-2">
                <div style={{flex: 1}}>
                  <select className={`prod-input full-width ${errors.prodCategory ? 'input-error' : ''}`} value={prodForm.category} onChange={e => { setProdForm({...prodForm, category: e.target.value}); if(errors.prodCategory) setErrors({...errors, prodCategory: ''}); }}>
                    <option value="">Categoria Asignada</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  {errors.prodCategory && <span className="error-text">{errors.prodCategory}</span>}
                </div>
                <div style={{flex: 1}}>
                  <input type="number" className={`prod-input full-width ${errors.prodPrice ? 'input-error' : ''}`} placeholder="Precio" value={prodForm.price} onChange={e => { setProdForm({...prodForm, price: e.target.value}); if(errors.prodPrice) setErrors({...errors, prodPrice: ''}); }}/>
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