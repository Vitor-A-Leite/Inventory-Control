import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import styles from './ConsumptionForm.module.css'

export default function ConsumptionForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedBatch = searchParams.get('batch')

  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(preselectedBatch ?? '')
  const [search, setSearch] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingBatches, setLoadingBatches] = useState(true)

  useEffect(() => {
    api.get('/inventory/batches/')
      .then(({ data }) => {
        const all = data.results ?? data
        // exibe apenas lotes com estoque e não vencidos
        const available = all.filter((b) => {
          const exp = new Date(b.expiration_date + 'T00:00:00')
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return b.quantity > 0 && exp >= today
        })
        setBatches(available)
      })
      .catch(() => setError('Erro ao carregar lotes.'))
      .finally(() => setLoadingBatches(false))
  }, [])

  const activeBatch = batches.find((b) => b.id === selectedBatch)

  const filteredBatches = search.trim()
    ? batches.filter((b) =>
        b.product_details?.name?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : batches

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const qty = parseFloat(quantity)
    if (!selectedBatch) {
      setError('Selecione um lote.')
      return
    }
    if (!qty || qty <= 0) {
      setError('A quantidade deve ser maior que zero.')
      return
    }
    if (activeBatch && qty > activeBatch.quantity) {
      setError(`Quantidade disponível no lote: ${activeBatch.quantity}.`)
      return
    }

    setLoading(true)
    try {
      await api.post('/consumption/consumptions/', {
        batch: selectedBatch,
        quantity_used: qty,
      })
      navigate('/lotes')
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/lotes">← Lotes</Link>
        <h1 className={styles.title}>Registrar Consumo Manual</h1>
      </header>

      <main className={styles.main}>
        <p className={styles.hint}>
          Use este formulário para registrar um consumo que ocorreu anteriormente
          e ainda não foi registrado no sistema.
        </p>

        <form className={styles.card} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          <label className={styles.label}>
            Lote
            {loadingBatches ? (
              <span className={styles.loading}>Carregando lotes...</span>
            ) : (
              <>
                <input
                  className={styles.input}
                  type="search"
                  placeholder="Pesquisar por produto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className={styles.input}
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  required
                  size={filteredBatches.length > 0 ? Math.min(filteredBatches.length + 1, 6) : 2}
                >
                  <option value="">Selecione um lote...</option>
                  {filteredBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.product_details?.name} — Qtd: {b.quantity} — Val:{' '}
                      {new Date(b.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </option>
                  ))}
                </select>
                {search.trim() && filteredBatches.length === 0 && (
                  <span className={styles.noResults}>Nenhum lote encontrado.</span>
                )}
              </>
            )}
          </label>

          {activeBatch && (
            <div className={styles.batchInfo}>
              <span>Disponível: <strong>{activeBatch.quantity}</strong></span>
              <span>
                Validade:{' '}
                <strong>
                  {new Date(activeBatch.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                </strong>
              </span>
            </div>
          )}

          <label className={styles.label}>
            Quantidade consumida
            <input
              className={styles.input}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.01"
              step="any"
              placeholder="0"
              required
            />
          </label>

          <div className={styles.footer}>
            <Link className={styles.btnCancel} to="/lotes">Cancelar</Link>
            <button className={styles.btnSave} type="submit" disabled={loading || loadingBatches}>
              {loading ? 'Registrando...' : 'Confirmar consumo'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
