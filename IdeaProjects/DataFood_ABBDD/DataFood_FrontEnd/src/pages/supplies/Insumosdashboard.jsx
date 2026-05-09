import { useNavigate } from 'react-router-dom';
import './Insumosdashboard.css';
const insumoModules = [
    {
        label: 'Inventario General',
        sub: 'Todos los insumos registrados',
        icon: '📦',
        path: '/supplies/inventory',
    },
    {
        label: 'Entradas / Compras',
        sub: 'Registrar y ver compras',
        icon: '🛒',
        path: '/supplies/purchases',
    },
];

export default function Insumosdashboard() {
    const navigate = useNavigate();

    return (
        <div className="insumos-page">
            <div className="insumos-header">
                <button className="btn-back-insumos" onClick={() => navigate('/')}>
                    ← Regresar
                </button>
                <h2 className="insumos-title">Insumos</h2>
            </div>

            <div className="insumos-grid">
                {insumoModules.map(mod => (
                    <button
                        key={mod.path}
                        className="insumo-card"
                        onClick={() => navigate(mod.path)}
                    >
                        <span className="insumo-icon">{mod.icon}</span>
                        <span className="insumo-label">{mod.label}</span>
                        <span className="insumo-sub">{mod.sub}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}