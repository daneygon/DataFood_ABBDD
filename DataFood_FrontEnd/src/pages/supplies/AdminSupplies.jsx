import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getSupplyCategories,
    createSupplyCategory,
    updateSupplyCategory,
    deleteSupplyCategory,
    getSupplies,
    createSupply,
    updateSupply
} from '../../api/Supplyapi.js';

import './AdminSupplies.css';

export default function AdminSupplies() {

    const navigate = useNavigate();

    // ── Categorías ─────────────────────────────
    const [categories, setCategories] = useState([]);
    const [catSearch, setCatSearch] = useState('');
    const [showCatForm, setShowCatForm] = useState(false);
    const [catFormName, setCatFormName] = useState('');
    const [editCatId, setEditCatId] = useState(null);

    // ── Insumos ───────────────────────────────
    const [supplies, setSupplies] = useState([]);

    const [newSupName, setNewSupName] = useState('');
    const [newSupUnit, setNewSupUnit] = useState('');
    const [newSupMinQty, setNewSupMinQty] = useState(0);
    const [newSupCatId, setNewSupCatId] = useState('');

    const [editSupplyId, setEditSupplyId] = useState(null);

    // ── FETCH ALL ─────────────────────────────
    const fetchAll = async () => {

        try {

            const [cRes, sRes] = await Promise.all([
                getSupplyCategories(),
                getSupplies()
            ]);

            setCategories(cRes.data);
            setSupplies(sRes.data);

        } catch (error) {

            console.error(error);

        }
    };

    // ── USE EFFECT ────────────────────────────
    useEffect(() => {

        const loadData = async () => {
            await fetchAll();
        };

        loadData();

    }, []);

    // ── CATEGORÍAS ────────────────────────────

    const openNewCat = () => {

        setEditCatId(null);
        setCatFormName('');
        setShowCatForm(true);
    };

    const openEditCat = (c) => {

        setEditCatId(c.supplyCategoryId);
        setCatFormName(c.name);
        setShowCatForm(true);
    };

    const saveCat = async () => {

        if (!catFormName.trim()) return;

        try {

            if (editCatId) {

                await updateSupplyCategory(editCatId, {
                    name: catFormName
                });

            } else {

                await createSupplyCategory({
                    name: catFormName
                });
            }

            setShowCatForm(false);
            setCatFormName('');
            setEditCatId(null);

            await fetchAll();

        } catch (error) {

            console.error(error);

        }
    };

    const deleteCat = async (id) => {

        const confirmDelete = window.confirm(
            '¿Eliminar esta categoría?'
        );

        if (!confirmDelete) return;

        try {

            await deleteSupplyCategory(id);

            await fetchAll();

        } catch (error) {

            console.error(error);

            alert(
                'No se puede eliminar porque tiene insumos asignados.'
            );
        }
    };

    // ── INSUMOS ───────────────────────────────

    const saveSupply = async () => {

        if (!newSupName.trim() || !newSupCatId) return;

        try {

            const payload = {
                name: newSupName,
                unitOfMeasure: newSupUnit || 'Und',
                availableQuantity: 0,
                minimumQuantity: Number(newSupMinQty),
                supplyCategoryId: Number(newSupCatId)
            };

            if (editSupplyId) {

                await updateSupply(editSupplyId, payload);

            } else {

                await createSupply(payload);
            }

            setNewSupName('');
            setNewSupUnit('');
            setNewSupMinQty(0);
            setNewSupCatId('');
            setEditSupplyId(null);

            await fetchAll();

        } catch (error) {

            console.error(error);

        }
    };

    // ── FILTROS ───────────────────────────────

    const filteredCats = categories.filter((c) =>
        c.name.toLowerCase().includes(
            catSearch.toLowerCase()
        )
    );

    // ── RENDER ────────────────────────────────

    return (

        <div className="admin-page">

            <div className="admin-layout">

                {/* PANEL CATEGORÍAS */}
                <div className="admin-panel">

                    <div className="admin-panel-header">

                        <h3>
                            Administrar Categorías
                        </h3>

                        <button
                            className="btn-teal"
                            onClick={openNewCat}
                        >
                            + Nueva Categoría
                        </button>

                    </div>

                    {showCatForm && (

                        <div className="cat-form-popup">

                            <input
                                placeholder="Nombre de Categoría"
                                value={catFormName}
                                onChange={(e) =>
                                    setCatFormName(e.target.value)
                                }
                            />

                            <div className="cat-form-btns">

                                <button
                                    className="btn-save-cat"
                                    onClick={saveCat}
                                >
                                    Guardar
                                </button>

                                <button
                                    className="btn-cancel-cat"
                                    onClick={() =>
                                        setShowCatForm(false)
                                    }
                                >
                                    Cancelar
                                </button>

                            </div>

                        </div>
                    )}

                    <div className="search-box-admin">

                        <span>🔍</span>

                        <input
                            placeholder="Buscar Categoría"
                            value={catSearch}
                            onChange={(e) =>
                                setCatSearch(e.target.value)
                            }
                        />

                    </div>

                    <table className="admin-table">

                        <thead>

                        <tr>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>

                        </thead>

                        <tbody>

                        {filteredCats.map((c) => (

                            <tr key={c.supplyCategoryId}>

                                <td>{c.name}</td>

                                <td className="admin-actions">

                                    <button
                                        onClick={() =>
                                            openEditCat(c)
                                        }
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteCat(c.supplyCategoryId)
                                        }
                                    >
                                        🗑️
                                    </button>

                                </td>

                            </tr>
                        ))}

                        {filteredCats.length === 0 && (

                            <tr>

                                <td colSpan={2}>
                                    Sin categorías
                                </td>

                            </tr>
                        )}

                        </tbody>

                    </table>

                    <button
                        className="btn-teal mt"
                        onClick={() => navigate('/')}
                    >
                        Dashboard
                    </button>

                </div>

                {/* PANEL INSUMOS */}
                <div className="admin-panel">

                    <div className="admin-panel-header">

                        <h3>
                            Administrar Insumos
                        </h3>

                    </div>

                    <div className="sup-form">

                        <p className="sup-form-title">

                            {editSupplyId
                                ? 'Editar Insumo'
                                : 'Agregar Nuevo Insumo'}

                        </p>

                        <div className="sup-form-row">

                            <div className="sup-form-group">

                                <label>
                                    Nombre
                                </label>

                                <input
                                    value={newSupName}
                                    onChange={(e) =>
                                        setNewSupName(e.target.value)
                                    }
                                />

                            </div>

                            <div className="sup-form-group">

                                <label>
                                    Unidad
                                </label>

                                <input
                                    value={newSupUnit}
                                    onChange={(e) =>
                                        setNewSupUnit(e.target.value)
                                    }
                                />

                            </div>

                            <div className="sup-form-group">

                                <label>
                                    Stock mínimo
                                </label>

                                <input
                                    type="number"
                                    min={0}
                                    value={newSupMinQty}
                                    onChange={(e) =>
                                        setNewSupMinQty(
                                            Number(e.target.value)
                                        )
                                    }
                                />

                            </div>

                            <div className="sup-form-group">

                                <label>
                                    Categoría
                                </label>

                                <select
                                    value={newSupCatId}
                                    onChange={(e) =>
                                        setNewSupCatId(e.target.value)
                                    }
                                >

                                    <option value="">
                                        -- Seleccionar --
                                    </option>

                                    {categories.map((c) => (

                                        <option
                                            key={c.supplyCategoryId}
                                            value={c.supplyCategoryId}
                                        >
                                            {c.name}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>

                        <div className="sup-form-btns">

                            {editSupplyId && (

                                <button
                                    className="btn-cancel-cat"
                                    onClick={() => {

                                        setEditSupplyId(null);

                                        setNewSupName('');
                                        setNewSupUnit('');
                                        setNewSupMinQty(0);
                                        setNewSupCatId('');
                                    }}
                                >
                                    Cancelar
                                </button>
                            )}

                            <button
                                className="btn-teal"
                                onClick={saveSupply}
                            >

                                {editSupplyId
                                    ? 'Guardar Cambios'
                                    : 'Guardar Nuevo'}

                            </button>

                        </div>

                    </div>

                    <table className="admin-table">

                        <thead>

                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                        </tr>

                        </thead>

                        <tbody>

                        {supplies.map((s) => (

                            <tr key={s.supplyId}>

                                <td>
                                    INS-{String(s.supplyId).padStart(3, '0')}
                                </td>

                                <td>{s.name}</td>

                                <td>
                                    {s.categoryName ?? '—'}
                                </td>

                            </tr>

                        ))}

                        {supplies.length === 0 && (

                            <tr>

                                <td colSpan={3}>
                                    Sin insumos
                                </td>

                            </tr>
                        )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}