import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './Dashboard.css';

const modules = [
  { label: 'Ventas',              icon: '🛒', path: '/sales' },
  { label: 'Domicilio',           icon: '🏠', path: '/delivery' },
  { label: 'Historial de Ventas', icon: '📋', path: '/sales-history' },
  { label: 'Abrir Caja',          icon: '✔️', path: '/open-register' },
  { label: 'Cierre Caja',         icon: '✖️', path: '/close-register' },
  { label: 'Retiro/Dep',          icon: '✉️', path: '/cash-movement' },
  { label: 'Empleados Adm',       icon: '🧍', path: '/employees' },
  { label: 'Reportes',            icon: '🌐', path: '/reports' },
  { label: 'Ayuda',               icon: '🔧', path: '/help' },
];

const insumosSubMenu = [
  { label: 'Inventario General', path: '/supplies/inventory', header: true },
  { label: 'Entradas/Compras',   path: '/supplies/purchases'              },
  { label: 'Insumos Bajos',      path: '/supplies/low-stock'              },
  { label: 'Agregar Nuevo',      path: '/supplies/admin'                  },
];

export default function Dashboard() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [open,           setOpen]           = useState(false);
  const [menuProductos,  setMenuProductos]  = useState(false);
  const btnRef    = useRef(null);
  const popupRef  = useRef(null);

  const isInsumosActive = location.pathname.startsWith('/supplies');

  // Cierra el popup de Insumos al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (
          popupRef.current && !popupRef.current.contains(e.target) &&
          btnRef.current   && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
      <div className="dashboard-layout">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">

          <div className="sidebar-top">
            <div className="sidebar-profile">
              <div className="avatar">R</div>
              <div>
                <div className="business-name">Comideria Raquel</div>
                <div className="system-label">Sistema de Gestion</div>
              </div>
            </div>
            <div className="sidebar-user">
              <div className="user-name">Raquel Perez</div>
              <div className="user-role">Adm</div>
            </div>
          </div>

          <nav className="sidebar-nav">

            {/* DashBoard */}
            <button
                className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => navigate('/')}
            >
              DashBoard
            </button>

            {/* Insumos — popup flotante */}
            <div style={{ position: 'relative' }}>
              <button
                  ref={btnRef}
                  className={`sidebar-link insumos-btn ${isInsumosActive || open ? 'active' : ''}`}
                  onClick={() => { setOpen(!open); setMenuProductos(false); }}
              >
                <span className="insumos-arrow"></span>
                Insumos
              </button>

              {open && (
                  <div ref={popupRef} className="insumos-popup">
                    <div className="popup-label">
                      <span className="triangle-orange">▶</span> Insumos info
                    </div>
                    {insumosSubMenu.map(item => (
                        <button
                            key={item.path}
                            className={`popup-item ${item.header ? 'popup-item-header' : ''}`}
                            onClick={() => { navigate(item.path); setOpen(false); }}
                        >
                          {item.label}
                        </button>
                    ))}
                  </div>
              )}
            </div>

            {/* Proveedores */}
            <button
                className={`sidebar-link ${location.pathname === '/suppliers' ? 'active' : ''}`}
                onClick={() => { setMenuProductos(false); navigate('/suppliers'); }}
            >
              Proveedores
            </button>

            {/* Productos — popup flotante */}
            <div style={{ position: 'relative' }}>
              <button
                  className={`sidebar-link ${location.pathname.startsWith('/productos') ? 'active' : ''}`}
                  onClick={() => { setMenuProductos(!menuProductos); setOpen(false); }}
              >
                Productos
              </button>

              {menuProductos && (
                  <div className="insumos-popup">
                    <div className="popup-label">
                      <span className="triangle-orange">▶</span> Productos info
                    </div>
                    <button
                        className="popup-item"
                        onClick={() => { setMenuProductos(false); navigate('/productos', { state: { view: 'lista' } }); }}
                    >
                      Ver Productos
                    </button>
                    <button
                        className="popup-item"
                        onClick={() => { setMenuProductos(false); navigate('/productos', { state: { view: 'admin' } }); }}
                    >
                      Añadir Productos
                    </button>
                  </div>
              )}
            </div>

          </nav>

          <button className="btn-logout">Cerrar Sesión</button>
        </aside>

        {/* ── MAIN ── */}
        <main className="dashboard-main">
          <div className="modules-grid">
            {modules.map(mod => (
                <button
                    key={mod.path}
                    className="module-card"
                    onClick={() => navigate(mod.path)}
                >
                  <span className="module-label">{mod.label}</span>
                  <span className="module-icon">{mod.icon}</span>
                </button>
            ))}
          </div>
        </main>

      </div>
  );
}