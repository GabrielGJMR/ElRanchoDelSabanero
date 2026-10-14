import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchGallery, type GallerySection } from '../lib/api.ts'
import PhotoFrame from './PhotoFrame.tsx'
import Reveal from './Reveal.tsx'

const EMPTY_SLOTS = 3

type PhotoFrameProps = Parameters<typeof PhotoFrame>[0]

/** PhotoFrame con un leve zoom al pasar el mouse; `className` define el tamaño/forma de la caja. */
function HoverFrame({ className = '', ...props }: PhotoFrameProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <PhotoFrame {...props} className="size-full scale-100 transition-transform duration-300 ease-out hover:scale-105" />
    </div>
  )
}

/** Sección "mosaico": la primera foto manda (grande), el resto la acompaña — nunca una grilla pareja y plana. */
function GridSectionBlock({ section }: { section: GallerySection }) {
  const { t } = useTranslation()
  const items: (GallerySection['photos'][number] | null)[] =
    section.photos.length > 0 ? section.photos : Array.from({ length: EMPTY_SLOTS }, () => null)

  return (
    <section className="mx-auto max-w-5xl px-4 py-16" aria-labelledby={`galeria-${section.id}`}>
      <Reveal>
        <h2 id={`galeria-${section.id}`} className="mb-8 font-display text-3xl text-gold md:text-4xl">{section.name}</h2>

        {/* grid-flow-dense rellena los huecos que deja la foto grande: con cualquier cantidad de
            fotos, el mosaico siempre queda parejo (el truco: aspect-square + col-span-2/row-span-2
            hace que la foto grande mida exactamente lo mismo que dos chicas apiladas, sin huecos). */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-flow-dense md:gap-4">
          {items.map((photo, i) => (
            <HoverFrame
              key={photo?.id ?? i}
              src={photo?.url}
              alt={photo ? t('gallery.photoAlt', { n: i + 1 }) : t('gallery.placeholderAlt')}
              placeholder={t('gallery.placeholderText')}
              className={`aspect-square w-full rounded-lg border border-gold/15 ${
                i === 0 && items.length > 1 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            />
          ))}
        </div>
      </Reveal>
    </section>
  )
}

/**
 * Sección "cartel": una foto panorámica grande con el título montado encima (como una portada de
 * revista), y el resto de las fotos como tira chica debajo. Nunca igual a la grilla clásica.
 */
function BannerSectionBlock({ section }: { section: GallerySection }) {
  const { t } = useTranslation()
  const [featured, ...rest] = section.photos

  return (
    <section className="border-t border-line-soft bg-card/30 py-16" aria-labelledby={`galeria-${section.id}`}>
      <Reveal className="mx-auto max-w-5xl px-4">
        <div className="relative isolate overflow-hidden rounded-sm">
          <PhotoFrame
            src={featured?.url}
            alt={featured ? t('gallery.photoAlt', { n: 1 }) : t('gallery.placeholderAlt')}
            placeholder={t('gallery.placeholderText')}
            className="aspect-21/9 w-full scale-100 transition-transform duration-300 ease-out hover:scale-105"
          />
          {featured && (
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
          )}
          <h2
            id={`galeria-${section.id}`}
            className={`absolute bottom-5 left-5 font-display text-2xl md:bottom-8 md:left-8 md:text-4xl ${featured ? 'text-ink' : 'text-gold'}`}
          >
            {section.name}
          </h2>
        </div>

        {rest.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {rest.map((photo, i) => (
              <HoverFrame
                key={photo.id}
                src={photo.url}
                alt={t('gallery.photoAlt', { n: i + 2 })}
                className="size-20 shrink-0 rounded-sm sm:size-24"
              />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  )
}

/** Sección "a la par": foto grande a un lado, título y nota en una columna de texto al otro. */
function EditorialSplitBlock({ section, reverse }: { section: GallerySection; reverse: boolean }) {
  const { t } = useTranslation()
  const [featured, ...rest] = section.photos

  return (
    <section className="border-t border-line-soft bg-card/30" aria-labelledby={`galeria-${section.id}`}>
      <Reveal className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <HoverFrame
          src={featured?.url}
          alt={featured ? t('gallery.photoAlt', { n: 1 }) : t('gallery.placeholderAlt')}
          placeholder={t('gallery.placeholderText')}
          className={`aspect-4/3 w-full rounded-sm md:aspect-square ${reverse ? 'md:order-2' : ''}`}
        />

        <div>
          <h2 id={`galeria-${section.id}`} className="font-display text-3xl text-gold md:text-4xl">{section.name}</h2>
          {section.note && <p className="mt-4 leading-relaxed text-muted">{section.note}</p>}

          {rest.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {rest.map((photo, i) => (
                <HoverFrame
                  key={photo.id}
                  src={photo.url}
                  alt={t('gallery.photoAlt', { n: i + 2 })}
                  className="size-16 rounded-sm sm:size-20"
                />
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  )
}

/** Sección "portada": foto vertical a toda altura con el título y la nota montados encima, como una tapa de revista. */
function EditorialOverlayBlock({ section }: { section: GallerySection }) {
  const { t } = useTranslation()
  const [featured, ...rest] = section.photos

  return (
    <section className="py-16" aria-labelledby={`galeria-${section.id}`}>
      <Reveal className="mx-auto max-w-4xl px-4">
        <div className="relative isolate overflow-hidden rounded-sm">
          <PhotoFrame
            src={featured?.url}
            alt={featured ? t('gallery.photoAlt', { n: 1 }) : t('gallery.placeholderAlt')}
            placeholder={t('gallery.placeholderText')}
            className="aspect-square w-full scale-100 transition-transform duration-300 ease-out hover:scale-105 md:aspect-video"
          />
          {featured && (
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" aria-hidden="true" />
          )}
          <div className={`absolute inset-x-0 bottom-0 max-w-lg p-6 md:p-10 ${featured ? '' : 'text-gold'}`}>
            <h2 id={`galeria-${section.id}`} className={`font-display text-2xl md:text-4xl ${featured ? 'text-ink' : ''}`}>
              {section.name}
            </h2>
            {section.note && (
              <p className={`mt-3 leading-relaxed ${featured ? 'text-ink/85' : 'text-muted'}`}>{section.note}</p>
            )}
          </div>
        </div>

        {rest.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {rest.map((photo, i) => (
              <HoverFrame
                key={photo.id}
                src={photo.url}
                alt={t('gallery.photoAlt', { n: i + 2 })}
                className="size-20 shrink-0 rounded-sm sm:size-24"
              />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  )
}

/** Sección "palabra": el texto manda (título y nota centrados), con la foto como acento chico y redondo a un lado. */
function EditorialQuoteBlock({ section }: { section: GallerySection }) {
  const { t } = useTranslation()
  const [featured, ...rest] = section.photos

  return (
    <section className="border-t border-line-soft py-16" aria-labelledby={`galeria-${section.id}`}>
      <Reveal className="mx-auto grid max-w-5xl items-center gap-10 px-4 md:grid-cols-[1fr_auto]">
        <div className="text-center md:text-left">
          <h2 id={`galeria-${section.id}`} className="font-display text-3xl text-gold md:text-4xl">{section.name}</h2>
          {section.note && <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted md:mx-0">{section.note}</p>}

          {rest.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              {rest.map((photo, i) => (
                <HoverFrame
                  key={photo.id}
                  src={photo.url}
                  alt={t('gallery.photoAlt', { n: i + 2 })}
                  className="size-14 rounded-sm sm:size-16"
                />
              ))}
            </div>
          )}
        </div>

        <HoverFrame
          src={featured?.url}
          alt={featured ? t('gallery.photoAlt', { n: 1 }) : t('gallery.placeholderAlt')}
          placeholder={t('gallery.placeholderText')}
          className="mx-auto aspect-square w-40 rounded-full sm:w-48"
        />
      </Reveal>
    </section>
  )
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

  let editorialCount = 0
  let splitCount = 0
  let plainCount = 0

  return (
    <>
      {sections.map((section) => {
        if (section.note) {
          const variant = editorialCount % 3
          editorialCount++
          if (variant === 0) {
            const reverse = splitCount % 2 === 1
            splitCount++
            return <EditorialSplitBlock key={section.id} section={section} reverse={reverse} />
          }
          if (variant === 1) return <EditorialOverlayBlock key={section.id} section={section} />
          return <EditorialQuoteBlock key={section.id} section={section} />
        }
        const banner = plainCount % 2 === 1
        plainCount++
        return banner
          ? <BannerSectionBlock key={section.id} section={section} />
          : <GridSectionBlock key={section.id} section={section} />
      })}
    </>
  )
}
