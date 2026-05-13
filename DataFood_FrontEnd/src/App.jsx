import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard        from './pages/Dashboard';
import SupplierList     from './pages/suppliers/SupplierList';
import SupplierForm     from './pages/suppliers/SupplierForm';
import GeneralInventory from './pages/supplies/GeneralInventory';
import AdminSupplies    from './pages/supplies/AdminSupplies';
import SupplyPurchase   from './pages/supplies/SupplyPurchase';
import NewPurchasePage  from './pages/supplies/NewPurchasePage';
import LowSupplies      from './pages/supplies/LowSupplies';
import Productos        from './pages/Productos/Productos';
import Reportes         from './pages/reports/Reportes';
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"                             element={<Dashboard />} />
                <Route path="/suppliers"                    element={<SupplierList />} />
                <Route path="/suppliers/new"                element={<SupplierForm />} />
                <Route path="/suppliers/edit/:id"           element={<SupplierForm />} />
                <Route path="/supplies/inventory"           element={<GeneralInventory />} />
                <Route path="/supplies/admin"               element={<AdminSupplies />} />
                <Route path="/supplies/purchases"           element={<SupplyPurchase />} />
                <Route path="/supplies/purchases/new"       element={<NewPurchasePage />} />
                <Route path="/supplies/purchases/edit/:id"  element={<NewPurchasePage />} />
                <Route path="/supplies/low-stock"           element={<LowSupplies />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/reports"               element={<Reportes />} />


            </Routes>
        </BrowserRouter>
    );
}