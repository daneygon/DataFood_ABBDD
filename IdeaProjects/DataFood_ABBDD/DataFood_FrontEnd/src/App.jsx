import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard         from './pages/Dashboard';
import SupplierList      from './pages/suppliers/SupplierList';
import SupplierForm      from './pages/suppliers/SupplierForm';
import Insumosdashboard  from './pages/supplies/Insumosdashboard';
import Inventariogeneral from './pages/supplies/Inventariogeneral';
import Comprasinsumos    from './pages/supplies/Comprasinsumos';

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
          <Route path="/supplies"            element={<Insumosdashboard />} />
          <Route path="/supplies/inventory"  element={<Inventariogeneral />} />
          <Route path="/supplies/purchases"  element={<Comprasinsumos />} />

          {/* Módulos Nuevos */}
          <Route path="/employees"           element={<Empleado />} />
          <Route path="/products"            element={<Productos />} />
          <Route path="/sales"               element={<Ventas isDelivery={false} />} />
          <Route path="/delivery"            element={<Ventas isDelivery={true} />} />
        </Routes>
      </BrowserRouter>
  );
}
