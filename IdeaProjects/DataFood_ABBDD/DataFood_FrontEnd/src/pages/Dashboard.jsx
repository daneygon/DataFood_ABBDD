import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

import AbrirCaja from './Caja/AbrirCaja';
import CerrarCaja from './Caja/CerrarCaja';
import RetiroDeposito from './Caja/RetiroDeposito';

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

const sidebarLinks = [
  { label: 'DashBoard',   path: '/' },
  { label: 'Insumos',     path: '/supplies' },
  { label: 'Proveedores', path: '/suppliers' },
  { label: 'Productos',   path: '/products' },
];

export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [modalActivo, setModalActivo] = useState(null);
  const [menuProductos, setMenuProductos] = useState(false);

  const handleModuloClick = (path) => {
    if (path === '/open-register') {
      setModalActivo('abrir');
    } else if (path === '/close-register') {
      setModalActivo('cerrar');
    } else if (path === '/cash-movement') {
      setModalActivo('movimiento');
    } else {
      navigate(path);
    }
  };

  return (
      <div className="dashboard-layout">
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
            {sidebarLinks.map(link => (
                <div key={link.path} className="sidebar-link-wrapper" style={{ position: 'relative', width: '100%' }}>
                  <button
                      className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                      onClick={() => {
                        if (link.label === 'Productos') {
                          setMenuProductos(!menuProductos);
                        } else {
                          setMenuProductos(false);
                          navigate(link.path);
                        }
                      }}
                  >
                    {link.label}
                  </button>

                  {link.label === 'Productos' && menuProductos && (
                    <div className="productos-tooltip">
                      <div className="tooltip-header">Productos Info</div>
                      <hr className="tooltip-divider" />
                      <ul className="tooltip-list">
                        <li onClick={() => { setMenuProductos(false); navigate('/products', { state: { view: 'lista' } }); }}>
                          <span className="arrow-hover">▶</span> Ver Productos
                        </li>
                        <li onClick={() => { setMenuProductos(false); navigate('/products', { state: { view: 'admin' } }); }}>
                          <span className="arrow-hover">▶</span> Añadir Productos
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
            ))}
          </nav>

          <button className="btn-logout">Cerrar Sesión</button>
        </aside>

        <main className="dashboard-main">
          <div className="modules-grid">
            {modules.map(mod => (
                <button key={mod.path} className="module-card" onClick={() => handleModuloClick(mod.path)}>
                  <span className="module-label">{mod.label}</span>
                  <span className="module-icon">{mod.icon}</span>
                </button>
            ))}
          </div>
        </main>

        {modalActivo === 'abrir' && <AbrirCaja onClose={() => setModalActivo(null)} />}
        {modalActivo === 'cerrar' && <CerrarCaja onClose={() => setModalActivo(null)} />}
        {modalActivo === 'movimiento' && <RetiroDeposito onClose={() => setModalActivo(null)} />}
      </div>
  );
}
