import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard         from './pages/Dashboard';
import SupplierList      from './pages/suppliers/SupplierList';
import SupplierForm      from './pages/suppliers/SupplierForm';
import InventarioGeneral from './pages/supplies/Inventariogeneral';
import AdminInsumos      from './pages/supplies/AdminInsumos';
import Comprasinsumos    from './pages/supplies/Comprasinsumos';
import NuevaCompraPage   from './pages/supplies/NuevaCompraPage';
import InsumosBajos      from './pages/supplies/InsumosBajos';
import Productos from "./pages/Productos/Productos.jsx";
import Reportes from './pages/reports/Reportes';
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"                             element={<Dashboard />} />
                <Route path="/suppliers"                    element={<SupplierList />} />
                <Route path="/suppliers/new"                element={<SupplierForm />} />
                <Route path="/suppliers/edit/:id"           element={<SupplierForm />} />
                <Route path="/supplies/inventory"           element={<InventarioGeneral />} />
                <Route path="/supplies/admin"               element={<AdminInsumos />} />
                <Route path="/supplies/purchases"           element={<Comprasinsumos />} />
                <Route path="/supplies/purchases/new"       element={<NuevaCompraPage />} />
                <Route path="/supplies/purchases/edit/:id"  element={<NuevaCompraPage />} />
                <Route path="/supplies/low-stock"           element={<InsumosBajos />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/reports"               element={<Reportes />} />


            </Routes>
        </BrowserRouter>
    );
}