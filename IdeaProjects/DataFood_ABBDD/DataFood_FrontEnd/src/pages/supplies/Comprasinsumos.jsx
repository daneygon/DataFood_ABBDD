import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPurchases, deletePurchase } from '../../api/Supplyapi.js';
import { getSuppliers } from '../../api/supplierApi';
import Nuevacompramodal from './Nuevacompramodal';
import './Comprasinsumo.css';

export default function Comprasinsumos() {
    const navigate = useNavigate();
    const [purchases,    setPurchases]    = useState([]);
    const [suppliers,    setSuppliers]    = useState([]);
    const [selected,     setSelected]     = useState(null);
    const [search,       setSearch]       = useState('');
    const [dateFrom,     setDateFrom]     = useState('');
    const [dateTo,       setDateTo]       = useState('');
    const [provFilter,   setProvFilter]   = useState('');
    const [showModal,    setShowModal]    = useState(false);
    const [editPurchase, setEditPurchase] = useState(null);

    const fetchAll = async () => {
        try {
            const [pRes, sRes] = await Promise.all([getPurchases(), getSuppliers()]);
            setPurchases(pRes.data);
            setSuppliers(sRes.data);
            if (pRes.data.length > 0) setSelected(pRes.data[0]);
        } catch (e) { console.error(e); }
    };

    /*useEffect(() => { fetchAll(); }, []);*/

    const handleDelete = async (id) => {
        if (!window.confirm('¿Anular esta compra?')) return;
        try {
            await deletePurchase(id);
            fetchAll();
        } catch (e) { console.error(e); }
    };

    const openNew    = () => { setEditPurchase(null); setShowModal(true); };
    const openEdit   = (p) => { setEditPurchase(p);   setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditPurchase(null); fetchAll(); };
    const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setProvFilter(''); };

    const filtered = purchases.filter(p => {
        const matchSearch   = search ? p.supply?.name?.toLowerCase().includes(search.toLowerCase()) || p.supplier?.name?.toLowerCase().includes(search.toLowerCase()) || String(p.purchaseId).includes(search) : true;
        const matchProv     = provFilter ? String(p.supplier?.supplierId) === provFilter : true;
        const matchDateFrom = dateFrom ? new Date(p.purchaseDate) >= new Date(dateFrom) : true;
        const matchDateTo   = dateTo   ? new Date(p.purchaseDate) <= new Date(dateTo + 'T23:59:59') : true;
        return matchSearch && matchProv && matchDateFrom && matchDateTo;
    });

    const fmt = (date) => date ? new Date(date).toLocaleString('es-NI', { dateStyle: 'short', timeStyle: 'short' }) : '—';

    return (
        <div className="compras-page">
            <div className="compras-title-bar">
                <div>
                    <h2 className="compras-h2">Compras de Insumos</h2>
                    <span className="compras-sub">Historial de Compras</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-regresar" onClick={() => navigate('/supplies')}>Regresar</button>
                    <button className="btn-nueva-compra" onClick={openNew}>+ Nueva Compra</button>
                </div>
            </div>

            <div className="compras-filters">
                <div className="search-box-c">
                    <span>🔍</span>
                    <input type="text" placeholder="Buscar por producto, proveedor o N° compra..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filter-group">
                    <label>Fecha: Desde</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="filter-group">
                    <label>Hasta</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                <div className="filter-group">
                    <label>Proveedor:</label>
                    <select value={provFilter} onChange={e => setProvFilter(e.target.value)}>
                        <option value="">Todos</option>
                        {suppliers.map(s => (
                            <option key={s.supplierId} value={String(s.supplierId)}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <button className="btn-limpiar-c" onClick={clearFilters}>▽ Limpiar</button>
            </div>

            <div className="compras-layout">
                <div className="compras-left">
                    <table className="compras-table">
                        <thead>
                        <tr>
                            <th>N° Compra</th>
                            <th>Fecha</th>
                            <th>Proveedor</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(p => (
                            <tr key={p.purchaseId}
                                className={selected?.purchaseId === p.purchaseId ? 'row-selected' : ''}
                                onClick={() => setSelected(p)}
                                style={{ cursor: 'pointer' }}>
                                <td>C-{String(p.purchaseId).padStart(6, '0')}</td>
                                <td>{fmt(p.purchaseDate)}</td>
                                <td>{p.supplier?.name ?? '—'}</td>
                                <td>${Number(p.total).toFixed(2)}</td>
                                <td className="compras-actions" onClick={e => e.stopPropagation()}>
                                    <button className="btn-icon-c" title="Ver"    onClick={() => setSelected(p)}>👁</button>
                                    <button className="btn-icon-c" title="Editar" onClick={() => openEdit(p)}>✏️</button>
                                    <button className="btn-icon-c" title="Anular" onClick={() => handleDelete(p.purchaseId)}>🗑</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} className="no-results">Sin resultados</td></tr>
                        )}
                        </tbody>
                    </table>
                    <div className="compras-count">Mostrando {filtered.length} compra{filtered.length !== 1 ? 's' : ''}</div>
                </div>

                {selected && (
                    <div className="compras-detail">
                        <div className="detail-header">
                            <span className="detail-title">Detalle de la Compra</span>
                            <span className="detail-code">C-{String(selected.purchaseId).padStart(6, '0')}</span>
                        </div>
                        <div className="detail-meta">
                            <div><strong>🧑 Proveedor:</strong> {selected.supplier?.name ?? '—'}</div>
                            <div><strong>📅 Fecha:</strong> {fmt(selected.purchaseDate)}</div>
                            <div><strong>💳 Método de pago:</strong> {selected.paymentMethod ?? 'Efectivo'}</div>
                        </div>
                        <div className="detail-items-title">Insumo Comprado</div>
                        <table className="detail-table">
                            <thead>
                            <tr>
                                <th>Insumo</th><th>Categoría</th><th>Cant.</th>
                                <th>U. Medida</th><th>Precio</th><th>Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>{selected.supply?.name ?? '—'}</td>
                                <td>{selected.supply?.supplyCategory?.name ?? '—'}</td>
                                <td>{selected.quantity}</td>
                                <td>{selected.supply?.unitOfMeasure ?? '—'}</td>
                                <td>${Number(selected.price).toFixed(2)}</td>
                                <td>${Number(selected.total).toFixed(2)}</td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="detail-totals">
                            <div className="total-row total-final">
                                <span>TOTAL:</span>
                                <span>${Number(selected.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay-c">
                    <div className="modal-box-c">
                        <h3>{editPurchase ? 'Editar Compra' : 'Nueva Compra'}</h3>
                        <Nuevacompramodal purchase={editPurchase} suppliers={suppliers} onClose={closeModal} />
                    </div>
                </div>
            )}
        </div>
    );
}