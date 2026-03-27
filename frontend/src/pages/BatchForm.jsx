import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import styles from './BatchForm.module.css'

export default function BatchForm() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [form, setForm] = useState({ product: '', quantity: '', expiration_date: '' })

  const selectedProduct = products.find((p) => String(p.id) === String(form.product))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.get('/products/')
      .then(({ data }) => setProducts(data.results ?? data))
      .finally(() => setLoadingProducts(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/inventory/batches/', {
        product: form.product,
        quantity: parseFloat(form.quantity),
        expiration_date: form.expiration_date,
      })
      setSuccess('Lote cadastrado com sucesso!')
      setTimeout(() => navigate('/lotes'), 1500)
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.entries(data).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('\n')
        : 'Erro ao cadastrar lote.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/lotes">← Lotes</Link>
        <h1 className={styles.title}>Novo Lote</h1>
      </header>

      <main className={styles.main}>
        <form className={styles.card} onSubmit={handleSubmit}>
          {error && <pre className={styles.error}>{error}</pre>}
          {success && <p className={styles.success}>{success}</p>}

          <label className={styles.label}>
            Produto
            {loadingProducts ? (
              <span className={styles.loading}>Carregando produtos...</span>
            ) : (
              <select
                className={styles.input}
                name="product"
                value={form.product}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um produto...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </label>

          <label className={styles.label}>
            Quantidade{selectedProduct?.unit_abbreviation && (
              <span className={styles.unit}>({selectedProduct.unit_abbreviation})</span>
            )}
            <input
              className={styles.input}
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="0.01"
              step="any"
              placeholder="Ex: 100"
              required
            />
          </label>

          <label className={styles.label}>
            Data de validade
            <input
              className={styles.input}
              type="date"
              name="expiration_date"
              value={form.expiration_date}
              onChange={handleChange}
              min={today}
              required
            />
          </label>

          <div className={styles.footer}>
            <Link className={styles.btnCancel} to="/lotes">Cancelar</Link>
            <button className={styles.btnSave} type="submit" disabled={saving || loadingProducts}>
              {saving ? 'Cadastrando...' : 'Cadastrar lote'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
