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

const sidebarLinks = [
  { label: 'DashBoard',   path: '/' },
  { label: 'Insumos',     path: '/supplies' },
  { label: 'Proveedores', path: '/suppliers' },
  { label: 'Productos',   path: '/products' },
];

export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();

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

          {/* Nav links spread vertically */}
          <nav className="sidebar-nav">
            {sidebarLinks.map(link => (
                <button
                    key={link.path}
                    className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={() => navigate(link.path)}
                >
                  {link.label}
                </button>
            ))}
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
