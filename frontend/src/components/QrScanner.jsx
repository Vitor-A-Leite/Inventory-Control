import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const QR_ELEMENT_ID = 'qr-reader'

export default function QrScanner({ onScan, onError }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(QR_ELEMENT_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {})
          onScan(decodedText)
        },
        () => {} // erros de frame são ignorados
      )
      .catch((err) => {
        onError?.(err?.message ?? 'Não foi possível acessar a câmera.')
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div id={QR_ELEMENT_ID} style={{ width: '100%' }} />
}
