import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import styles from './QrScanner.module.css'

export default function QrScanner({ onScan, onError }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const scannerRef = useRef(null)
  const firedRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-hidden-decoder')
    scannerRef.current = scanner

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
      .catch((err) => {
        onError?.(err?.message ?? 'Não foi possível acessar a câmera.')
      })

    return () => {
      clearInterval(intervalRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.wrapper}>
      <video ref={videoRef} className={styles.video} muted playsInline />
      <canvas ref={canvasRef} className={styles.canvas} />
      <div id="qr-hidden-decoder" style={{ display: 'none' }} />
    </div>
  )
}
