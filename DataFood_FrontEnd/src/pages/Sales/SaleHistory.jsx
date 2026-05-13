import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SaleHistory.css';

/* ═══════════════════════════════════════════════════
   API CALLS  (ajusta la base URL si difiere)
═══════════════════════════════════════════════════ */
const BASE = 'http://localhost:8080/api';

const api = {
    getSales:       ()        => fetch(`${BASE}/sales`).then(r => { if (!r.ok) throw r; return r.json(); }),
    getSaleById:    (id)      => fetch(`${BASE}/sales/${id}`).then(r => { if (!r.ok) throw r; return r.json(); }),
    cancelSale:     (id, emp) => fetch(`${BASE}/sales/${id}?employeeId=${emp ?? 1}`, { method: 'DELETE' }).then(r => { if (!r.ok) throw r; }),
    updateSale:     (id, body)=> fetch(`${BASE}/sales/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw r; return r.json(); }),
    getChangeLogs:  (id)      => fetch(`${BASE}/sales/${id}/logs`).then(r => { if (!r.ok) throw r; return r.json(); }),
};

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
const fmt   = (d) => d ? new Date(d).toLocaleString('es-NI', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const money = (n) => Number(n ?? 0).toFixed(2);

function buildReceiptData(s) {
    return {
        saleNumber:    s.saleNumber    ?? '—',
        invoiceNumber: s.invoiceNumber ?? '—',
        saleDate:      fmt(s.saleDate),
        clientName:    s.clientName    ?? 'Consumidor Final',
        employeeName:  s.employeeName  ?? '—',
        saleType:      s.saleType      ?? '—',
        status:        s.status        ?? '—',
        address:       s.address       ?? '',
        deliveryFee:   money(s.deliveryFee ?? 0),
        subtotal:      money(s.subtotal ?? s.total ?? 0),
        total:         money(s.total ?? 0),
        details:       s.details ?? [],
    };
}

/* ═══════════════════════════════════════════════════
   GENERADOR PDF
═══════════════════════════════════════════════════ */
function generateAndDownloadPDF(s) {
    const d    = buildReceiptData(s);
    const rows = d.details.map(item => `
        <tr>
            <td>${item.productName  ?? '—'}</td>
            <td>${item.categoryName ?? '—'}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">C$ ${money(item.unitPrice)}</td>
            <td style="text-align:right">C$ ${money(item.subtotal)}</td>
        </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Comprobante ${d.saleNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Inter',Arial,sans-serif; background:#fff; color:#111; padding:40px; }
  .wrap { max-width:820px; margin:0 auto; border:2px solid #f97316; border-radius:12px; overflow:hidden; }
  .hdr  { background:#f97316; padding:24px 32px; display:flex; justify-content:space-between; align-items:center; }
  .brand h1 { color:white; font-size:28px; font-weight:700; }
  .brand p  { color:white; font-size:13px; opacity:.85; margin-top:2px; }
  .badge    { background:white; border-radius:8px; padding:10px 20px; text-align:right; }
  .badge .lbl { font-size:11px; color:#f97316; font-weight:700; text-transform:uppercase; }
  .badge .num { font-size:18px; font-weight:700; color:#111; }
  .body { padding:28px 32px; }
  .meta { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px;
          background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:18px; }
  .mi .ml { font-size:10px; color:#999; font-weight:700; text-transform:uppercase; margin-bottom:4px; }
  .mi .mv { font-size:13px; font-weight:600; color:#111; }
  .sec { font-size:12px; font-weight:700; color:#555; text-transform:uppercase; margin-bottom:10px; }
  table.items { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:24px; }
  table.items thead tr { background:#f97316; color:white; }
  table.items th { padding:10px 12px; text-align:left; font-weight:600; }
  table.items td { padding:9px 12px; border-bottom:1px solid #fde8d0; }
  .totbox { margin-left:auto; width:280px; border:1px solid #fed7aa; border-radius:10px; overflow:hidden; }
  .tr { display:flex; justify-content:space-between; padding:9px 16px; font-size:13px; background:white; }
  .tr.fin { background:#f97316; color:white; font-weight:700; font-size:15px; }
  .ftr { border-top:1px solid #fde8d0; padding:16px 32px; font-size:11px; color:#aaa; text-align:center; }
  @media print { body{padding:0;} .wrap{border:none;} .noprint{display:none;} }
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="brand"><h1>DataFood</h1><p>Sistema de Gestión de Restaurante</p></div>
    <div class="badge"><div class="lbl">N° Factura</div><div class="num">${d.invoiceNumber}</div></div>
  </div>
  <div class="body">
    <div class="meta">
      <div class="mi"><div class="ml">N° Factura</div><div class="mv">${d.invoiceNumber}</div></div>
      <div class="mi"><div class="ml">N° Venta</div><div class="mv">${d.saleNumber}</div></div>
      <div class="mi"><div class="ml">Fecha</div><div class="mv">${d.saleDate}</div></div>
      <div class="mi"><div class="ml">Cliente</div><div class="mv">${d.clientName}</div></div>
      <div class="mi"><div class="ml">Tipo</div><div class="mv">${d.saleType}</div></div>
      <div class="mi"><div class="ml">Empleado</div><div class="mv">${d.employeeName}</div></div>
      ${d.address ? `<div class="mi"><div class="ml">Dirección</div><div class="mv">${d.address}</div></div>` : ''}
    </div>
    <div class="sec">Detalle de Productos</div>
    <table class="items">
      <thead><tr><th>Producto</th><th>Categoría</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totbox">
      <div class="tr"><span>Subtotal:</span><strong>C$ ${d.subtotal}</strong></div>
      ${Number(d.deliveryFee) > 0 ? `<div class="tr"><span>Envío:</span><strong>C$ ${d.deliveryFee}</strong></div>` : ''}
      <div class="tr fin"><span>TOTAL:</span><strong>C$ ${d.total}</strong></div>
    </div>
  </div>
  <div class="ftr">DataFood — Comprobante de Venta generado electrónicamente · ${new Date().toLocaleString('es-NI')}</div>
</div>
<br>
<div class="noprint" style="text-align:center">
  <button onclick="window.print()" style="background:#f97316;color:white;border:none;border-radius:8px;padding:10px 28px;font-size:14px;font-weight:700;cursor:pointer;">
    🖨 Imprimir / Guardar como PDF
  </button>
</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) win.focus();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ═══════════════════════════════════════════════════
   GENERADOR XML
═══════════════════════════════════════════════════ */
function escXML(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function generateAndDownloadXML(s) {
    const d   = buildReceiptData(s);
    const now = new Date().toISOString();
    const detalles = d.details.map(item => `
    <DetalleItem>
      <Producto>${escXML(item.productName ?? '—')}</Producto>
      <Categoria>${escXML(item.categoryName ?? '—')}</Categoria>
      <Cantidad>${item.quantity}</Cantidad>
      <PrecioUnitario>${money(item.unitPrice)}</PrecioUnitario>
      <Subtotal>${money(item.subtotal)}</Subtotal>
    </DetalleItem>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ComprobanteDeVenta version="1.0">
  <Encabezado>
    <Sistema>DataFood</Sistema>
    <TipoDocumento>Comprobante de Venta</TipoDocumento>
    <NumeroVenta>${escXML(d.saleNumber)}</NumeroVenta>
    <NumeroFactura>${escXML(d.invoiceNumber)}</NumeroFactura>
    <FechaEmision>${escXML(d.saleDate)}</FechaEmision>
    <FechaGeneracion>${now}</FechaGeneracion>
  </Encabezado>
  <Cliente>
    <Nombre>${escXML(d.clientName)}</Nombre>
    ${d.address ? `<Direccion>${escXML(d.address)}</Direccion>` : ''}
  </Cliente>
  <Transaccion>
    <TipoVenta>${escXML(d.saleType)}</TipoVenta>
    <Estado>${escXML(d.status)}</Estado>
    <Empleado>${escXML(d.employeeName)}</Empleado>
  </Transaccion>
  <DetalleProductos>${detalles}</DetalleProductos>
  <Totales>
    <Moneda>NIO</Moneda>
    <Subtotal>${d.subtotal}</Subtotal>
    ${Number(d.deliveryFee) > 0 ? `<Envio>${d.deliveryFee}</Envio>` : ''}
    <TotalGeneral>${d.total}</TotalGeneral>
  </Totales>
</ComprobanteDeVenta>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Comprobante_${d.saleNumber}.xml`;
    a.click();
    URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════
   MODAL: DESCARGA
═══════════════════════════════════════════════════ */
function DownloadModal({ sale, onClose }) {
    return (
        <div className="sh-overlay" onClick={onClose}>
            <div className="sh-modal" onClick={e => e.stopPropagation()}>
                <div className="sh-modal-header">
                    <span className="sh-modal-title">Descargar Comprobante</span>
                    <button className="sh-modal-close" onClick={onClose}>✕</button>
                </div>
                <p className="sh-modal-sub">
                    Venta <strong>{sale.saleNumber}</strong> · Factura <strong>{sale.invoiceNumber || '—'}</strong>
                </p>
                <div className="sh-dl-options">
                    <button className="sh-dl-btn sh-dl-pdf" onClick={() => { generateAndDownloadPDF(sale); onClose(); }}>
                        <span className="sh-dl-icon">📄</span>
                        <span className="sh-dl-label">PDF</span>
                        <span className="sh-dl-desc">Se abre en nueva pestaña para imprimir o guardar</span>
                    </button>
                    <button className="sh-dl-btn sh-dl-xml" onClick={() => { generateAndDownloadXML(sale); onClose(); }}>
                        <span className="sh-dl-icon">🗂</span>
                        <span className="sh-dl-label">XML</span>
                        <span className="sh-dl-desc">Comprobante electrónico · Formato DGI Nicaragua</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MODAL: EDICIÓN
═══════════════════════════════════════════════════ */
function EditModal({ sale, onClose, onSaved }) {
    const [form, setForm] = useState({
        customerName:  sale.clientName    ?? '',
        address:       sale.address       ?? '',
        invoiceNumber: sale.invoiceNumber ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState('');

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await api.updateSale(sale.saleHeaderId, { ...form, employeeId: 1 });
            onSaved();
            onClose();
        } catch (e) {
            setError('Error al guardar. Intenta de nuevo.');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="sh-overlay" onClick={onClose}>
            <div className="sh-edit-modal" onClick={e => e.stopPropagation()}>
                <div className="sh-modal-header">
                    <span className="sh-modal-title">Editar Venta · {sale.saleNumber}</span>
                    <button className="sh-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="sh-edit-fields">
                    <div className="sh-field-group">
                        <label>N° Factura</label>
                        <input
                            className="sh-input"
                            type="text"
                            value={form.invoiceNumber}
                            onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
                            placeholder="Ej: FAC-20260512-001"
                        />
                    </div>
                    <div className="sh-field-group">
                        <label>Cliente</label>
                        <input
                            className="sh-input"
                            type="text"
                            value={form.customerName}
                            onChange={e => setForm({ ...form, customerName: e.target.value })}
                            placeholder="Nombre del cliente"
                        />
                    </div>
                    <div className="sh-field-group">
                        <label>Dirección (domicilio)</label>
                        <input
                            className="sh-input"
                            type="text"
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                            placeholder="Dirección de entrega"
                        />
                    </div>
                </div>
                {error && <p className="sh-edit-error">{error}</p>}
                <div className="sh-edit-actions">
                    <button className="sh-btn-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
                    <button className="sh-btn-save"   onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : '✔ Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MODAL: HISTORIAL DE CAMBIOS
═══════════════════════════════════════════════════ */
function ChangeLogModal({ sale, onClose }) {
    const [logs,    setLogs]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        api.getChangeLogs(sale.saleHeaderId)
            .then(data => setLogs(Array.isArray(data) ? data : []))
            .catch(() => setError('No se pudo cargar el historial.'))
            .finally(() => setLoading(false));
    }, [sale.saleHeaderId]);

    const iconFor = (action = '') => {
        if (action.includes('Creó'))   return { icon: '✚', cls: 'log-icon-create' };
        if (action.includes('Editó'))  return { icon: '✏', cls: 'log-icon-edit' };
        if (action.includes('Anuló')) return { icon: '✕', cls: 'log-icon-cancel' };
        return { icon: '•', cls: 'log-icon-default' };
    };

    return (
        <div className="sh-overlay" onClick={onClose}>
            <div className="sh-log-modal" onClick={e => e.stopPropagation()}>
                <div className="sh-modal-header">
                    <span className="sh-modal-title">Historial de Cambios · {sale.saleNumber}</span>
                    <button className="sh-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="sh-log-body">
                    {loading && <p className="sh-log-empty">Cargando…</p>}
                    {error   && <p className="sh-log-empty sh-log-err">{error}</p>}
                    {!loading && !error && logs.length === 0 && (
                        <p className="sh-log-empty">Sin registros de cambios.</p>
                    )}
                    {!loading && logs.map((log, i) => {
                        const { icon, cls } = iconFor(log.action);
                        return (
                            <div className="sh-log-item" key={log.logId ?? i}>
                                <div className={`sh-log-icon ${cls}`}>{icon}</div>
                                <div className="sh-log-content">
                                    <div className="sh-log-action">{log.action}</div>
                                    <div className="sh-log-detail">{log.detail}</div>
                                    <div className="sh-log-meta">
                                        {fmt(log.logDate)}
                                        {log.employeeName ? ` · ${log.employeeName}` : ''}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════ */
export default function SaleHistory() {
    const navigate = useNavigate();

    const [sales,   setSales]   = useState([]);
    const [selected, setSelected] = useState(null);
    const [loadingList, setLoadingList] = useState(true);

    // Modales
    const [showDownload,  setShowDownload]  = useState(false);
    const [showEdit,      setShowEdit]      = useState(false);
    const [showChangeLog, setShowChangeLog] = useState(false);

    // Filtros
    const [search,       setSearch]       = useState('');
    const [dateFrom,     setDateFrom]     = useState('');
    const [dateTo,       setDateTo]       = useState('');
    const [typeFilter,   setTypeFilter]   = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page,         setPage]         = useState(1);

    const PAGE_SIZE = 8;

    /* ── fetch ── */
    const fetchAll = async () => {
        setLoadingList(true);
        try {
            const data = await api.getSales();
            const list = Array.isArray(data) ? data : (data?.data ?? []);
            // Ordenar de más reciente a más antiguo
            list.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
            setSales(list);
            if (list.length > 0 && !selected) setSelected(list[0]);
        } catch (e) {
            console.error('Error al cargar ventas:', e);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── acciones ── */
    const handleCancel = async (sale) => {
        if (!window.confirm(`¿Anular la venta ${sale.saleNumber}? Esta acción no se puede deshacer.`)) return;
        try {
            await api.cancelSale(sale.saleHeaderId, 1);
            await fetchAll();
        } catch (e) {
            console.error(e);
            alert('Error al anular la venta. Verifica que el servidor esté activo.');
        }
    };

    const clearFilters = () => {
        setSearch(''); setDateFrom(''); setDateTo('');
        setTypeFilter(''); setStatusFilter(''); setPage(1);
    };

    /* ── filtrado ── */
    const filtered = sales.filter(s => {
        const q = search.toLowerCase();
        const matchSearch = !search
            || (s.saleNumber    ?? '').toLowerCase().includes(q)
            || (s.clientName    ?? '').toLowerCase().includes(q)
            || (s.employeeName  ?? '').toLowerCase().includes(q)
            || (s.invoiceNumber ?? '').toLowerCase().includes(q);
        const matchType   = !typeFilter   || s.saleType === typeFilter;
        const matchStatus = !statusFilter || s.status   === statusFilter;
        const matchFrom   = !dateFrom     || new Date(s.saleDate) >= new Date(dateFrom);
        const matchTo     = !dateTo       || new Date(s.saleDate) <= new Date(dateTo + 'T23:59:59');
        return matchSearch && matchType && matchStatus && matchFrom && matchTo;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    /* ── helpers de badge ── */
    const statusCls = (s) => s === 'Completado' ? 'sh-badge-completado' : 'sh-badge-anulado';
    const typeCls   = (t) => t === 'Local'      ? 'sh-badge-local'      : 'sh-badge-domicilio';

    /* ══════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════ */
    return (
        <div className="sh-page">

            {/* ── MODALES ── */}
            {showDownload  && selected && <DownloadModal  sale={selected} onClose={() => setShowDownload(false)} />}
            {showEdit      && selected && <EditModal      sale={selected} onClose={() => setShowEdit(false)}      onSaved={fetchAll} />}
            {showChangeLog && selected && <ChangeLogModal sale={selected} onClose={() => setShowChangeLog(false)} />}

            {/* ── HEADER ── */}
            <div className="sh-title-bar">
                <div>
                    <h2 className="sh-h2">Historial de Ventas</h2>
                    <span className="sh-sub">Registro de todas las ventas realizadas</span>
                </div>
                <button className="sh-btn-dashboard" onClick={() => navigate('/')}>DashBoard</button>
            </div>

            {/* ── FILTROS ── */}
            <div className="sh-filters">
                <div className="sh-search">
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar por N° venta, factura, cliente o empleado..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="sh-filter-group">
                    <label>Desde</label>
                    <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
                </div>
                <div className="sh-filter-group">
                    <label>Hasta</label>
                    <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
                </div>
                <div className="sh-filter-group">
                    <label>Tipo</label>
                    <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
                        <option value="">Todos</option>
                        <option value="Local">Local</option>
                        <option value="Domicilio">Domicilio</option>
                    </select>
                </div>
                <div className="sh-filter-group">
                    <label>Estado</label>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                        <option value="">Todos</option>
                        <option value="Completado">Completado</option>
                        <option value="Anulado">Anulado</option>
                    </select>
                </div>
                <button className="sh-btn-clear" onClick={clearFilters}>▽ Limpiar</button>
            </div>

            {/* ── LAYOUT PRINCIPAL ── */}
            <div className="sh-layout">

                {/* ── TABLA ── */}
                <div className="sh-left">
                    <table className="sh-table">
                        <thead>
                        <tr>
                            <th>N° Venta</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>N° Factura</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loadingList ? (
                            <tr><td colSpan={8} className="sh-no-results">Cargando ventas…</td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={8} className="sh-no-results">Sin resultados</td></tr>
                        ) : paginated.map(s => (
                            <tr
                                key={s.saleHeaderId}
                                className={selected?.saleHeaderId === s.saleHeaderId ? 'sh-row-selected' : ''}
                                onClick={() => setSelected(s)}
                            >
                                <td>{s.saleNumber}</td>
                                <td>{fmt(s.saleDate)}</td>
                                <td>{s.clientName || 'Consumidor Final'}</td>
                                <td>{s.invoiceNumber || '—'}</td>
                                <td>C$ {money(s.total)}</td>
                                <td><span className={`sh-badge ${statusCls(s.status)}`}>{s.status}</span></td>
                                <td><span className={`sh-badge ${typeCls(s.saleType)}`}>{s.saleType}</span></td>
                                <td onClick={e => e.stopPropagation()}>
                                    <div className="sh-actions">
                                        <button
                                            className="sh-btn-icon sh-btn-ver"
                                            title="Ver detalle"
                                            onClick={() => setSelected(s)}
                                        >👁</button>
                                        {s.status !== 'Anulado' && (
                                            <>
                                                <button
                                                    className="sh-btn-icon sh-btn-edit"
                                                    title="Editar venta"
                                                    onClick={() => { setSelected(s); setShowEdit(true); }}
                                                >✏</button>
                                                <button
                                                    className="sh-btn-icon sh-btn-cancel"
                                                    title="Anular venta"
                                                    onClick={() => handleCancel(s)}
                                                >ⓧ</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* ── PAGINACIÓN ── */}
                    <div className="sh-footer">
                        <span className="sh-count">
                            {filtered.length === 0
                                ? 'Sin resultados'
                                : `Mostrando ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length}`}
                        </span>
                        <div className="sh-pagination">
                            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button key={n} className={n === page ? 'sh-pg-active' : ''} onClick={() => setPage(n)}>{n}</button>
                            ))}
                            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
                        </div>
                    </div>
                </div>

                {/* ── PANEL DETALLE ── */}
                {selected && (
                    <div className="sh-detail">
                        <div className="sh-detail-header">
                            <div className="sh-detail-title">Detalle de la Venta</div>
                            <div className="sh-detail-code">{selected.saleNumber}</div>
                        </div>

                        {/* Meta grid */}
                        <div className="sh-meta-grid">
                            <div className="sh-meta-item">
                                <span className="sh-meta-label">CLIENTE</span>
                                <div className="sh-meta-val">{selected.clientName || 'Consumidor Final'}</div>
                            </div>
                            <div className="sh-meta-item">
                                <span className="sh-meta-label">ESTADO</span>
                                <div className="sh-meta-val">
                                    <span className={`sh-badge ${statusCls(selected.status)}`}>{selected.status}</span>
                                </div>
                            </div>
                            <div className="sh-meta-item">
                                <span className="sh-meta-label">FECHA</span>
                                <div className="sh-meta-val">{fmt(selected.saleDate)}</div>
                            </div>
                            <div className="sh-meta-item">
                                <span className="sh-meta-label">N° FACTURA</span>
                                <div className="sh-meta-val">{selected.invoiceNumber || '—'}</div>
                            </div>
                            <div className="sh-meta-item">
                                <span className="sh-meta-label">TIPO</span>
                                <div className="sh-meta-val">
                                    <span className={`sh-badge ${typeCls(selected.saleType)}`}>{selected.saleType}</span>
                                </div>
                            </div>
                            <div className="sh-meta-item">
                                <span className="sh-meta-label">EMPLEADO</span>
                                <div className="sh-meta-val">{selected.employeeName || '—'}</div>
                            </div>
                            {selected.address && (
                                <div className="sh-meta-item sh-meta-full">
                                    <span className="sh-meta-label">DIRECCIÓN</span>
                                    <div className="sh-meta-val">{selected.address}</div>
                                </div>
                            )}
                        </div>

                        {/* Productos */}
                        <div className="sh-section-title">Productos Vendidos</div>
                        <table className="sh-detail-table">
                            <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Cant.</th>
                                <th>Precio</th>
                                <th>Subtotal</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(selected.details ?? []).length === 0 ? (
                                <tr><td colSpan={5} className="sh-no-results">Sin productos registrados</td></tr>
                            ) : (selected.details ?? []).map((d, i) => (
                                <tr key={d.saleDetailId ?? i}>
                                    <td>{d.productName}</td>
                                    <td>{d.categoryName}</td>
                                    <td>{d.quantity}</td>
                                    <td>C$ {money(d.unitPrice)}</td>
                                    <td>C$ {money(d.subtotal)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Totales */}
                        <div className="sh-totals">
                            <div className="sh-total-row">
                                <span>Subtotal:</span>
                                <strong>C$ {money(selected.subtotal ?? selected.total)}</strong>
                            </div>
                            {Number(selected.deliveryFee ?? 0) > 0 && (
                                <div className="sh-total-row">
                                    <span>Envío:</span>
                                    <strong>C$ {money(selected.deliveryFee)}</strong>
                                </div>
                            )}
                            <div className="sh-total-row sh-total-final">
                                <span>TOTAL:</span>
                                <strong>C$ {money(selected.total)}</strong>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="sh-detail-actions">
                            <button
                                className="sh-btn-log"
                                onClick={() => setShowChangeLog(true)}
                            >
                                🕒 Historial de Cambios
                            </button>
                            <button
                                className="sh-btn-download"
                                onClick={() => setShowDownload(true)}
                            >
                                ⬇ Descargar Comprobante
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}