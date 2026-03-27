import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import styles from './Catalog.module.css'

export default function Catalog() {
  const { user, logout } = useAuth()

  // ── Categories ──────────────────────────────────────────
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [catError, setCatError] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [editingCat, setEditingCat] = useState(null) // { id, name }
  const [savingCat, setSavingCat] = useState(false)

  // ── Units ────────────────────────────────────────────────
  const [units, setUnits] = useState([])
  const [unitLoading, setUnitLoading] = useState(true)
  const [unitError, setUnitError] = useState('')
  const [newUnit, setNewUnit] = useState({ name: '', abbreviation: '' })
  const [addingUnit, setAddingUnit] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null) // { id, name, abbreviation }
  const [savingUnit, setSavingUnit] = useState(false)

  useEffect(() => {
    api.get('/products/categories/')
      .then(({ data }) => setCategories(data.results ?? data))
      .catch(() => setCatError('Erro ao carregar categorias.'))
      .finally(() => setCatLoading(false))

    api.get('/products/units/')
      .then(({ data }) => setUnits(data.results ?? data))
      .catch(() => setUnitError('Erro ao carregar unidades.'))
      .finally(() => setUnitLoading(false))
  }, [])

  // ── Category handlers ────────────────────────────────────
  async function handleAddCategory(e) {
    e.preventDefault()
    if (!newCatName.trim()) return
    setAddingCat(true)
    setCatError('')
    try {
      const { data } = await api.post('/products/categories/', { name: newCatName.trim() })
      setCategories((prev) => [data, ...prev])
      setNewCatName('')
    } catch (err) {
      setCatError(err.response?.data?.name?.[0] ?? 'Erro ao criar categoria.')
    } finally {
      setAddingCat(false)
    }
  }

  async function handleSaveCategory(e) {
    e.preventDefault()
    if (!editingCat.name.trim()) return
    setSavingCat(true)
    setCatError('')
    try {
      const { data } = await api.patch(`/products/categories/${editingCat.id}/`, { name: editingCat.name.trim() })
      setCategories((prev) => prev.map((c) => (c.id === data.id ? data : c)))
      setEditingCat(null)
    } catch (err) {
      setCatError(err.response?.data?.name?.[0] ?? 'Erro ao salvar categoria.')
    } finally {
      setSavingCat(false)
    }
  }

  async function handleDeleteCategory(id) {
    if (!window.confirm('Excluir esta categoria? Produtos vinculados a ela não poderão ser deletados.')) return
    setCatError('')
    try {
      await api.delete(`/products/categories/${id}/`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setCatError(err.response?.data?.detail ?? 'Erro ao excluir categoria.')
    }
  }

  // ── Unit handlers ────────────────────────────────────────
  async function handleAddUnit(e) {
    e.preventDefault()
    if (!newUnit.name.trim() || !newUnit.abbreviation.trim()) return
    setAddingUnit(true)
    setUnitError('')
    try {
      const { data } = await api.post('/products/units/', {
        name: newUnit.name.trim(),
        abbreviation: newUnit.abbreviation.trim(),
      })
      setUnits((prev) => [data, ...prev])
      setNewUnit({ name: '', abbreviation: '' })
    } catch (err) {
      const d = err.response?.data
      setUnitError(d ? Object.values(d).flat().join(' ') : 'Erro ao criar unidade.')
    } finally {
      setAddingUnit(false)
    }
  }

  async function handleSaveUnit(e) {
    e.preventDefault()
    if (!editingUnit.name.trim() || !editingUnit.abbreviation.trim()) return
    setSavingUnit(true)
    setUnitError('')
    try {
      const { data } = await api.patch(`/products/units/${editingUnit.id}/`, {
        name: editingUnit.name.trim(),
        abbreviation: editingUnit.abbreviation.trim(),
      })
      setUnits((prev) => prev.map((u) => (u.id === data.id ? data : u)))
      setEditingUnit(null)
    } catch (err) {
      const d = err.response?.data
      setUnitError(d ? Object.values(d).flat().join(' ') : 'Erro ao salvar unidade.')
    } finally {
      setSavingUnit(false)
    }
  }

  async function handleDeleteUnit(id) {
    if (!window.confirm('Excluir esta unidade? Produtos vinculados a ela não poderão ser deletados.')) return
    setUnitError('')
    try {
      await api.delete(`/products/units/${id}/`)
      setUnits((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      setUnitError(err.response?.data?.detail ?? 'Erro ao excluir unidade.')
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Catálogo</h1>
        <div className={styles.actions}>
          <span className={styles.username}>Olá, {user?.username}</span>
          <Link className={styles.btnSecondary} to="/produtos">Produtos</Link>
          <Link className={styles.btnSecondary} to="/lotes">Lotes</Link>
          <button className={styles.btnLogout} onClick={logout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>

          {/* ── Categorias ── */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Categorias</h2>

            {catError && <p className={styles.error}>{catError}</p>}

            {catLoading ? (
              <p className={styles.info}>Carregando...</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 && (
                    <tr><td colSpan={2} className={styles.empty}>Nenhuma categoria cadastrada.</td></tr>
                  )}
                  {categories.map((c) => (
                    <tr key={c.id}>
                      {editingCat?.id === c.id ? (
                        <td colSpan={2}>
                          <form className={styles.inlineForm} onSubmit={handleSaveCategory}>
                            <input
                              className={styles.inlineInput}
                              value={editingCat.name}
                              onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                              autoFocus
                              required
                            />
                            <button className={styles.btnSave} type="submit" disabled={savingCat}>
                              {savingCat ? '...' : 'Salvar'}
                            </button>
                            <button className={styles.btnCancel} type="button" onClick={() => setEditingCat(null)}>
                              Cancelar
                            </button>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td>{c.name}</td>
                          <td className={styles.rowActions}>
                            <button className={styles.btnEdit} onClick={() => setEditingCat({ id: c.id, name: c.name })}>
                              Editar
                            </button>
                            <button className={styles.btnDelete} onClick={() => handleDeleteCategory(c.id)}>
                              Excluir
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <form className={styles.addForm} onSubmit={handleAddCategory}>
              <input
                className={styles.addInput}
                placeholder="Nome da categoria..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
              <button className={styles.btnAdd} type="submit" disabled={addingCat}>
                {addingCat ? '...' : '+ Adicionar'}
              </button>
            </form>
          </section>

          {/* ── Unidades ── */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Unidades de Medida</h2>

            {unitError && <p className={styles.error}>{unitError}</p>}

            {unitLoading ? (
              <p className={styles.info}>Carregando...</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Abreviação</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {units.length === 0 && (
                    <tr><td colSpan={3} className={styles.empty}>Nenhuma unidade cadastrada.</td></tr>
                  )}
                  {units.map((u) => (
                    <tr key={u.id}>
                      {editingUnit?.id === u.id ? (
                        <td colSpan={3}>
                          <form className={styles.inlineForm} onSubmit={handleSaveUnit}>
                            <input
                              className={styles.inlineInput}
                              placeholder="Nome"
                              value={editingUnit.name}
                              onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                              autoFocus
                              required
                            />
                            <input
                              className={styles.inlineInputShort}
                              placeholder="Abrev."
                              value={editingUnit.abbreviation}
                              onChange={(e) => setEditingUnit({ ...editingUnit, abbreviation: e.target.value })}
                              required
                            />
                            <button className={styles.btnSave} type="submit" disabled={savingUnit}>
                              {savingUnit ? '...' : 'Salvar'}
                            </button>
                            <button className={styles.btnCancel} type="button" onClick={() => setEditingUnit(null)}>
                              Cancelar
                            </button>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td>{u.name}</td>
                          <td><span className={styles.abbr}>{u.abbreviation}</span></td>
                          <td className={styles.rowActions}>
                            <button className={styles.btnEdit} onClick={() => setEditingUnit({ id: u.id, name: u.name, abbreviation: u.abbreviation })}>
                              Editar
                            </button>
                            <button className={styles.btnDelete} onClick={() => handleDeleteUnit(u.id)}>
                              Excluir
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <form className={styles.addForm} onSubmit={handleAddUnit}>
              <input
                className={styles.addInput}
                placeholder="Nome da unidade..."
                value={newUnit.name}
                onChange={(e) => setNewUnit((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <input
                className={styles.addInputShort}
                placeholder="Abrev."
                value={newUnit.abbreviation}
                onChange={(e) => setNewUnit((p) => ({ ...p, abbreviation: e.target.value }))}
                required
              />
              <button className={styles.btnAdd} type="submit" disabled={addingUnit}>
                {addingUnit ? '...' : '+ Adicionar'}
              </button>
            </form>
          </section>

        </div>
      </main>
    </div>
  )
}
