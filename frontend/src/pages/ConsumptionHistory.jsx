import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import styles from './ConsumptionHistory.module.css'

const emptyFilters = { date_from: '', date_to: '', product: '', category: '' }

export default function ConsumptionHistory() {
  const { user, logout } = useAuth()

  const [categories, setCategories] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    api.get('/products/categories/').then(({ data }) => setCategories(data.results ?? data))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSearched(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      const { data } = await api.get('/consumption/consumptions/', { params })
      setRecords(data.results ?? data)
    } catch {
      setError('Erro ao buscar histórico.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setFilters(emptyFilters)
    setRecords([])
    setSearched(false)
    setError('')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Histórico de Consumos</h1>
        <div className={styles.actions}>
          <span className={styles.username}>Olá, {user?.username}</span>
          <Link className={styles.btnSecondary} to="/produtos">Produtos</Link>
          <Link className={styles.btnSecondary} to="/lotes">Lotes</Link>
          <button className={styles.btnLogout} onClick={logout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Painel de filtros */}
        <form className={styles.filterPanel} onSubmit={handleSearch}>
          <p className={styles.filterTitle}>Opções de Pesquisa</p>

          <div className={styles.filterGrid}>
            <label className={styles.filterLabel}>
              Produto
              <input
                className={styles.filterInput}
                type="search"
                name="product"
                value={filters.product}
                onChange={handleChange}
                placeholder="Nome do produto..."
              />
            </label>

            <label className={styles.filterLabel}>
              Categoria
              <select
                className={styles.filterInput}
                name="category"
                value={filters.category}
                onChange={handleChange}
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className={styles.filterLabel}>
              Data inicial
              <input
                className={styles.filterInput}
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleChange}
              />
            </label>

            <label className={styles.filterLabel}>
              Data final
              <input
                className={styles.filterInput}
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className={styles.filterActions}>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Pesquisando...' : 'Pesquisar'}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={handleClear}>
              Limpar
            </button>
          </div>
        </form>

        {/* Resultados */}
        {error && <p className={styles.error}>{error}</p>}

        {searched && !loading && records.length === 0 && !error && (
          <p className={styles.info}>Nenhum consumo encontrado para os filtros selecionados.</p>
        )}

        {records.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Qtd consumida</th>
                <th>Unidade</th>
                <th>Validade do lote</th>
                <th>Funcionário</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString('pt-BR')}</td>
                  <td>{r.product_name}</td>
                  <td>{r.category_name}</td>
                  <td>{r.quantity_used}</td>
                  <td>{r.unit_abbr}</td>
                  <td>{new Date(r.batch_expiration + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td>{r.employee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
