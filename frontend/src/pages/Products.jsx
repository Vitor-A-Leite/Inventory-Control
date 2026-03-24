import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import styles from './Products.module.css'

export default function Products() {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/products/')
      .then(({ data }) => setProducts(data.results ?? data))
      .catch(() => setError('Erro ao carregar produtos.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Produtos</h1>
        <div className={styles.actions}>
          <span className={styles.username}>Olá, {user?.username}</span>
          <Link className={styles.btnSecondary} to="/lotes">
            Lotes
          </Link>
          <Link className={styles.btnPrimary} to="/produtos/novo">
            + Novo produto
          </Link>
          <button className={styles.btnLogout} onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {loading && <p className={styles.info}>Carregando...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className={styles.info}>Nenhum produto cadastrado ainda.</p>
        )}

        {products.length > 0 && (
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
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category_name ?? p.category}</td>
                  <td>{p.unit_abbreviation ?? p.unit}</td>
                  <td>{p.minimum_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
