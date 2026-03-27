import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import styles from './ProductForm.module.css'

const EMPTY = { name: '', category: '', unit: '', minimum_stock: '' }

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingForm, setLoadingForm] = useState(isEdit)

  useEffect(() => {
    const requests = [
      api.get('/products/categories/'),
      api.get('/products/units/'),
      ...(isEdit ? [api.get(`/products/${id}/`)] : []),
    ]
    Promise.all(requests)
      .then(([catRes, unitRes, productRes]) => {
        setCategories(catRes.data.results ?? catRes.data)
        setUnits(unitRes.data.results ?? unitRes.data)
        if (productRes) {
          const p = productRes.data
          setForm({
            name: p.name,
            category: String(p.category),
            unit: String(p.unit),
            minimum_stock: String(p.minimum_stock),
          })
        }
      })
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoadingForm(false))
  }, [id, isEdit])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        category: Number(form.category),
        unit: Number(form.unit),
        minimum_stock: Number(form.minimum_stock),
      }
      if (isEdit) {
        await api.patch(`/products/${id}/`, payload)
      } else {
        await api.post('/products/', payload)
      }
      setSuccess(isEdit ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!')
      setTimeout(() => navigate('/produtos'), 1500)
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : isEdit ? 'Erro ao atualizar produto.' : 'Erro ao cadastrar produto.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (loadingForm) return <div className={styles.page}><p style={{ padding: '2rem' }}>Carregando...</p></div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/produtos">← Voltar</Link>
        <h1 className={styles.title}>{isEdit ? 'Editar Produto' : 'Novo Produto'}</h1>
      </header>

      <main className={styles.main}>
        <form className={styles.card} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

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
              {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Salvar produto'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
