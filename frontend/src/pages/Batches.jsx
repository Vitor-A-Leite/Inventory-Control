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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrBatch, setQrBatch] = useState(null)

  const filtered = batches.filter((b) =>
    (b.product_details?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    api.get('/inventory/batches/')
      .then(({ data }) => setBatches(data.results ?? data))
      .catch(() => setError('Erro ao carregar lotes.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      {qrBatch && <QrCodeModal batch={qrBatch} onClose={() => setQrBatch(null)} />}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link className={styles.back} to="/produtos">← Produtos</Link>
          <h1 className={styles.title}>Lotes</h1>
        </div>
        <div className={styles.actions}>
          <span className={styles.username}>Olá, {user?.username}</span>
          <button
            className={styles.btnScanner}
            onClick={() => navigate('/scanner')}
          >
            Escanear QR
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate('/consumos/novo')}
          >
            + Registrar consumo
          </button>
          <button className={styles.btnLogout} onClick={logout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        <input
          className={styles.search}
          type="search"
          placeholder="Buscar por produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && <p className={styles.info}>Carregando...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className={styles.info}>
            {search ? 'Nenhum lote encontrado para essa busca.' : 'Nenhum lote cadastrado ainda.'}
          </p>
        )}

        {filtered.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Cadastrado em</th>
                <th>Atualizado em</th>
                <th>QR</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const status = expirationStatus(b.expiration_date)
                return (
                  <tr key={b.id}>
                    <td>{b.product_details?.name ?? '—'}</td>
                    <td>{b.quantity}</td>
                    <td>{new Date(b.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[status.type]}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>{new Date(b.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>{new Date(b.updated_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <button
                        className={styles.btnQr}
                        onClick={() => setQrBatch(b)}
                        title="Exibir QR code"
                      >
                        QR
                      </button>
                    </td>
                    <td>
                      <button
                        className={styles.btnConsume}
                        onClick={() => navigate(`/consumos/novo?batch=${b.id}`)}
                        disabled={status.type === 'expired' || b.quantity <= 0}
                        title={
                          status.type === 'expired'
                            ? 'Lote vencido'
                            : b.quantity <= 0
                            ? 'Estoque zerado'
                            : 'Registrar consumo deste lote'
                        }
                      >
                        Registrar consumo
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
