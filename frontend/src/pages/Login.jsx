import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/produtos')
    } catch (err) {
      const detail = err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.brand}>
        <div className={styles.brandContent}>
          <div className={styles.brandIcon}>
            <IconBox />
          </div>
          <h1 className={styles.brandTitle}>Controle de Estoque</h1>
          <p className={styles.brandSubtitle}>
            Gerencie produtos, lotes e consumos<br />com eficiência e rastreabilidade.
          </p>
          <div className={styles.brandFeatures}>
            <span className={styles.brandFeature}>Controle de validade e alertas</span>
            <span className={styles.brandFeature}>Scanner QR para consumos rápidos</span>
            <span className={styles.brandFeature}>Histórico e auditoria completos</span>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <h2 className={styles.formTitle}>Bem-vindo de volta</h2>
          <p className={styles.formSubtitle}>Faça login para acessar o painel</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <p className={styles.error}>{error}</p>}

            <label className={styles.label}>
              Usuário
              <input
                className={styles.input}
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                placeholder="Digite seu usuário"
                required
              />
            </label>

            <label className={styles.label}>
              Senha
              <input
                className={styles.input}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                required
              />
            </label>

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
