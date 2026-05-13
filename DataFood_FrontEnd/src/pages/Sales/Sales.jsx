import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/productosApi'; // Nombre exacto de tu archivo
import { employeeApi } from '../../api/employeeApi';  // Nombre exacto de tu archivo
import axios from 'axios';
import './Sales.css';

export default function Ventas({ isDelivery = false }) {
    const navigate = useNavigate();

    // Estados para datos de la DB
    const [products, setProducts] = useState([]);
    const [employees, setEmployees] = useState([]); // Lista filtrada de motoristas
    const [categories, setCategories] = useState(['Todos']);
    const [loading, setLoading] = useState(true);

    // Estados del carrito y UI
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCat, setSelectedCat] = useState('Todos');
    const [deliveryFee, setDeliveryFee] = useState(0);

    // Datos del cliente y validación
    const [clientData, setClientData] = useState({ namePhone: '', address: '', driver: '' });
    const [errors, setErrors] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // 1. Carga de productos y empleados mediante tus APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Usamos employeeApi.getAll() importado de tu archivo employeeApi.js
                const [prodRes, empData] = await Promise.all([
                    getProducts(),
                    employeeApi.getAll()
                ]);

                setProducts(prodRes.data);

                // Filtramos por el cargo exacto: "Motociclista"
                const drivers = empData.filter(emp => {
                    // Revisamos positionName o position.positionName según tu modelo
                    const cargo = emp.positionName || emp.position?.positionName || "";
                    return cargo === "Motociclista";
                });

                // Si el filtro no encuentra a nadie, cargamos todos para debug
                setEmployees(drivers.length > 0 ? drivers : empData);

                const uniqueCats = ['Todos', ...new Set(prodRes.data.map(p => p.categoryName || p.category))];
                setCategories(uniqueCats);
            } catch (err) {
                console.error("Error al cargar datos desde la DB:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Lógica de filtrado dinámico del menú
    const filteredProducts = products.filter(prod => {
        const categoryName = prod.categoryName || prod.category;
        const matchCat = selectedCat === 'Todos' || categoryName === selectedCat;
        const matchSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    // 3. Funciones del Carrito (Usando productId único de tu base de datos)
    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(item => item.productId === product.productId);
            if (exists) {
                return prev.map(item =>
                    item.productId === product.productId ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prev, { ...product, qty: 1 }];
        });
        if (errors.cart) setErrors({ ...errors, cart: '' });
    };

    const removeFromCart = (productId) => {
        setCart(prev => {
            const exists = prev.find(item => item.productId === productId);
            if (exists && exists.qty > 1) {
                return prev.map(item =>
                    item.productId === productId ? { ...item, qty: item.qty - 1 } : item
                );
            }
            return prev.filter(item => item.productId !== productId);
        });
    };

    // Cálculos de totales e IVA
    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const iva = isDelivery ? 0 : subTotal * 0.15;
    const total = subTotal + iva + Number(deliveryFee);

    // Validación de campos obligatorios
    const validateSale = () => {
        let tempErrors = {};
        if (cart.length === 0) tempErrors.cart = "Agrega productos.";
        if (isDelivery) {
            if (!clientData.namePhone.trim()) tempErrors.namePhone = "Requerido.";
            if (!clientData.address.trim()) tempErrors.address = "Requerido.";
            if (!clientData.driver) tempErrors.driver = "Selecciona motorista.";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handlePreSubmit = () => { if (validateSale()) setShowConfirmModal(true); };

    const handleConfirmarVenta = async () => {
        const payload = {
            clientName: clientData.namePhone,
            address: clientData.address,
            deliveryFee: Number(deliveryFee),
            isDelivery: isDelivery,
            employeeId: 1, // ID del cajero actual
            driverId: isDelivery ? Number(clientData.driver) : null, // ID del motociclista seleccionado
            details: cart.map(item => ({
                productId: item.productId,
                quantity: Number(item.qty), // Aseguramos que la cantidad sea numérica para evitar errores de conversión en SQL
                unitPrice: item.price
            }))
        };

        try {
            await axios.post('http://localhost:8080/api/sales', payload);
            alert("¡Venta realizada con éxito!");
            setCart([]);
            setClientData({ namePhone: '', address: '', driver: '' });
            setDeliveryFee(0);
            setShowConfirmModal(false);
            navigate('/');
        } catch (err) {
            console.error(err);
            alert("Error al procesar la venta en el servidor.");
        }
    };

    return (
        <div className="ventas-page">
            <div className="ventas-left">
                <div className="ventas-filters-top">
                    <div className="ventas-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar platillo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="ventas-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`tab-btn ${selectedCat === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCat(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="ventas-table-container">
                    <table className="ventas-table">
                        <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Platillo</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProducts.map(prod => (
                            <tr key={prod.productId}>
                                <td>{prod.categoryName || prod.category}</td>
                                <td>{prod.name}</td>
                                <td>C$ {prod.price}</td>
                                <td>{prod.stock}</td>
                                <td className="actions-td">
                                    <button className="btn-qty plus" onClick={() => addToCart(prod)}>+</button>
                                    <button className="btn-qty minus" onClick={() => removeFromCart(prod.productId)}>−</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="ventas-bottom-left">
                    <button className="btn-regresar-ventas" onClick={() => navigate('/')}>Regresar</button>
                </div>
            </div>

            <div className="ventas-right">
                <div className="panel-header">{isDelivery ? 'Venta Domicilio' : 'Venta Local'}</div>

                <div className="receipt-box">
                    <div className="receipt-title">Recibo</div>
                    <div className="receipt-items">
                        {cart.length === 0 ? <p style={{color: '#999', textAlign: 'center'}}>Carrito vacío</p> :
                            cart.map((item, index) => (
                                <div className="receipt-item" key={item.productId}>
                                    <span>{index + 1}. {item.name} (x{item.qty})</span>
                                    <span>C$ {(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))
                        }
                    </div>
                    <div className="receipt-total-actual">Total: C$ {subTotal.toFixed(2)}</div>
                </div>

                {isDelivery && (
                    <div className="delivery-form">
                        <div className="delivery-grid">
                            <label>Cliente</label>
                            <input
                                className={errors.namePhone ? 'ventas-input-error' : ''}
                                value={clientData.namePhone}
                                onChange={e => setClientData({...clientData, namePhone: e.target.value})}
                                placeholder="Nombre y Teléfono"
                            />
                            <label>Dirección</label>
                            <input
                                className={errors.address ? 'ventas-input-error' : ''}
                                value={clientData.address}
                                onChange={e => setClientData({...clientData, address: e.target.value})}
                                placeholder="Dirección de entrega"
                            />
                            <label>Motorista</label>
                            <select
                                className={errors.driver ? 'ventas-input-error' : ''}
                                value={clientData.driver}
                                onChange={e => setClientData({...clientData, driver: e.target.value})}
                            >
                                <option value="">-- Seleccionar Motorista --</option>
                                {employees.map(emp => (
                                    <option key={emp.employeeId} value={emp.employeeId}>
                                        {/* Mostramos nombre y apellido en el selector */}
                                        {emp.firstName} {emp.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="totals-box">
                    <div className="total-row"><span>Sub-total</span><input type="text" readOnly value={`C$ ${subTotal.toFixed(2)}`} /></div>
                    {isDelivery ? (
                        <div className="total-row"><span>Envío</span><input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} /></div>
                    ) : (
                        <div className="total-row"><span>IVA (15%)</span><input type="text" readOnly value={`C$ ${iva.toFixed(2)}`} /></div>
                    )}
                    <div className="total-final"><span>Total (C$)</span><span className="total-amount">C$ {total.toFixed(2)}</span></div>
                </div>

                <button className="btn-finalizar" onClick={handlePreSubmit}>Finalizar Venta</button>
            </div>

            {showConfirmModal && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-box">
                        <h2>Confirmar Venta</h2>
                        <p>Total a pagar: <strong>C$ {total.toFixed(2)}</strong></p>
                        <div className="confirm-actions">
                            <button className="btn-confirm-yes" onClick={handleConfirmarVenta}>Confirmar</button>
                            <button className="btn-confirm-no" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}