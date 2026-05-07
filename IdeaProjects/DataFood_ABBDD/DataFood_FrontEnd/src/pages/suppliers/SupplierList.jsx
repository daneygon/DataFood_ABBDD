import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSuppliers, toggleSupplier } from '../../api/supplierApi';
import './SupplierList.css';

export default function SupplierList() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers]   = useState([]);
  const [search,    setSearch]      = useState('');
  const [filter,    setFilter]      = useState('all');
  const [sortAZ,    setSortAZ]      = useState(true);

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    const { data } = await getSuppliers();
    setSuppliers(data);
  };

  const handleToggle = async (id) => {
    await toggleSupplier(id);
    fetchSuppliers();
  };

  const filtered = suppliers
    .filter(s => {
      const matchSearch  = s.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter  = filter === 'all'
        ? true
        : filter === 'active' ? s.status === 1 : s.status === 0;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => sortAZ
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
    );

  return (
    <div className="supplier-page">

      <div className="supplier-header">
        <button className="btn-back" onClick={() => navigate('/')}>Regresar</button>
        <button className="btn-add"  onClick={() => navigate('/suppliers/new')}>Agregar Proveedor</button>
      </div>

      <div className="supplier-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button className="btn-sort" onClick={() => setSortAZ(!sortAZ)}>
          {sortAZ ? 'A-Z' : 'Z-A'}
        </button>

        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <table className="supplier-table">
        <thead>
          <tr>
            <th>Nombre Proveedor</th>
            <th>Teléfono</th>
            <th>Compañía</th>
            <th>Dirección</th>
            <th>Notas</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.supplierId}>
              <td>{s.name}</td>
              <td>{s.phones?.[0] ?? '—'}</td>
              <td>{s.company}</td>
              <td>{s.addresses?.[0] ?? '—'}</td>
              <td>{s.description ?? '—'}</td>
              <td>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={s.status === 1}
                    onChange={() => handleToggle(s.supplierId)}
                  />
                  <span className="slider"></span>
                  <span className="toggle-label">
                    {s.status === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </td>
              <td className="actions">
                <button
                  className="btn-icon"
                  title="Editar"
                  onClick={() => navigate(`/suppliers/edit/${s.supplierId}`)}
                >✏️</button>
                <button className="btn-icon" title="Ver detalles">👤</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={7} style={{textAlign:'center', padding:'2rem'}}>Sin resultados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
