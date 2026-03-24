import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import styles from './ProductForm.module.css'

const EMPTY = { name: '', category: '', unit: '', minimum_stock: '' }

export default function ProductForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/products/categories/'),
      api.get('/products/units/'),
    ]).then(([catRes, unitRes]) => {
      setCategories(catRes.data.results ?? catRes.data)
      setUnits(unitRes.data.results ?? unitRes.data)
    }).catch(() => setError('Erro ao carregar categorias ou unidades.'))
  }, [])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/products/', {
        name: form.name,
        category: Number(form.category),
        unit: Number(form.unit),
        minimum_stock: Number(form.minimum_stock),
      })
      navigate('/produtos')
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : 'Erro ao cadastrar produto.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/produtos">← Voltar</Link>
        <h1 className={styles.title}>Novo Produto</h1>
      </header>

      <main className={styles.main}>
        <form className={styles.card} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          <label className={styles.label}>
            Nome
            <input
              className={styles.input}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            Categoria
            <select
              className={styles.input}
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Unidade
            <select
              className={styles.input}
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Estoque mínimo
            <input
              className={styles.input}
              type="number"
              name="minimum_stock"
              value={form.minimum_stock}
              onChange={handleChange}
              min="0"
              step="any"
              required
            />
          </label>

          <div className={styles.footer}>
            <Link className={styles.btnCancel} to="/produtos">Cancelar</Link>
            <button className={styles.btnSave} type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar produto'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
