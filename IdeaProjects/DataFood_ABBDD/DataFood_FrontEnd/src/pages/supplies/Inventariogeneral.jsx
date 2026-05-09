import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupplies, getSupplyCategories, decreaseStock } from '../../api/Supplyapi.js';
import { getSuppliers } from '../../api/supplierApi';
import SupplyForm from './Supplyform';
import './Inventariogeneral.css';

export default function InventarioGeneral() {
    const navigate = useNavigate();
    const [supplies,    setSupplies]    = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [suppliers,   setSuppliers]   = useState([]);
    const [search,      setSearch]      = useState('');
    const [catFilter,   setCatFilter]   = useState('');
    const [provFilter,  setProvFilter]  = useState('');
    const [showModal,   setShowModal]   = useState(false);
    const [editSupply,  setEditSupply]  = useState(null);
    const [decreaseId,  setDecreaseId]  = useState(null);
    const [decreaseQty, setDecreaseQty] = useState(1);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [sRes, cRes, pRes] = await Promise.all([
                getSupplies(),
                getSupplyCategories(),
                getSuppliers(),
            ]);
            setSupplies(sRes.data);
            setCategories(cRes.data);
            setSuppliers(pRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDecrease = async (id) => {
        if (decreaseQty <= 0) return;
        try {
            await decreaseStock(id, decreaseQty);
            setDecreaseId(null);
            setDecreaseQty(1);
            fetchAll();
        } catch (e) { console.error(e); }
    };

    const openEdit = (supply) => {
        setEditSupply(supply);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditSupply(null);
        fetchAll();
    };

    const clearFilters = () => {
        setSearch('');
        setCatFilter('');
        setProvFilter('');
    };

    // Buscar último proveedor de cada insumo desde las compras (viene del backend)
    const filtered = supplies.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchCat    = catFilter ? String(s.supplyCategory?.supplyCategoryId) === catFilter : true;
        return matchSearch && matchCat;
    });

    return (
        <div className="inv-page">

            {/* Barra superior */}
            <div className="inv-topbar">
                <button className="btn-dashboard" onClick={() => navigate('/supplies')}>
                    DashBoard
                </button>
                <button className="btn-por-proveedor" onClick={() => setProvFilter(provFilter ? '' : 'open')}>
                    Por Proveedor
                </button>
                <div className="date-range-placeholder">
                    Date Range &nbsp; ∨
                </div>
            </div>

            {/* Filtros */}
            <div className="inv-filters">
                <div className="search-box-inv">
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar insumo..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="cat-select"
                    value={catFilter}
                    onChange={e => setCatFilter(e.target.value)}
                >
                    <option value="">Categorías</option>
                    {categories.map(c => (
                        <option key={c.supplyCategoryId} value={String(c.supplyCategoryId)}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <button className="btn-limpiar" onClick={clearFilters}>
                    ○ limpiar
                </button>
            </div>

            {/* Tabla */}
            <table className="inv-table">
                <thead>
                <tr>
                    <th>Ultima Compra</th>
                    <th>Insumo</th>
                    <th>Cantidad</th>
                    <th>Unidad Medida</th>
                    <th>Categoría</th>
                    <th>Proveedor</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map(s => (
                    <tr key={s.supplyId} className={s.availableQuantity <= s.minimumQuantity ? 'row-low' : ''}>
                        <td>{s.lastPurchaseDate ? new Date(s.lastPurchaseDate).toLocaleDateString() : '—'}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.availableQuantity}</td>
                        <td>{s.unitOfMeasure}</td>
                        <td>{s.supplyCategory?.name ?? '—'}</td>
                        <td>{s.lastSupplierName ?? '—'}</td>
                        <td className="inv-actions">
                            {/* Disminuir Stock */}
                            <div className="decrease-wrap" title="Disminuir Stock">
                                {decreaseId === s.supplyId ? (
                                    <div className="decrease-inline">
                                        <input
                                            type="number"
                                            min={1}
                                            value={decreaseQty}
                                            onChange={e => setDecreaseQty(Number(e.target.value))}
                                        />
                                        <button className="btn-confirm-dec" onClick={() => handleDecrease(s.supplyId)}>✔</button>
                                        <button className="btn-cancel-dec" onClick={() => setDecreaseId(null)}>✖</button>
                                    </div>
                                ) : (
                                    <button
                                        className="btn-circle btn-minus"
                                        title="Disminuir Stock"
                                        onClick={() => { setDecreaseId(s.supplyId); setDecreaseQty(1); }}
                                    >
                                        −
                                    </button>
                                )}
                            </div>

                            {/* Editar */}
                            <button
                                className="btn-circle btn-edit"
                                title="Editar"
                                onClick={() => openEdit(s)}
                            >
                                ✏
                            </button>
                        </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr><td colSpan={7} className="no-results">Sin resultados</td></tr>
                )}
                </tbody>
            </table>

            {/* Modal editar insumo */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>{editSupply ? 'Editar Insumo' : 'Nuevo Insumo'}</h3>
                        <SupplyForm supply={editSupply} categories={categories} onClose={closeModal} />
                    </div>
                </div>
            )}
        </div>
    );
}