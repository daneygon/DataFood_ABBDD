import React, { useState } from 'react';
import './Cajas.css';

export default function AbrirCaja({ onClose }) {
    const [monto, setMonto] = useState('');
    const [observacion, setObservacion] = useState('');

    const handleAbrir = () => {
        console.log("Abriendo caja con:", monto, observacion);
        onClose();
    };

    return (
        <div className="cajaModel-overlay">
            <div className="cajaModel-container">
                {/* CORRECCIÓN: caja-grid-2-col para que el diseño no se rompa */}
                <div className="caja-grid-2-col">

                    <div className="caja-panel">
                        <div className="caja-panel-header">Datos de Apertura</div>
                        <div className="caja-panel-body">
                            <p><strong>Usuario:</strong> Cajero 1 (Juan Pérez)</p>
                            <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                            <p><strong>Hora:</strong> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="caja-input-group">
                            <label>Monto inicial:</label>
                            <input
                                type="number"
                                className="caja-input"
                                placeholder="C$ 0.00"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                            />
                        </div>
                        <div className="caja-input-group">
                            <label>Observación (opcional):</label>
                            <textarea
                                className="caja-textarea"
                                placeholder="Introduzca el monto de inicio de caja..."
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                            />
                        </div>
                    </div>

                </div>

                <div className="caja-actions">
                    <button className="caja-btn teal" onClick={onClose}>Dashboard</button>
                    <button className="caja-btn teal" onClick={handleAbrir}>Abrir Caja</button>
                    <button className="caja-btn orange" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}