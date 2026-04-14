import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import QrCodeModal from '../components/QrCodeModal'
import styles from './Batches.module.css'

function expirationStatus(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(dateStr + 'T00:00:00')
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Vencido', type: 'expired' }
  if (diffDays <= 7) return { label: `Vence em ${diffDays}d`, type: 'warning' }
  return { label: 'Válido', type: 'ok' }
}

export default function Batches() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrBatch, setQrBatch] = useState(null)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  async function handleDelete(id) {
    if (!window.confirm('Excluir este lote? Esta ação não pode ser desfeita.')) return
    try {
      await api.delete(`/inventory/batches/${id}/`)
      setBatches((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erro ao excluir lote.')
    }
  }

  const filtered = batches.filter((b) => {
    const matchName   = (b.product_details?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat    = category ? String(b.product_details?.category) === String(category) : true
    const statusType  = expirationStatus(b.expiration_date).type
    const matchStatus = statusFilter ? statusType === statusFilter : true
    return matchName && matchCat && matchStatus
  })

  useEffect(() => {
    api.get('/inventory/batches/')
      .then(({ data }) => setBatches(data.results ?? data))
      .catch(() => setError('Erro ao carregar lotes.'))
      .finally(() => setLoading(false))
    api.get('/products/categories/')
      .then(({ data }) => setCategories(data.results ?? data))
  }, [])

  return (
    <div className={styles.page}>
      {qrBatch && <QrCodeModal batch={qrBatch} onClose={() => setQrBatch(null)} />}

      <div className={styles.toolbar}>
        <div>
          <h1 className={styles.pageTitle}>Lotes</h1>
          {!loading && (
            <p className={styles.pageDesc}>{batches.length} lote(s) cadastrado(s)</p>
          )}
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.btnSecondary} onClick={() => navigate('/scanner')}>
            Escanear QR
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/consumos/novo')}>
            + Registrar consumo
          </button>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <button className={styles.btnPrimary} onClick={() => navigate('/lotes/novo')}>
              + Novo lote
            </button>
          )}
        </div>
      </div>

      <div className={styles.filterBar}>
        <input
          className={styles.filterInput}
          type="search"
          placeholder="Buscar por produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterInput}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className={styles.filterInput}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="ok">Válido</option>
          <option value="warning">Próximo do vencimento</option>
          <option value="expired">Vencido</option>
        </select>
      </div>

      {loading && <p className={styles.info}>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className={styles.info}>
          {search ? 'Nenhum lote encontrado para essa busca.' : 'Nenhum lote cadastrado ainda.'}
        </p>
      )}

      {filtered.length > 0 && (
        <div className={styles.tableControls}>
          <span>{Math.min(rowsPerPage, filtered.length)} de {filtered.length} lote(s)</span>
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
      )}

      {filtered.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd.</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Cadastrado em</th>
                <th>QR</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, rowsPerPage).map((b) => {
                const status = expirationStatus(b.expiration_date)
                return (
                  <tr key={b.id} className={status.type === 'expired' ? styles.rowExpired : status.type === 'warning' ? styles.rowWarning : ''}>
                    <td className={styles.nameCell}>{b.product_details?.name ?? '—'}</td>
                    <td><strong>{b.quantity}</strong></td>
                    <td>{new Date(b.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[status.type]}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{new Date(b.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <button className={styles.btnQr} onClick={() => setQrBatch(b)} title="Exibir QR code">
                        QR
                      </button>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.btnConsume}
                          onClick={() => navigate(`/consumos/novo?batch=${b.id}`)}
                          disabled={status.type === 'expired' || b.quantity <= 0}
                          title={status.type === 'expired' ? 'Lote vencido' : b.quantity <= 0 ? 'Estoque zerado' : 'Registrar consumo'}
                        >
                          Consumir
                        </button>
                        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                          <button className={styles.btnDelete} onClick={() => handleDelete(b.id)}>
                            Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
