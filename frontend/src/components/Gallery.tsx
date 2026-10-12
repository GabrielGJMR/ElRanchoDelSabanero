import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchGallery, type GalleryPhoto } from '../api.ts'
import PhotoFrame from './PhotoFrame.tsx'

const EMPTY_SLOTS = 3

export default function Gallery() {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null)

  useEffect(() => {
    fetchGallery().then(setPhotos).catch(() => setPhotos([]))
  }, [])

  const items: (GalleryPhoto | null)[] =
    photos && photos.length > 0 ? photos : Array.from({ length: EMPTY_SLOTS }, () => null)

  return (
    <section className="mx-auto max-w-5xl px-4 py-16" aria-labelledby="galeria">
      <h2 id="galeria" className="mb-8 font-display text-3xl text-gold md:text-4xl">{t('gallery.heading')}</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((photo, i) => (
          <PhotoFrame
            key={photo?.id ?? i}
            src={photo?.url}
            alt={photo ? t('gallery.photoAlt', { n: i + 1 }) : t('gallery.placeholderAlt')}
            placeholder={t('gallery.placeholderText')}
            className={`aspect-[4/3] w-full rounded-sm ${i === 0 && items.length > 2 ? 'col-span-2 md:row-span-2 md:aspect-auto md:h-full' : ''}`}
          />
        ))}
      </div>
    </section>
  )
}
