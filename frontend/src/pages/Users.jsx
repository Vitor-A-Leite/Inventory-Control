import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import styles from './Users.module.css'

const ROLE_LABELS = { ADMIN: 'Administrador', MANAGER: 'Gerente', EMPLOYEE: 'Funcionário' }

const emptyForm = { username: '', first_name: '', last_name: '', password: '', role: 'EMPLOYEE', consumer_id: '' }

export default function Users() {
  const { user, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null) // user object being edited
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState({})
  const [formError, setFormError] = useState('')
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)

  function fetchUsers() {
    setLoading(true)
    api.get('/users/')
      .then(({ data }) => setUsers(data))
      .catch(() => setError('Erro ao carregar usuários.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value !== 'EMPLOYEE' ? { consumer_id: '' } : {}),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const payload = { ...form }
      if (payload.role !== 'EMPLOYEE') delete payload.consumer_id
      else payload.consumer_id = Number(payload.consumer_id)

      await api.post('/users/', payload)
      setForm(emptyForm)
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.entries(data).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('\n') : 'Erro ao criar usuário.'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  function openEdit(u) {
    setEditingUser(u)
    setEditForm({
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      consumer_id: u.consumer_id ?? '',
      password: '',
    })
    setEditError('')
  }

  function handleEditChange(e) {
    const { name, value } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value !== 'EMPLOYEE' ? { consumer_id: '' } : {}),
    }))
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    setEditError('')
    setSaving(true)
    try {
      const payload = { ...editForm }
      if (!payload.password) delete payload.password
      if (payload.role !== 'EMPLOYEE') {
        payload.consumer_id = null
      } else {
        payload.consumer_id = Number(payload.consumer_id)
      }
      const { data } = await api.patch(`/users/${editingUser.id}/`, payload)
      setUsers((prev) => prev.map((x) => (x.id === data.id ? data : x)))
      setEditingUser(null)
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.entries(data).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('\n') : 'Erro ao salvar.'
      setEditError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(u) {
    try {
      const { data } = await api.patch(`/users/${u.id}/`, { is_active: !u.is_active })
      setUsers((prev) => prev.map((x) => (x.id === data.id ? data : x)))
    } catch {
      alert('Erro ao alterar status do usuário.')
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Excluir o usuário "${u.username}"? Esta ação não pode ser desfeita.`)) return
    try {
      await api.delete(`/users/${u.id}/`)
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
    } catch {
      alert('Erro ao excluir usuário.')
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Usuários</h1>
        <div className={styles.actions}>
          <span className={styles.username}>Olá, {user?.username}</span>
          <Link className={styles.btnSecondary} to="/produtos">Produtos</Link>
          <Link className={styles.btnSecondary} to="/lotes">Lotes</Link>
          <button className={styles.btnPrimary} onClick={() => { setShowForm(true); setFormError('') }}>
            + Novo usuário
          </button>
          <button className={styles.btnLogout} onClick={logout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        {loading && <p className={styles.info}>Carregando...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {showForm && (
          <form className={styles.card} onSubmit={handleSubmit}>
            <h2 className={styles.cardTitle}>Novo usuário</h2>
            {formError && <pre className={styles.error}>{formError}</pre>}

            <div className={styles.grid}>
              <label className={styles.label}>
                Username
                <input className={styles.input} name="username" value={form.username} onChange={handleChange} required />
              </label>
              <label className={styles.label}>
                Senha
                <input className={styles.input} name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
              </label>
              <label className={styles.label}>
                Nome
                <input className={styles.input} name="first_name" value={form.first_name} onChange={handleChange} />
              </label>
              <label className={styles.label}>
                Sobrenome
                <input className={styles.input} name="last_name" value={form.last_name} onChange={handleChange} />
              </label>
              <label className={styles.label}>
                Perfil
                <select className={styles.input} name="role" value={form.role} onChange={handleChange}>
                  <option value="EMPLOYEE">Funcionário</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
              {form.role === 'EMPLOYEE' && (
                <label className={styles.label}>
                  Consumer ID <span className={styles.hint}>(1–999, número do crachá)</span>
                  <input className={styles.input} name="consumer_id" type="number" min="1" max="999" value={form.consumer_id} onChange={handleChange} required />
                </label>
              )}
            </div>

            <div className={styles.formFooter}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? 'Salvando...' : 'Criar usuário'}
              </button>
            </div>
          </form>
        )}

        {editingUser && (
          <form className={styles.card} onSubmit={handleEditSubmit}>
            <h2 className={styles.cardTitle}>Editar — <span className={styles.editUsername}>{editingUser.username}</span></h2>
            {editError && <pre className={styles.error}>{editError}</pre>}

            <div className={styles.grid}>
              <label className={styles.label}>
                Nome
                <input className={styles.input} name="first_name" value={editForm.first_name} onChange={handleEditChange} />
              </label>
              <label className={styles.label}>
                Sobrenome
                <input className={styles.input} name="last_name" value={editForm.last_name} onChange={handleEditChange} />
              </label>
              <label className={styles.label}>
                Perfil
                <select className={styles.input} name="role" value={editForm.role} onChange={handleEditChange}>
                  <option value="EMPLOYEE">Funcionário</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
              {editForm.role === 'EMPLOYEE' && (
                <label className={styles.label}>
                  Consumer ID <span className={styles.hint}>(1–999)</span>
                  <input className={styles.input} name="consumer_id" type="number" min="1" max="999" value={editForm.consumer_id} onChange={handleEditChange} required />
                </label>
              )}
              {editingUser?.role !== 'ADMIN' && (
                <label className={styles.label}>
                  Nova senha <span className={styles.hint}>(deixe em branco para não alterar)</span>
                  <input
                    className={styles.input}
                    name="password"
                    type="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    minLength={6}
                    placeholder="••••••••"
                  />
                </label>
              )}
            </div>

            <div className={styles.formFooter}>
              <button type="button" className={styles.btnSecondary} onClick={() => setEditingUser(null)}>Cancelar</button>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}

        {!loading && !error && users.length === 0 && (
          <p className={styles.info}>Nenhum usuário cadastrado.</p>
        )}

        {users.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Nome</th>
                <th>Perfil</th>
                <th>Consumer ID</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={!u.is_active ? styles.inactive : ''}>
                  <td>{u.username}</td>
                  <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`role${u.role}`]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td>{u.consumer_id ?? '—'}</td>
                  <td>
                    <span className={u.is_active ? styles.active : styles.inactive_badge}>
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className={styles.rowActions}>
                    {u.id !== user?.id && (
                      <>
                        <button className={styles.btnEdit} onClick={() => openEdit(u)}>
                          Editar
                        </button>
                        <button className={styles.btnToggle} onClick={() => handleToggleActive(u)}>
                          {u.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(u)}>
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
