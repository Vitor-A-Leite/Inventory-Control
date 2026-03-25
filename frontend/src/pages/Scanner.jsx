import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import QrScanner from '../components/QrScanner'
import api from '../api/axios'
import styles from './Scanner.module.css'

export default function Scanner() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('scanning') // scanning | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleScan(code) {
    setStatus('loading')
    try {
      const { data } = await api.get(`/inventory/batches/by-qr/?code=${encodeURIComponent(code)}`)
      navigate('/consumos/confirmar', { state: { batch: data } })
    } catch (err) {
      const detail = err.response?.data?.detail ?? 'QR code não reconhecido.'
      setErrorMsg(detail)
      setStatus('error')
    }
  }

  function handleCameraError(msg) {
    setErrorMsg(msg)
    setStatus('error')
  }

  function retry() {
    setStatus('scanning')
    setErrorMsg('')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/lotes">← Lotes</Link>
        <h1 className={styles.title}>Escanear QR Code</h1>
      </header>

      <main className={styles.main}>
        {status === 'scanning' && (
          <>
            <p className={styles.hint}>Aponte o QR code para a câmera aqui:</p>
            <QrScanner onScan={handleScan} onError={handleCameraError} />
            <button className={styles.btnCancel} onClick={() => navigate('/lotes')}>
              Cancelar
            </button>
          </>
        )}

        {status === 'loading' && (
          <div className={styles.feedback}>
            <div className={styles.spinner} />
            <p>Buscando lote...</p>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Não foi possível ler o QR code</p>
            <p className={styles.errorMsg}>{errorMsg}</p>
            <button className={styles.btnRetry} onClick={retry}>
              Tentar novamente
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
