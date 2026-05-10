import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reportes.css';

const FILTROS = ['Hoy', 'Esta semana', 'Este mes', 'Este año', 'Personalizar rango'];

const tarjetas = [
    {
        key: 'ventas',
        icono: '💰',
        titulo: 'Reportes de Ventas',
        descripcion: 'Visualiza el rendimiento de las ventas, métodos de pago, productos más vendidos y más.',
        bullets: [
            'Ventas por día, semana o mes',
            'Ventas por método de pago',
            'Top productos y cajeros',
        ],
        boton: 'Ver Reporte de Ventas',
        path: '/reports/ventas',
    },
    {
        key: 'compras',
        icono: '📦',
        titulo: 'Reportes de Compras',
        descripcion: 'Controla los gastos en compras, proveedores, insumos adquiridos y tendencias de abastecimiento.',
        bullets: [
            'Compras por día, semana o mes',
            'Compras por proveedor',
            'Insumos más comprados y costos',
        ],
        boton: 'Ver Reporte de Compras',
        path: '/reports/compras',
    },
    {
        key: 'facturas',
        icono: '🧾',
        titulo: 'Registro de Facturas',
        descripcion: 'Consulta y administra todas las facturas generadas en el sistema de ventas y compras.',
        bullets: [
            'Historial de facturas emitidas',
            'Búsqueda por número o cliente',
            'Reimpresión de facturas',
        ],
        boton: 'Ver Registro de Facturas',
        path: '/reports/facturas',
    },
];

// Datos de actividad reciente (mockup visual — se conectarán al backend en la siguiente fase)
const actividad = [
    { icono: '📈', iconColor: '#22c55e', iconBg: '#dcfce7', label: 'Ventas hoy',         valor: 'C$ 12,350.00', sub: '24 transacciones' },
    { icono: '🛒', iconColor: '#3b82f6', iconBg: '#dbeafe', label: 'Compras hoy',        valor: 'C$ 4,230.00',  sub: '5 compras registradas' },
    { icono: '📄', iconColor: '#8b5cf6', iconBg: '#ede9fe', label: 'Facturas emitidas hoy', valor: '8',         sub: 'Última: #F-000125' },
    { icono: '👥', iconColor: '#f59e0b', iconBg: '#fef3c7', label: 'Cajeros activos',    valor: '3',            sub: 'De 5 registrados' },
];

export default function Reportes() {
    const navigate = useNavigate();
    const [filtroActivo, setFiltroActivo] = useState('Este mes');

    return (
        <div className="rep-page">

            {/* ── Botón regresar ── */}
            <button className="rep-back" onClick={() => navigate('/')}>
                ← Regresar al Dashboard
            </button>

            {/* ── Encabezado ── */}
            <header className="rep-header">
                <div className="rep-header-icon">📊</div>
                <div>
                    <h1 className="rep-title">Reportes del Sistema</h1>
                    <p className="rep-subtitle">Consulta y analiza la información del negocio</p>
                </div>
            </header>

            {/* ── Filtros rápidos ── */}
            <div className="rep-filtros-bar">
                <span className="rep-filtros-label">
                    <span className="rep-filtros-icon">📅</span> Filtros rápidos:
                </span>
                <div className="rep-filtros-btns">
                    {FILTROS.map(f => (
                        <button
                            key={f}
                            className={`rep-filtro-btn ${filtroActivo === f ? 'activo' : ''}`}
                            onClick={() => setFiltroActivo(f)}
                        >
                            <span className="rep-cal-icon">📅</span> {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tarjetas de reportes ── */}
            <div className="rep-tarjetas">
                {tarjetas.map((t, i) => (
                    <div className="rep-card" key={t.key} style={{ animationDelay: `${i * 0.08}s` }}>
                        <div className="rep-card-icono-wrap">
                            <span className="rep-card-icono">{t.icono}</span>
                        </div>
                        <h2 className="rep-card-titulo">{t.titulo}</h2>
                        <p className="rep-card-desc">{t.descripcion}</p>
                        <ul className="rep-card-bullets">
                            {t.bullets.map(b => (
                                <li key={b}>
                                    <span className="rep-check">✅</span> {b}
                                </li>
                            ))}
                        </ul>
                        <button
                            className="rep-card-btn"
                            onClick={() => navigate(t.path)}
                        >
                            {t.boton} →
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Actividad reciente ── */}
            <section className="rep-actividad">
                <div className="rep-actividad-titulo">
                    <span>🕐</span> Actividad reciente
                </div>
                <div className="rep-actividad-grid">
                    {actividad.map(a => (
                        <div className="rep-act-card" key={a.label}>
                            <div
                                className="rep-act-icon"
                                style={{ background: a.iconBg, color: a.iconColor }}
                            >
                                {a.icono}
                            </div>
                            <div className="rep-act-info">
                                <div className="rep-act-label">{a.label}</div>
                                <div className="rep-act-valor" style={{ color: a.iconColor }}>
                                    {a.valor}
                                </div>
                                <div className="rep-act-sub">{a.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Aviso informativo ── */}
            <div className="rep-aviso">
                <span className="rep-aviso-icon">ℹ️</span>
                <p>
                    <strong>Importante:</strong> Todos los reportes se generan con base en los datos
                    registrados en el sistema. Verifica que las fechas seleccionadas sean correctas
                    para obtener información precisa.
                </p>
            </div>

        </div>
    );
}
