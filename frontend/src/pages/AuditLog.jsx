import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import styles from './AuditLog.module.css'

const MODEL_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'user', label: 'Usuário' },
  { value: 'product', label: 'Produto' },
  { value: 'category', label: 'Categoria' },
  { value: 'unit', label: 'Unidade' },
  { value: 'batch', label: 'Lote' },
  { value: 'consumption', label: 'Consumo' },
]

const ACTION_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: '0', label: 'Criação' },
  { value: '1', label: 'Edição' },
  { value: '2', label: 'Exclusão' },
]

const ACTION_STYLE = {
  'Criação': styles.tagCreate,
  'Edição': styles.tagUpdate,
  'Exclusão': styles.tagDelete,
}

const emptyFilters = { action: '', model: '', actor: '', date_from: '', date_to: '' }

function formatChanges(action, changes) {
  if (!changes || Object.keys(changes).length === 0) {
    if (action === 0) return 'Novo registro criado.'
    if (action === 2) return 'Registro excluído.'
    return '—'
  }
  return Object.entries(changes)
    .map(([field, [prev, next]]) => `${field}: "${prev ?? ''}" → "${next ?? ''}"`)
    .join(' | ')
}

export default function AuditLog() {
  const { user, logout } = useAuth()
  const [filters, setFilters] = useState(emptyFilters)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  function handleChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      const { data } = await api.get('/core/audit/', { params })
      setRecords(data.results ?? data)
      setSearched(true)
      setRowsPerPage(25)
    } catch {
      setError('Erro ao carregar auditoria.')
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
        <h1 className={styles.title}>Auditoria</h1>
        <div className={styles.actions}>
          <span className={styles.username}>Olá, {user?.username}</span>
          <Link className={styles.btnSecondary} to="/produtos">Produtos</Link>
          <Link className={styles.btnSecondary} to="/historico">Histórico</Link>
          <button className={styles.btnLogout} onClick={logout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.filterCard}>
          <p className={styles.filterTitle}>FILTROS</p>
          <form className={styles.filterGrid} onSubmit={handleSearch}>
            <label className={styles.filterLabel}>
              Ação
              <select className={styles.filterInput} name="action" value={filters.action} onChange={handleChange}>
                {ACTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className={styles.filterLabel}>
              Modelo
              <select className={styles.filterInput} name="model" value={filters.model} onChange={handleChange}>
                {MODEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className={styles.filterLabel}>
              Usuário
              <input className={styles.filterInput} name="actor" value={filters.actor} onChange={handleChange} placeholder="Nome do usuário..." />
            </label>
            <label className={styles.filterLabel}>
              Data inicial
              <input className={styles.filterInput} type="date" name="date_from" value={filters.date_from} onChange={handleChange} />
            </label>
            <label className={styles.filterLabel}>
              Data final
              <input className={styles.filterInput} type="date" name="date_to" value={filters.date_to} onChange={handleChange} />
            </label>
            <div className={styles.filterActions}>
              <button className={styles.btnSearch} type="submit" disabled={loading}>
                {loading ? 'Buscando...' : 'Pesquisar'}
              </button>
              <button className={styles.btnClear} type="button" onClick={handleClear}>Limpar</button>
            </div>
          </form>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        {searched && !loading && (
          <>
            <div className={styles.tableControls}>
              <span>{Math.min(rowsPerPage, records.length)} de {records.length} registro(s)</span>
              <label>
                Linhas por página:
                <select className={styles.rowsSelect} value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
            </div>

            {records.length === 0 ? (
              <p className={styles.empty}>Nenhum registro encontrado para os filtros aplicados.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Usuário</th>
                      <th>Modelo</th>
                      <th>Objeto</th>
                      <th>Ação</th>
                      <th>Mudanças</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, rowsPerPage).map((r) => (
                      <tr key={r.id}>
                        <td className={styles.nowrap}>{new Date(r.timestamp).toLocaleString('pt-BR')}</td>
                        <td>{r.actor}</td>
                        <td>{r.model}</td>
                        <td className={styles.objectRepr}>{r.object_repr}</td>
                        <td>
                          <span className={`${styles.tag} ${ACTION_STYLE[r.action_label] ?? ''}`}>
                            {r.action_label}
                          </span>
                        </td>
                        <td className={styles.changes}>{formatChanges(r.action, r.changes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
