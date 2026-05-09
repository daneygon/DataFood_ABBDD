import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard         from './pages/Dashboard';
import SupplierList      from './pages/suppliers/SupplierList';
import SupplierForm      from './pages/suppliers/SupplierForm';
import Insumosdashboard  from './pages/supplies/Insumosdashboard';
import Inventariogeneral from './pages/supplies/Inventariogeneral';
import Comprasinsumos    from './pages/supplies/Comprasinsumos';

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
        </Routes>
      </BrowserRouter>
  );
}