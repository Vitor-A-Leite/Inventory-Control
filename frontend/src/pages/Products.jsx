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
  const [rowsPerPage, setRowsPerPage] = useState(25)

  async function handleDelete(id) {
    if (!window.confirm('Deseja realmente excluir este produto?')) return
    try {
      await api.delete(`/products/${id}/`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erro ao excluir produto.')
    }
  }

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
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <Link className={styles.btnSecondary} to="/catalogo">
              Catálogo
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link className={styles.btnSecondary} to="/usuarios">
              Usuários
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link className={styles.btnSecondary} to="/auditoria">
              Auditoria
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
          <div className={styles.tableControls}>
            <span>{Math.min(rowsPerPage, filtered.length)} de {filtered.length} produto(s)</span>
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
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Unidade</th>
                <th>Estoque mínimo</th>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, rowsPerPage).map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category_name ?? p.category}</td>
                  <td>{p.unit_abbreviation ?? p.unit}</td>
                  <td>{p.minimum_stock}</td>
                  {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <td>
                      <Link className={styles.btnEdit} to={`/produtos/${p.id}/editar`}>Editar</Link>
                      <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
