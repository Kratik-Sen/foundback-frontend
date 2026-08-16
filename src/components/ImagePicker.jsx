import { ImagePlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`
const existingKey = (image) => `existing-${image.publicId || image.url}`

function existingName(image, index) {
  const fileName = image.url?.split('/').pop()?.split('?')[0]
  return fileName ? decodeURIComponent(fileName) : `Existing image ${index + 1}`
}

export default function ImagePicker({ registration, existingImages = [], onExistingChange, maxFiles = 6 }) {
  const initialImages = existingImages.map((image, index) => ({
    id: existingKey(image),
    name: existingName(image, index),
    url: image.url,
    existing: true,
    source: image,
  }))
  const [images, setImages] = useState(initialImages)
  const [limitReached, setLimitReached] = useState(false)
  const imagesRef = useRef(initialImages)
  const inputRef = useRef(null)

  useEffect(() => () => {
    imagesRef.current.filter((image) => !image.existing).forEach(({ url }) => URL.revokeObjectURL(url))
  }, [])

  const syncInput = (records, event) => {
    const transfer = new DataTransfer()
    records.filter(({ file }) => file).forEach(({ file }) => transfer.items.add(file))
    const input = event?.target || inputRef.current
    if (!input) return
    input.files = transfer.files
    registration.onChange(event || { target: input, type: 'change' })
  }

  const updateImages = (next, event) => {
    imagesRef.current = next
    setImages(next)
    onExistingChange?.(next.filter(({ existing }) => existing).map(({ source }) => source))
    syncInput(next, event)
  }

  const addImages = (event) => {
    const current = imagesRef.current
    const existing = new Set(current.map(({ id }) => id))
    const selected = Array.from(event.target.files || []).filter((file) => !existing.has(fileKey(file)))
    const available = Math.max(0, maxFiles - current.length)
    const accepted = selected.slice(0, available).map((file) => ({
      id: fileKey(file),
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      existing: false,
    }))

    setLimitReached(selected.length > available)
    updateImages([...current, ...accepted], event)
  }

  const removeImage = (id) => {
    const removed = imagesRef.current.find((image) => image.id === id)
    if (removed && !removed.existing) URL.revokeObjectURL(removed.url)
    setLimitReached(false)
    updateImages(imagesRef.current.filter((image) => image.id !== id))
  }

  const registerInput = (node) => {
    inputRef.current = node
    registration.ref(node)
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 p-3 transition-colors hover:border-brand-300 dark:border-slate-700 dark:hover:border-brand-500">
      {images.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((image, index) => (
            <figure key={image.id} className="group relative overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
              <img
                src={image.url}
                alt={`Selected preview ${index + 1}: ${image.name}`}
                className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/70 text-white shadow-md hover:bg-rose-600"
                aria-label={`Remove ${image.name}`}
                title="Remove image"
              >
                <X size={15} />
              </button>
              <figcaption className="absolute inset-x-0 bottom-0 truncate bg-black/65 px-2 py-1 text-[.62rem] text-white">
                {image.existing ? `Current · ${image.name}` : image.name}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-24 w-full flex-col items-center justify-center text-sm text-slate-500"
        >
          <ImagePlus className="mb-2 text-brand-500" />
          <span>Select item images</span>
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500">{images.length} of {maxFiles} images selected</p>
        {images.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
          >
            <ImagePlus size={15} /> {images.length ? 'Add more images' : 'Add images'}
          </button>
        )}
      </div>

      {images.length === maxFiles && <p className="mt-2 text-xs font-medium text-emerald-600">Maximum of {maxFiles} images selected.</p>}
      {limitReached && <p className="mt-2 text-xs font-medium text-amber-600">Only {maxFiles} images can be uploaded. Remove one before adding another.</p>}
      <input
        {...registration}
        ref={registerInput}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={addImages}
      />
    </div>
  )
}
