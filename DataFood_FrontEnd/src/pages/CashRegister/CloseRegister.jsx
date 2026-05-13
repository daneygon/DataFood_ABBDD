import React, { useState } from 'react';
import './Register.css';

export default function CerrarCaja({ onClose }) {
    const [efectivoContado, setEfectivoContado] = useState('');
    const [observacion, setObservacion] = useState('');

    const efectivoEsperado = 3050;

    const diferencia = (parseFloat(efectivoContado) || 0) - efectivoEsperado;
    const cajaCuadrada = diferencia === 0;

    const handleCerrar = () => {
        console.log("Cerrando caja. Contado:", efectivoContado, "Dif:", diferencia);
        onClose();
    };

    return (
        <div className="cajaModel-overlay">
            <div className="cajaModel-container large">
                <div className="caja-grid-2-col">

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="caja-panel">
                            <div className="caja-panel-header">Datos de Cierre</div>
                            <div className="caja-panel-body">
                                <p><strong>Usuario:</strong> Cajero 1 (Juan Pérez)</p>
                                <p><strong>Fecha:</strong> 29/04/2026</p>
                                <p><strong>Hora:</strong> 08:00 AM - 06:15 PM<br/><small style={{color:'#777'}}>(Apertura - Cierre)</small></p>
                            </div>
                        </div>

                        <div className="caja-panel">
                            <div className="caja-panel-header light">Resumen del día</div>
                            <div className="caja-panel-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Ventas en efectivo:</span> <strong>C$ 3,250</strong>
                                </div>
                                <hr style={{ border: '0.5px solid #f3d5b8', width: '100%' }}/>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Total ventas:</span> <strong>C$ 9,050</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e74c3c' }}>
                                    <span>Movimientos (ing./egr.):</span> <strong>-C$ 200</strong>
                                </div>
                                <hr style={{ border: '0.5px solid #f3d5b8', width: '100%' }}/>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                    <span><strong>Efectivo esperado:</strong></span> <strong>C$ 3,050</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <div className="caja-input-group">
                            <label style={{color:'#f07c2a'}}>1. Conteo físico</label>
                            <input
                                type="number"
                                className="caja-input"
                                placeholder="C$ Efectivo contado"
                                value={efectivoContado}
                                onChange={(e) => setEfectivoContado(e.target.value)}
                            />
                        </div>

                        <div className="caja-panel" style={{ background: '#fff' }}>
                            <div className="caja-panel-header light">2. Resultado</div>
                            <div className="caja-panel-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Efectivo esperado:</span> <strong>C$ {efectivoEsperado}</strong>
                                </div>
                                <span><strong>Diferencia:</strong></span>
                                <div className={`caja-resumen-box ${efectivoContado === '' ? '' : (cajaCuadrada ? 'green' : 'red')}`}>
                                    <span>{efectivoContado === '' ? 'Esperando ingreso...' : (cajaCuadrada ? '✔ Caja cuadrada' : '⚠ Descuadre')}</span>
                                    <span>C$ {diferencia.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="caja-input-group">
                            <label style={{color:'#f07c2a'}}>3. Observación</label>
                            <textarea
                                className="caja-textarea"
                                placeholder="Agrega una observación si existe diferencia..."
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                            />
                        </div>
                    </div>

                </div>

                <div className="caja-actions">
                    <button className="caja-btn teal" onClick={onClose}>Dashboard</button>
                    <button className="caja-btn teal" onClick={handleCerrar}>Cerrar Caja</button>
                    <button className="caja-btn orange" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}