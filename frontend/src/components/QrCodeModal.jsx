import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './QrCodeModal.module.css'

const LABEL_SIZES = [
  { id: '50x50', label: '50 × 50 mm' },
  { id: '40x25', label: '40 × 25 mm' },
]

function buildLabel50x50(svgContent, productName, quantity, expDate, qrCode) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Etiqueta QR</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: 50mm 50mm; margin: 0; }
    body { font-family: Arial, sans-serif; width: 50mm; height: 50mm; background: #fff; overflow: hidden; }
    .label { width: 50mm; height: 50mm; display: flex; flex-direction: column; padding: 1.5mm; }
    table { width: 100%; border-collapse: collapse; font-size: 6pt; }
    td { padding: 1mm 1.5mm; border-bottom: 0.3mm solid #000; }
    td:first-child { font-weight: bold; white-space: nowrap; width: 30%; }
    td:last-child { text-align: right; }
    .qr-wrap { flex: 1; display: flex; justify-content: center; align-items: center; padding: 1mm 0 0.5mm; }
    .qr-wrap svg { width: 30mm; height: 30mm; display: block; }
    .uuid { text-align: center; font-size: 4.5pt; font-family: monospace; color: #000; }
  </style>
</head>
<body>
  <div class="label">
    <table>
      <tr><td>Produto:</td><td>${productName}</td></tr>
      <tr><td>Quantidade:</td><td>${quantity}</td></tr>
      <tr><td>Validade:</td><td>${expDate}</td></tr>
    </table>
    <div class="qr-wrap">${svgContent}</div>
    <div class="uuid">${qrCode}</div>
  </div>
  <script>window.onload = function() { window.print(); window.close(); }</script>
</body>
</html>`
}

function buildLabel40x25(svgContent, productName, quantity, expDate, qrCode) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Etiqueta QR</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: 40mm 25mm; margin: 0; }
    body { font-family: Arial, sans-serif; width: 40mm; height: 25mm; background: #fff; overflow: hidden; }
    .label { width: 40mm; height: 25mm; display: flex; flex-direction: row; align-items: stretch; padding: 1mm; gap: 1.5mm; }
    .qr-wrap { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .qr-wrap svg { width: 20mm; height: 20mm; display: block; }
    .right { flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 5pt; }
    td { padding: 0.6mm 0; }
    td:first-child { font-weight: bold; white-space: nowrap; }
    .uuid { font-size: 3.8pt; font-family: monospace; color: #000; word-break: break-all; line-height: 1.2; }
  </style>
</head>
<body>
  <div class="label">
    <div class="qr-wrap">${svgContent}</div>
    <div class="right">
      <table>
        <tr><td>Produto:</td></tr>
        <tr><td style="font-weight:normal">${productName}</td></tr>
        <tr><td>Qtd: <span style="font-weight:normal">${quantity}</span></td></tr>
        <tr><td>Val: <span style="font-weight:normal">${expDate}</span></td></tr>
      </table>
      <div class="uuid">${qrCode}</div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); window.close(); }</script>
</body>
</html>`
}

export default function QrCodeModal({ batch, onClose }) {
  const overlayRef = useRef(null)
  const [selectedSize, setSelectedSize] = useState('50x50')

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
    const expDate = new Date(batch.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')
    const unitAbbr = batch.product_details?.unit_abbreviation ?? ''
    const quantity = `${batch.quantity}${unitAbbr}`
    const productName = batch.product_details?.name ?? '—'

    const svgEl = document.querySelector('#qr-print-svg svg')
    const svgContent = svgEl ? svgEl.outerHTML : ''

    const html = selectedSize === '50x50'
      ? buildLabel50x50(svgContent, productName, quantity, expDate, batch.qr_code)
      : buildLabel40x25(svgContent, productName, quantity, expDate, batch.qr_code)

    const printWindow = window.open('', '_blank', 'width=300,height=300')
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose} aria-label="Fechar">✕</button>

        <div className={styles.printArea} id="qr-print-svg">
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

        <div className={styles.sizeSelector}>
          {LABEL_SIZES.map((s) => (
            <button
              key={s.id}
              className={`${styles.sizeBtn} ${selectedSize === s.id ? styles.sizeBtnActive : ''}`}
              onClick={() => setSelectedSize(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button className={styles.btnPrint} onClick={handlePrint}>
          Imprimir QR code
        </button>
      </div>
    </div>
  )
}
