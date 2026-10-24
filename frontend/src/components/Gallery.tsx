import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchGallery, type GallerySection } from '../lib/api.ts'
import PhotoFrame from './PhotoFrame.tsx'
import Reveal from './Reveal.tsx'

const EMPTY_SLOTS = 3

type PhotoFrameProps = Parameters<typeof PhotoFrame>[0]

function HoverFrame({ className = '', ...props }: PhotoFrameProps) {
  return <div className={`overflow-hidden ${className}`}><PhotoFrame {...props} className="size-full scale-100 object-cover transition-transform duration-300 hover:scale-105" /></div>
}

function RanchoSection({ section }: { section: GallerySection }) {
  const { t } = useTranslation()
  const [featured, ...details] = section.photos
  return (
    <section className="rancho-story" aria-labelledby={`galeria-${section.id}`}>
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
        <Reveal className="rancho-story-copy relative z-10">
          <span className="rancho-story-kicker">Un lugar para compartir</span>
          <h2 id={`galeria-${section.id}`} className="mt-5 max-w-md font-script text-5xl leading-[1.05] sm:text-6xl">{section.name}</h2>
          <span className="rancho-story-rule" aria-hidden="true" />
          {section.note && <p className="mt-5 max-w-sm text-base leading-relaxed">{section.note}</p>}
          <p className="rancho-story-signature mt-7 font-display text-xs tracking-[.22em] uppercase">Liberia, Guanacaste · Costa Rica</p>
        </Reveal>
        <Reveal delay={100} className="rancho-story-photos">
          <div className="rancho-story-featured"><PhotoFrame src={featured?.url} alt={featured ? t('gallery.photoAlt', { n: 1 }) : t('gallery.placeholderAlt')} placeholder={t('gallery.placeholderText')} className="size-full object-cover" /><span className="rancho-photo-stamp" aria-hidden="true">Desde Liberia</span></div>
          {details.length > 0 && <div className="rancho-story-strip">{details.slice(0, 3).map((photo, i) => <HoverFrame key={photo.id} src={photo.url} alt={t('gallery.photoAlt', { n: i + 2 })} />)}</div>}
        </Reveal>
      </div>
    </section>
  )
}

function GridSectionBlock({ section }: { section: GallerySection }) {
  const { t } = useTranslation()
  const items: (GallerySection['photos'][number] | null)[] = section.photos.length ? section.photos : Array.from({ length: EMPTY_SLOTS }, () => null)
  return <section className="gallery-section mx-auto max-w-6xl px-4 py-14 sm:py-16" aria-labelledby={`galeria-${section.id}`}><Reveal>
    <div className="gallery-heading mb-7"><p className="gallery-kicker">El rancho por dentro</p><h2 id={`galeria-${section.id}`} className="mt-2 font-display text-3xl text-gold md:text-4xl">{section.name}</h2></div>
    <div className="gallery-mosaic grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-flow-dense md:gap-4">{items.map((photo, i) => <HoverFrame key={photo?.id ?? i} src={photo?.url} alt={photo ? t('gallery.photoAlt', { n: i + 1 }) : t('gallery.placeholderAlt')} placeholder={t('gallery.placeholderText')} className={`aspect-square w-full ${i === 0 && items.length > 1 ? 'md:col-span-2 md:row-span-2' : ''}`} />)}</div>
  </Reveal></section>
}

function EditorialSplitBlock({ section, reverse, variant }: { section: GallerySection; reverse: boolean; variant: number }) {
  const { t } = useTranslation()
  const [featured, ...rest] = section.photos
  return <section className={`gallery-editorial gallery-editorial-${variant} ${reverse ? 'gallery-editorial-reverse' : ''}`}><Reveal className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-12">
    <div className={`gallery-editorial-photo ${reverse ? 'md:order-2' : ''}`}><HoverFrame src={featured?.url} alt={featured ? t('gallery.photoAlt', { n: 1 }) : t('gallery.placeholderAlt')} placeholder={t('gallery.placeholderText')} className="aspect-[4/3] w-full" /></div>
    <div className={`gallery-caption ${reverse ? 'md:order-1' : ''}`}><p className="gallery-kicker">Momentos del rancho</p><h2 id={`galeria-${section.id}`} className="mt-2 font-display text-3xl text-gold md:text-4xl">{section.name}</h2>{section.note && <p className="mt-4 max-w-md leading-relaxed text-muted">{section.note}</p>}
      {rest.length > 0 && <div className="mt-6 flex gap-3">{rest.slice(0, 3).map((photo, i) => <HoverFrame key={photo.id} src={photo.url} alt={t('gallery.photoAlt', { n: i + 2 })} className="aspect-square w-20 shrink-0 sm:w-24" />)}</div>}
    </div>
  </Reveal></section>
}

/**
 * Todas las secciones de fotos del local (administrables desde el panel), una tras otra, sin que
 * dos seguidas se vean iguales: con nota alterna entre tres formatos de texto+foto; sin nota
 * alterna entre la grilla clásica y el cartel panorámico.
 */
export default function Gallery() {
  const { i18n } = useTranslation()
  const [sections, setSections] = useState<GallerySection[] | null>(null)

  useEffect(() => {
    fetchGallery(i18n.language).then(setSections).catch(() => setSections([]))
  }, [i18n.language])

  if (!sections || sections.length === 0) return null

  let editorialIndex = 0

  return (
    <>
      {sections.map((section) => {
        if (/as[ií]\s+es\s+el\s+rancho/i.test(section.name)) {
          return <RanchoSection key={section.id} section={section} />
        }
        if (section.note) {
          const reverse = editorialIndex % 2 === 1
          const variant = (editorialIndex % 3) + 1
          editorialIndex++
          return <EditorialSplitBlock key={section.id} section={section} reverse={reverse} variant={variant} />
        }
        return <GridSectionBlock key={section.id} section={section} />
      })}
    </>
  )
}
