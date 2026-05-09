import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard    from '../pages/Dashboard';
import SupplierList from '../pages/suppliers/SupplierList';
import SupplierForm from '../pages/suppliers/SupplierForm';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                      element={<Dashboard />} />
        <Route path="/suppliers"             element={<SupplierList />} />
        <Route path="/suppliers/new"         element={<SupplierForm />} />
        <Route path="/suppliers/edit/:id"    element={<SupplierForm />} />
      </Routes>
    </BrowserRouter>
  );
}