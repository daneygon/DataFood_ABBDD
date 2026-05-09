import React, { useState } from 'react';
import './Cajas.css';

export default function RetiroDeposito({ onClose }) {
    const [tipo, setTipo] = useState('retiro');
    const [monto, setMonto] = useState('');
    const [motivo, setMotivo] = useState('');
    const [observacion, setObservacion] = useState('');

    const saldoActual = 5000;
    const montoNum = parseFloat(monto) || 0;
    const nuevoSaldo = tipo === 'retiro' ? saldoActual - montoNum : saldoActual + montoNum;

    const handleGuardar = () => {
        console.log("Movimiento:", { tipo, monto: montoNum, motivo, observacion });
        onClose();
    };

    return (
        <div className="cajaModel-overlay">
            <div className="cajaModel-container large">

                <div className="cajaModel-title">
                    <span>📤</span>
                    Movimiento de Caja
                    <span style={{ fontSize: '0.9rem', color: '#f07c2a', fontWeight: 'normal' }}>Retiro / Depósito</span>
                </div>

                <div className="caja-grid-2-col">

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="caja-panel">
                            <div className="caja-panel-header light">1. Datos del movimiento</div>
                            <div className="caja-panel-body" style={{ background: '#fff' }}>
                                <p>👤 <strong>Usuario:</strong> Juan Pérez</p>
                                <p>📅 <strong>Fecha:</strong> 29/04/2026</p>
                                <p>🕒 <strong>Hora:</strong> 08:00 AM</p>
                            </div>
                        </div>

                        <div className="caja-input-group">
                            <label className="caja-panel-header light" style={{padding:0}}>3. Monto</label>
                            <input
                                type="number"
                                className="caja-input"
                                placeholder="C$ 0.00"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="caja-input-group">
                            <label className="caja-panel-header light" style={{padding:0}}>2. Tipo de movimiento</label>
                            <div className="mov-type-container">
                                <button
                                    className={`mov-btn retiro ${tipo === 'retiro' ? 'active' : ''}`}
                                    onClick={() => setTipo('retiro')}
                                >
                                    <span>⬇️</span> Retiro
                                </button>
                                <button
                                    className={`mov-btn deposito ${tipo === 'deposito' ? 'active' : ''}`}
                                    onClick={() => setTipo('deposito')}
                                >
                                    <span>⬆️</span> Depósito
                                </button>
                            </div>
                        </div>

                        <div className="caja-input-group">
                            <label className="caja-panel-header light" style={{padding:0}}>4. Motivo</label>
                            <select
                                className="caja-input"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                            >
                                <option value="">Seleccionar motivo</option>
                                <option value="pago_proveedor">Pago a proveedor</option>
                                <option value="gastos_varios">Gastos varios</option>
                                <option value="ingreso_extra">Ingreso extra</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="caja-input-group" style={{ marginTop: '1rem' }}>
                    <label className="caja-panel-header light" style={{padding:0}}>5. Observación (opcional)</label>
                    <textarea
                        className="caja-textarea"
                        placeholder="Agrega una observación si existe alguna información adicional..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                    />
                </div>

                <div className="caja-panel" style={{ marginTop: '1rem' }}>
                    <div className="caja-panel-header">6. Resumen del movimiento</div>
                    <div className="caja-panel-body" style={{ flexDirection: 'row', justifyContent: 'space-around', background: '#fff' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{fontSize: '0.8rem', color:'#777'}}>Saldo actual</p>
                            <strong>C$ {saldoActual.toFixed(2)}</strong>
                        </div>
                        <div style={{ textAlign: 'center', color: tipo === 'retiro' ? '#e74c3c' : '#2ecc71' }}>
                            <p style={{fontSize: '0.8rem', color:'#777'}}>Movimiento</p>
                            <strong>{tipo === 'retiro' ? '-' : '+'}C$ {montoNum.toFixed(2)}</strong>
                        </div>
                        <div style={{ textAlign: 'center', color: '#1e8449' }}>
                            <p style={{fontSize: '0.8rem', color:'#777'}}>Nuevo saldo</p>
                            <strong>C$ {nuevoSaldo.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>

                <div className="caja-actions">
                    <button className="caja-btn teal" onClick={onClose}>Dashboard</button>
                    <button className="caja-btn teal" onClick={handleGuardar}>Guardar</button>
                    <button className="caja-btn orange" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}