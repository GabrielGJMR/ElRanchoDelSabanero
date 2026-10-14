/**
 * Reduce una foto antes de subirla: máximo 1200 px de lado, en JPG.
 * Así las fotos del celular (4-8 MB) pesan unos 200 KB, la web carga rápido y se respeta la rotación de la cámara.
 */
export async function resizeImage(file: File, maxSide = 1200, quality = 0.85): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('No se pudo leer la foto. Use una imagen JPG o PNG.')
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la foto')
  ctx.fillStyle = '#ffffff' // las PNG transparentes quedan sobre fondo blanco
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la foto'))), 'image/jpeg', quality),
  )
}
