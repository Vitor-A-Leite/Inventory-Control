import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import styles from './Products.module.css'

export default function Products() {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filtered = products.filter((p) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat  = category ? String(p.category) === String(category) : true
    return matchName && matchCat
  })

  useEffect(() => {
    api.get('/products/')
      .then(({ data }) => setProducts(data.results ?? data))
      .catch(() => setError('Erro ao carregar produtos.'))
      .finally(() => setLoading(false))
    api.get('/products/categories/')
      .then(({ data }) => setCategories(data.results ?? data))
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Produtos</h1>
        <div className={styles.actions}>
          <span className={styles.username}>Olá, {user?.username}</span>
          <Link className={styles.btnSecondary} to="/scanner">
            Escanear QR
          </Link>
          <Link className={styles.btnSecondary} to="/lotes">
            Lotes
          </Link>
          <Link className={styles.btnSecondary} to="/historico">
            Histórico
          </Link>
          <Link className={styles.btnSecondary} to="/alertas">
            Alertas
          </Link>
          {user?.role === 'ADMIN' && (
            <Link className={styles.btnSecondary} to="/usuarios">
              Usuários
            </Link>
          )}
          <Link className={styles.btnPrimary} to="/produtos/novo">
            + Novo produto
          </Link>
          <button className={styles.btnLogout} onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.filterBar}>
          <input
            className={styles.filterInput}
            type="search"
            placeholder="Buscar por nome..."
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
        </div>

        {loading && <p className={styles.info}>Carregando...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className={styles.info}>
            {search ? 'Nenhum produto encontrado para essa busca.' : 'Nenhum produto cadastrado ainda.'}
          </p>
        )}

        {filtered.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Unidade</th>
                <th>Estoque mínimo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category_name ?? p.category}</td>
                  <td>{p.minimum_stock}</td>
                  <td>{p.unit_abbreviation ?? p.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
