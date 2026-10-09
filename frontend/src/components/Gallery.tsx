import PhotoFrame from './PhotoFrame.tsx'

// Todas las fotos de la carpeta src/assets/local se muestran solas, en orden alfabético por nombre.
// Para agregar fotos del local: copie los archivos (JPG, PNG o WebP) a esa carpeta y vuelva a construir la web.
const files = import.meta.glob('../assets/local/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const photos = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)

const EMPTY_SLOTS = 3

export default function Gallery() {
  const items: (string | null)[] = photos.length > 0 ? photos : Array.from({ length: EMPTY_SLOTS }, () => null)

  return (
    <section className="mx-auto max-w-5xl px-4 py-16" aria-labelledby="galeria">
      <h2 id="galeria" className="mb-8 font-display text-3xl text-gold md:text-4xl">Así es el rancho</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((src, i) => (
          <PhotoFrame
            key={src ?? i}
            src={src}
            alt={src ? `Foto del local ${i + 1}` : 'Espacio reservado para una foto del local'}
            placeholder="Foto del local"
            className={`aspect-[4/3] w-full rounded-sm ${i === 0 && items.length > 2 ? 'col-span-2 md:row-span-2 md:aspect-auto md:h-full' : ''}`}
          />
        ))}
      </div>
    </section>
  )
}
