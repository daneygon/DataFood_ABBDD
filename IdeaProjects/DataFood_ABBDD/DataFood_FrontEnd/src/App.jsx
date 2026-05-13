import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard         from './pages/Dashboard';
import SupplierList      from './pages/suppliers/SupplierList';
import SupplierForm      from './pages/suppliers/SupplierForm';
import InventarioGeneral from './pages/supplies/Inventariogeneral';
import AdminInsumos      from './pages/supplies/AdminInsumos';
import Comprasinsumos    from './pages/supplies/Comprasinsumos';




// Aquí está tu importación, pero faltaba registrarla abajo
import NuevaCompraPage   from './pages/supplies/NuevaCompraPage';

import InsumosBajos      from './pages/supplies/InsumosBajos';
import Empleado          from './pages/Empleados/Empleado';
import Ventas            from './pages/Ventas/Ventas';
import Productos         from './pages/Productos/Productos';

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/"                    element={<Dashboard />} />
          <Route path="/suppliers"           element={<SupplierList />} />
          <Route path="/suppliers/new"       element={<SupplierForm />} />
          <Route path="/suppliers/edit/:id"  element={<SupplierForm />} />
          <Route path="/productos" element={<Productos />} />

          <Route path="/supplies"            element={<AdminInsumos />} />
          <Route path="/supplies/inventory"  element={<InventarioGeneral />} />
          <Route path="/supplies/purchases"  element={<Comprasinsumos />} />

          {/* === LA RUTA QUE FALTABA PARA EL BOTÓN DE NUEVA COMPRA === */}
          <Route path="/supplies/purchases/new" element={<NuevaCompraPage />} />

          {/* === RUTAS AGREGADAS PARA EL MENÚ DE INSUMOS === */}
          <Route path="/supplies/low-stock"  element={<InsumosBajos />} />
          <Route path="/supplies/admin"      element={<AdminInsumos />} />
          {/* =============================================== */}

          {/* Módulos Nuevos */}
          <Route path="/employees"           element={<Empleado />} />
          <Route path="/products"            element={<Productos />} />
          <Route path="/sales"               element={<Ventas isDelivery={false} />} />
          <Route path="/delivery"            element={<Ventas isDelivery={true} />} />
        </Routes>
      </BrowserRouter>
  );
}
