import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import styles from './ConsumptionConfirm.module.css'

export default function ConsumptionConfirm() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const batch = state?.batch

  const [quantity, setQuantity] = useState('')
  const [consumerId, setConsumerId] = useState('')
  const [employee, setEmployee] = useState(null)   // { username, first_name, ... }
  const [employeeError, setEmployeeError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function validateConsumerId(value) {
    setEmployee(null)
    setEmployeeError('')
    if (!value || isNaN(value)) return
    try {
      const { data } = await api.post('/users/validate-consumer-id/', { consumer_id: Number(value) })
      setEmployee(data)
    } catch {
      setEmployeeError('ID não encontrado.')
    }
  }

  // Sem dados de lote: veio direto pela URL sem passar pelo scanner
  if (!batch) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.back} to="/scanner">← Scanner</Link>
          <h1 className={styles.title}>Confirmar Consumo</h1>
        </header>
        <main className={styles.main}>
          <div className={styles.noData}>
            <p>Nenhum lote selecionado.</p>
            <Link className={styles.btnPrimary} to="/scanner">Escanear QR code</Link>
          </div>
        </main>
      </div>
    )
  }

  const expDate = new Date(batch.expiration_date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const qty = parseFloat(quantity)
    if (!consumerId || !employee) {
      setError('Informe um ID de funcionário válido.')
      return
    }
    if (!qty || qty <= 0) {
      setError('A quantidade deve ser maior que zero.')
      return
    }
    if (qty > batch.quantity) {
      setError(`Quantidade disponível no lote: ${batch.quantity}.`)
      return
    }

    setLoading(true)
    try {
      await api.post('/consumption/consumptions/', {
        batch: batch.id,
        quantity_used: qty,
        consumer_id: Number(consumerId),
      })
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : 'Erro ao registrar consumo.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.back} to="/scanner">← Scanner</Link>
          <h1 className={styles.title}>Confirmar Consumo</h1>
        </header>
        <main className={styles.main}>
          <div className={styles.successBox}>
            <span className={styles.successIcon}>✓</span>
            <p className={styles.successTitle}>Consumo registrado!</p>
            <p className={styles.successSub}>
              <strong>{batch.product_details?.name}</strong> — {quantity}{' '}
              {batch.product_details?.unit ?? ''}
            </p>
            <div className={styles.successActions}>
              <button
                className={styles.btnPrimary}
                onClick={() => navigate('/scanner')}
              >
                Escanear outro
              </button>
              <Link className={styles.btnSecondary} to="/lotes">
                Ver lotes
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/scanner">← Scanner</Link>
        <h1 className={styles.title}>Confirmar Consumo</h1>
      </header>

      <main className={styles.main}>
        {/* Cartão de informações do lote */}
        <div className={`${styles.batchCard} ${!batch.can_consume ? styles.batchCardBlocked : ''}`}>
          <p className={styles.productName}>{batch.product_details?.name}</p>

          <div className={styles.batchMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Disponível</span>
              <span className={styles.metaValue}>{batch.quantity}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Validade</span>
              <span className={styles.metaValue}>
                {expDate.toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <span className={`${styles.badge} ${
                batch.is_expired
                  ? styles.expired
                  : diffDays <= 7
                  ? styles.warning
                  : styles.ok
              }`}>
                {batch.is_expired
                  ? 'Vencido'
                  : diffDays <= 7
                  ? `Vence em ${diffDays}d`
                  : 'Válido'}
              </span>
            </div>
          </div>

          {!batch.can_consume && (
            <p className={styles.blockedMsg}>
              {batch.is_expired
                ? 'Este lote está vencido e não pode ter consumo registrado.'
                : 'Este lote não possui estoque disponível.'}
            </p>
          )}
        </div>

        {/* Formulário de confirmação */}
        {batch.can_consume && (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <p className={styles.error}>{error}</p>}

            <label className={styles.label}>
              ID do funcionário
              <input
                className={styles.input}
                type="number"
                value={consumerId}
                onChange={(e) => {
                  setConsumerId(e.target.value)
                  setEmployee(null)
                  setEmployeeError('')
                }}
                onBlur={(e) => validateConsumerId(e.target.value)}
                min="1"
                max="999"
                placeholder="Ex: 42"
                required
                autoFocus
              />
              {employee && (
                <span className={styles.employeeFound}>
                  ✓ {[employee.first_name, employee.last_name].filter(Boolean).join(' ') || employee.username}
                </span>
              )}
              {employeeError && (
                <span className={styles.employeeError}>{employeeError}</span>
              )}
            </label>

            <label className={styles.label}>
              Quantidade consumida
              <input
                className={styles.input}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0.01"
                max={batch.quantity}
                step="any"
                placeholder="0"
                required
              />
            </label>

            <div className={styles.footer}>
              <Link className={styles.btnCancel} to="/scanner">Cancelar</Link>
              <button className={styles.btnConfirm} type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Confirmar consumo'}
              </button>
            </div>
          </form>
        )}

        {!batch.can_consume && (
          <div className={styles.footer}>
            <Link className={styles.btnPrimary} to="/scanner">Escanear outro</Link>
          </div>
        )}
      </main>
    </div>
  )
}
