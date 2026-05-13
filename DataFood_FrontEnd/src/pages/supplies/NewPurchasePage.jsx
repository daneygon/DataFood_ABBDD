import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getSupplies,
    createPurchase,
    updatePurchase,
    getPurchase
} from '../../api/Supplyapi.js';

import { getSuppliers } from '../../api/supplierApi.js';

import './NewPurchasePage.css';

export default function NewPurchasePage() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [supplies,     setSupplies]     = useState([]);
    const [suppliers,    setSuppliers]    = useState([]);
    const [items,        setItems]        = useState([]);
    const [selectedRow,  setSelectedRow]  = useState(null);

    const [supplyId,   setSupplyId]   = useState('');
    const [quantity,   setQuantity]   = useState('');
    const [unitPrice,  setUnitPrice]  = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [payMethod,  setPayMethod]  = useState('Efectivo');
    const [invNumber,  setInvNumber]  = useState('');
    const [isEditing,  setIsEditing]  = useState(false);

    /* ── Carga inicial ── */
    useEffect(() => {
        const loadData = async () => {
            try {
                const [suppliesRes, suppliersRes] = await Promise.all([
                    getSupplies(),
                    getSuppliers()
                ]);

                setSupplies(suppliesRes.data);
                setSuppliers(suppliersRes.data);

                if (id) {
                    const purchaseRes = await getPurchase(id);
                    const purchase = purchaseRes.data;

                    setSupplierId(String(purchase.supplierId));
                    setPayMethod(purchase.paymentMethod ?? 'Efectivo');
                    // FIX: cargar número de factura al editar
                    setInvNumber(purchase.invoiceNumber ?? '');

                    setItems(
                        (purchase.details ?? []).map((d) => ({
                            supplyId:      d.supplyId,
                            supplyName:    d.supplyName,
                            category:      d.supplyCategory ?? '',
                            unitOfMeasure: d.unitOfMeasure ?? '',
                            quantity:      d.quantity,
                            unitPrice:     d.unitPrice,
                            subtotal:      d.subtotal
                        }))
                    );
                }
            } catch (error) {
                console.error(error);
            }
        };

        loadData();
    }, [id]);

    const selectedSupply = supplies.find(
        (s) => String(s.supplyId) === String(supplyId)
    );

    /* ── Items ── */
    const addItem = () => {
        if (!supplyId || !quantity || !unitPrice) return;

        const sup = supplies.find((s) => String(s.supplyId) === String(supplyId));

        const newItem = {
            supplyId:      Number(supplyId),
            supplyName:    sup?.name ?? '',
            category:      sup?.categoryName ?? '',
            unitOfMeasure: sup?.unitOfMeasure ?? '',
            quantity:      Number(quantity),
            unitPrice:     Number(unitPrice),
            subtotal:      Number(quantity) * Number(unitPrice)
        };

        if (isEditing && selectedRow !== null) {
            const updated = [...items];
            updated[selectedRow] = newItem;
            setItems(updated);
            setIsEditing(false);
            setSelectedRow(null);
        } else {
            setItems([...items, newItem]);
        }

        resetForm();
    };

    const editItem = () => {
        if (selectedRow === null) return;
        const item = items[selectedRow];
        setSupplyId(String(item.supplyId));
        setQuantity(String(item.quantity));
        setUnitPrice(String(item.unitPrice));
        setIsEditing(true);
    };

    const deleteItem = () => {
        if (selectedRow === null) return;
        setItems(items.filter((_, i) => i !== selectedRow));
        setSelectedRow(null);
    };

    const resetForm = () => {
        setSupplyId('');
        setQuantity('');
        setUnitPrice('');
    };

    /* ── Totales ── */
    const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal), 0);
    const tax      = subtotal * 0.18;
    const total    = subtotal + tax;

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!supplierId || items.length === 0) {
            alert('Selecciona un proveedor y agrega al menos un insumo.');
            return;
        }

        // FIX: el campo se llama "details" (no "items") para que el backend lo acepte
        const payload = {
            supplierId:    Number(supplierId),
            employeeId:    1,
            paymentMethod: payMethod,
            invoiceNumber: invNumber.trim() || null,
            taxRate:       18.0,
            status:        'Recibido',
            details: items.map((i) => ({
                supplyId:  i.supplyId,
                quantity:  Number(i.quantity),
                unitPrice: Number(i.unitPrice)
            }))
        };

        try {
            if (id) {
                await updatePurchase(id, payload);
            } else {
                await createPurchase(payload);
            }
            navigate('/supplies/purchases');
        } catch (error) {
            console.error('Error payload:', payload);
            console.error('Error response:', error?.response?.data);
            alert(`Error al ${id ? 'editar' : 'registrar'} la compra: ${error?.response?.data?.message ?? error.message}`);
        }
    };

    return (
        <div className="ncp-page">

            <h2 className="ncp-title">
                {id ? 'Editar Compra' : 'Agregar una Nueva Compra'}
            </h2>

            {/* HEADER */}
            <div className="ncp-header-form">

                <div className="ncp-field">
                    <label>Proveedor</label>
                    <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                        <option value="">-- Seleccionar --</option>
                        {suppliers.map((s) => (
                            <option key={s.supplierId} value={s.supplierId}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="ncp-field">
                    <label>Método de pago</label>
                    <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                        <option>Efectivo</option>
                        <option>Tarjeta</option>
                    </select>
                </div>

                {/* FIX: campo siempre visible y con value controlado */}
                <div className="ncp-field">
                    <label>N° Factura</label>
                    <input
                        value="Auto-generado"
                        readOnly
                        style={{ color: '#aaa', cursor: 'not-allowed' }}
                    />
                </div>

            </div>

            {/* BOTONES */}
            <div className="ncp-actions-row">
                <button
                    className={`btn-action ${!isEditing ? 'active' : ''}`}
                    onClick={() => { setIsEditing(false); setSelectedRow(null); resetForm(); }}
                >
                    Agregar
                </button>
                <button className="btn-action" onClick={editItem} disabled={selectedRow === null}>
                    Editar
                </button>
                <button className="btn-action" onClick={deleteItem} disabled={selectedRow === null}>
                    Eliminar
                </button>
            </div>

            <div className="ncp-body">

                {/* IZQUIERDA */}
                <div className="ncp-left">

                    <div className="ncp-item-form">

                        <div className="ncp-item-field">
                            <label>Insumo</label>
                            <select value={supplyId} onChange={(e) => setSupplyId(e.target.value)}>
                                <option value="">-- Seleccionar --</option>
                                {supplies.map((s) => (
                                    <option key={s.supplyId} value={s.supplyId}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedSupply && (
                            <div className="ncp-autocomplete">
                                <span>Categoría: <strong>{selectedSupply.categoryName}</strong></span>
                                <span>Unidad: <strong>{selectedSupply.unitOfMeasure}</strong></span>
                            </div>
                        )}

                        <div className="ncp-item-field">
                            <label>Cantidad</label>
                            <input
                                type="number" min={0.01} step={0.01}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>

                        <div className="ncp-item-field">
                            <label>Precio Unitario ($)</label>
                            <input
                                type="number" min={0} step={0.01}
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                            />
                        </div>

                        <button className="btn-add-item" onClick={addItem}>
                            {isEditing ? '✔ Guardar cambio' : '+ Agregar ítem'}
                        </button>

                    </div>

                    <table className="ncp-table">
                        <thead>
                        <tr>
                            <th>Insumo</th>
                            <th>Categoría</th>
                            <th>Cantidad</th>
                            <th>U.Medida</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item, i) => (
                            <tr
                                key={i}
                                className={selectedRow === i ? 'row-selected-ncp' : ''}
                                onClick={() => setSelectedRow(selectedRow === i ? null : i)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td><strong>{item.supplyName}</strong></td>
                                <td>{item.category}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unitOfMeasure}</td>
                                <td>${Number(item.unitPrice).toFixed(2)}</td>
                                <td>${Number(item.subtotal).toFixed(2)}</td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan={6} className="ncp-empty">Agrega insumos</td></tr>
                        )}
                        </tbody>
                    </table>

                </div>

                {/* RESUMEN */}
                <div className="ncp-summary">
                    <h4>Productos</h4>
                    <hr />
                    <div className="ncp-summary-items">
                        {items.map((it, i) => (
                            <div key={i} className="ncp-summary-row">
                                <span>{it.supplyName}</span>
                                <span>{it.quantity} {it.unitOfMeasure}</span>
                            </div>
                        ))}
                    </div>
                    <hr />
                    <div className="ncp-summary-totals">
                        <div className="ncp-total-row">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="ncp-total-row">
                            <span>IVA (18%):</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="ncp-total-row total-final">
                            <span>TOTAL:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div className="ncp-footer">
                <div className="ncp-count">
                    Productos adquiridos: <strong>{items.length}</strong>
                </div>
                <button className="btn-regresar-ncp" onClick={() => navigate('/supplies/purchases')}>
                    Regresar
                </button>
                <button className="btn-registrar-ncp" onClick={handleSubmit}>
                    {id ? 'Guardar Cambios' : 'Registrar Compra'}
                </button>
            </div>

        </div>
    );
}