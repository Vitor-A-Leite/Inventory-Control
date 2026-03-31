import { useEffect, useRef } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import styles from './BarcodeScanModal.module.css'

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
]

export default function BarcodeScanModal({ onScan, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const firedRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('barcode-hidden-decoder', { formatsToSupport: BARCODE_FORMATS })

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }

        intervalRef.current = setInterval(() => {
          const video = videoRef.current
          const canvas = canvasRef.current
          if (!video || !canvas || video.readyState < 2) return

          const ctx = canvas.getContext('2d')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)

          canvas.toBlob((blob) => {
            if (!blob || firedRef.current) return
            const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' })
            scanner
              .scanFile(file, false)
              .then((text) => {
                if (firedRef.current) return
                firedRef.current = true
                onScan(text)
              })
              .catch(() => {})
          }, 'image/jpeg')
        }, 300)
      })
      .catch(onClose)

    return () => {
      clearInterval(intervalRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <p className={styles.hint}>Aponte a câmera para o código de barras</p>
        <div className={styles.viewfinder}>
          <video ref={videoRef} className={styles.video} muted playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className={styles.scanLine} />
        </div>
        <div id="barcode-hidden-decoder" style={{ display: 'none' }} />
        <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
