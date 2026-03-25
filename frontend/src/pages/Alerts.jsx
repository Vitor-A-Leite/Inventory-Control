import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import styles from './Alerts.module.css'

export default function Alerts() {
  const { user, logout } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [daysInput, setDaysInput] = useState('')
  const [configSaving, setConfigSaving] = useState(false)
  const [configMsg, setConfigMsg] = useState('')

  const canEditConfig = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  function fetchAlerts() {
    setLoading(true)
    api.get('/alerts/')
      .then(({ data: d }) => {
        setData(d)
        setDaysInput(String(d.config.days_before_expiration))
      })
      .catch(() => setError('Erro ao carregar alertas.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAlerts() }, [])

  async function handleSaveConfig(e) {
    e.preventDefault()
    setConfigMsg('')
    setConfigSaving(true)
    try {
      await api.patch('/alerts/config/', { days_before_expiration: Number(daysInput) })
      setConfigMsg('Salvo!')
      fetchAlerts()
    } catch {
      setConfigMsg('Erro ao salvar.')
    } finally {
      setConfigSaving(false)
    }
  }

  const totalAlerts = data ? data.expired.length + data.expiring_soon.length : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Alertas de Vencimento
          {data && totalAlerts > 0 && (
            <span className={styles.badge}>{totalAlerts}</span>
          )}
        </h1>
        <div className={styles.actions}>
          <span className={styles.username}>Olá, {user?.username}</span>
          <Link className={styles.btnSecondary} to="/produtos">Produtos</Link>
          <Link className={styles.btnSecondary} to="/lotes">Lotes</Link>
          <button className={styles.btnLogout} onClick={logout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Painel de configuração */}
        <div className={styles.configPanel}>
          <p className={styles.configLabel}>
            Notificar lotes que vencem em até
            {canEditConfig ? (
              <form className={styles.configForm} onSubmit={handleSaveConfig}>
                <input
                  className={styles.configInput}
                  type="number"
                  min="1"
                  max="365"
                  value={daysInput}
                  onChange={(e) => { setDaysInput(e.target.value); setConfigMsg('') }}
                  required
                />
                <span className={styles.configUnit}>dias</span>
                <button className={styles.btnSaveConfig} type="submit" disabled={configSaving}>
                  {configSaving ? '...' : 'Salvar'}
                </button>
                {configMsg && (
                  <span className={configMsg === 'Salvo!' ? styles.configOk : styles.configErr}>
                    {configMsg}
                  </span>
                )}
              </form>
            ) : (
              <strong> {data?.config.days_before_expiration} dias</strong>
            )}
          </p>
        </div>

        {loading && <p className={styles.info}>Carregando...</p>}
        {error  && <p className={styles.errorMsg}>{error}</p>}

        {data && !loading && (
          <>
            {totalAlerts === 0 && (
              <div className={styles.allGood}>
                <span className={styles.allGoodIcon}>✓</span>
                <p>Nenhum lote com alerta de vencimento.</p>
              </div>
            )}

            {/* Vencidos */}
            {data.expired.length > 0 && (
              <section className={styles.section}>
                <h2 className={`${styles.sectionTitle} ${styles.expired}`}>
                  Vencidos — {data.expired.length} lote{data.expired.length > 1 ? 's' : ''}
                </h2>
                <BatchTable rows={data.expired} variant="expired" />
              </section>
            )}

            {/* Vencendo em breve */}
            {data.expiring_soon.length > 0 && (
              <section className={styles.section}>
                <h2 className={`${styles.sectionTitle} ${styles.warning}`}>
                  Vencendo em breve — {data.expiring_soon.length} lote{data.expiring_soon.length > 1 ? 's' : ''}
                </h2>
                <BatchTable rows={data.expiring_soon} variant="warning" />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function BatchTable({ rows, variant }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Qtd disponível</th>
          <th>Unidade</th>
          <th>Validade</th>
          <th>Situação</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className={styles[`row_${variant}`]}>
            <td>{r.product_name}</td>
            <td>{r.category_name}</td>
            <td>{r.quantity}</td>
            <td>{r.unit_abbr}</td>
            <td>{new Date(r.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
            <td>
              {variant === 'expired' ? (
                <span className={styles.tagExpired}>Vencido</span>
              ) : (
                <span className={styles.tagWarning}>
                  {r.days_remaining === 0 ? 'Vence hoje' : `Vence em ${r.days_remaining}d`}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
