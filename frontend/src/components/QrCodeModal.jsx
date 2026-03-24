import { useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './QrCodeModal.module.css'

export default function QrCodeModal({ batch, onClose }) {
  const overlayRef = useRef(null)

  // Fechar com Esc
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose} aria-label="Fechar">✕</button>

        <div className={styles.printArea} id="qr-print-area">
          <p className={styles.productName}>{batch.product_details?.name}</p>
          <QRCodeSVG
            value={batch.qr_code}
            size={220}
            level="M"
            includeMargin
          />
          <p className={styles.qrValue}>{batch.qr_code}</p>
          <p className={styles.expiration}>
            Val: {new Date(batch.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')}
          </p>
        </div>

        <button className={styles.btnPrint} onClick={handlePrint}>
          Imprimir QR code
        </button>
      </div>
    </div>
  )
}
