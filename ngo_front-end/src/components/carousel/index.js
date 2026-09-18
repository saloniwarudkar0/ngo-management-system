import React, { useEffect, useMemo, useState } from 'react'

function Carousel(props) {
  const {
    images = [],
    height = 'h-[236px]'
  } = props

  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)

  /*
    ----------------------------------------
    CLEAN IMAGE LIST
    ----------------------------------------
  */
  const validImages = useMemo(() => {
    if (!Array.isArray(images)) return []

    return images.filter(
      (image) =>
        typeof image === 'string' &&
        image.trim() !== ''
    )
  }, [images])

  /*
    ----------------------------------------
    RESET WHEN PROJECT IMAGES CHANGE
    ----------------------------------------
  */
  useEffect(() => {
    setCurrentIndex(0)
    setImageLoading(validImages.length > 0)
  }, [validImages])

  /*
    ----------------------------------------
    KEEP INDEX VALID
    ----------------------------------------
  */
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, validImages.length])

  /*
    ----------------------------------------
    OPTIMIZE CLOUDINARY IMAGE URL
    ----------------------------------------
    The backend already sends Cloudinary URLs.
    We request a smaller 800px version because
    the carousel display area is only around 400px high.
  */
  const getOptimizedImageUrl = (url) => {
    if (!url || typeof url !== 'string') {
      return url
    }

    if (!url.includes('res.cloudinary.com')) {
      return url
    }

    try {
      /*
        If Cloudinary transformation already exists,
        replace the width with 800px.

        Example:

        w_1200
        ↓
        w_800
      */

      if (url.includes('w_1200')) {
        return url.replace(
          'w_1200',
          'w_800'
        )
      }

      /*
        If there is a Cloudinary upload URL but no
        transformation, add optimized transformation.
      */

      if (url.includes('/image/upload/')) {
        return url.replace(
          '/image/upload/',
          '/image/upload/c_limit,f_auto,q_auto,w_800/'
        )
      }

      return url
    } catch (error) {
      console.error(
        'Unable to optimize Cloudinary image URL:',
        error
      )

      return url
    }
  }

  /*
    ----------------------------------------
    OPTIMIZED CURRENT IMAGE
    ----------------------------------------
  */
  const currentImage = validImages[currentIndex]

  const optimizedCurrentImage = getOptimizedImageUrl(
    currentImage
  )

  /*
    ----------------------------------------
    PRELOAD NEXT IMAGE
    ----------------------------------------
    When current image loads, preload the next
    image in the background so clicking Next
    feels faster.
  */
  useEffect(() => {
    if (validImages.length <= 1) return

    const nextIndex =
      currentIndex >= validImages.length - 1
        ? 0
        : currentIndex + 1

    const nextImageUrl = getOptimizedImageUrl(
      validImages[nextIndex]
    )

    if (!nextImageUrl) return

    const image = new Image()

    image.src = nextImageUrl
  }, [currentIndex, validImages])

  /*
    ----------------------------------------
    NEXT SLIDE
    ----------------------------------------
  */
  const nextSlide = () => {
    if (validImages.length <= 1) return

    setImageLoading(true)

    setCurrentIndex((prevIndex) =>
      prevIndex >= validImages.length - 1
        ? 0
        : prevIndex + 1
    )
  }

  /*
    ----------------------------------------
    PREVIOUS SLIDE
    ----------------------------------------
  */
  const prevSlide = () => {
    if (validImages.length <= 1) return

    setImageLoading(true)

    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? validImages.length - 1
        : prevIndex - 1
    )
  }

  /*
    ----------------------------------------
    AUTO SLIDE
    ----------------------------------------
  */
  useEffect(() => {
    if (validImages.length <= 1) return

    const interval = setInterval(() => {
      setImageLoading(true)

      setCurrentIndex((prevIndex) =>
        prevIndex >= validImages.length - 1
          ? 0
          : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [validImages.length])

  /*
    ----------------------------------------
    EMPTY STATE
    ----------------------------------------
  */
  if (!currentImage) {
    return (
      <div className='w-full h-full'>

        <div
          className={`relative flex w-full ${height} items-center justify-center overflow-hidden bg-gray-100`}
        >

          <img
            src='/blank_scenary.png'
            alt='Project'
            width='800'
            height='400'
            loading='eager'
            decoding='async'
            className={`w-full ${height} object-cover`}
          />

        </div>

      </div>
    )
  }

  return (
    <div className='w-full h-full'>

      <div
        className={`relative flex w-full ${height} items-center justify-center overflow-hidden bg-gray-100`}
      >

        {/* =========================================
            LOADING PLACEHOLDER
        ========================================= */}

        {imageLoading && (
          <div
            className={`absolute inset-0 z-[2] ${height} animate-pulse bg-gray-200`}
            aria-hidden='true'
          />
        )}

        {/* =========================================
            PROJECT IMAGE
        ========================================= */}

        <img
          src={optimizedCurrentImage}
          alt={`Project image ${currentIndex + 1}`}
          width='800'
          height='400'
          loading={
            currentIndex === 0
              ? 'eager'
              : 'lazy'
          }
          decoding='async'
          fetchPriority={
            currentIndex === 0
              ? 'high'
              : 'auto'
          }
          className={`relative z-0 block w-full ${height} object-cover transition-opacity duration-200 ${
            imageLoading
              ? 'opacity-0'
              : 'opacity-100'
          }`}
          onLoad={() => {
            setImageLoading(false)
          }}
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src =
              '/blank_scenary.png'

            setImageLoading(false)
          }}
        />

        {/* =========================================
            DARK OVERLAY
        ========================================= */}

        <div
          className='pointer-events-none absolute inset-0 z-[1] bg-black/20'
          aria-hidden='true'
        />

        {/* =========================================
            PREVIOUS ARROW
        ========================================= */}

        {validImages.length > 1 && (
          <button
            type='button'
            onClick={prevSlide}
            className='absolute left-2 top-1/2 z-[4] -translate-y-1/2 rounded-md bg-black/40 px-2 py-3 text-white transition hover:bg-black/65'
            aria-label='Previous image'
          >

            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='2'
              stroke='currentColor'
              className='size-6'
            >

              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 19.5 8.25 12l7.5-7.5'
              />

            </svg>

          </button>
        )}

        {/* =========================================
            NEXT ARROW
        ========================================= */}

        {validImages.length > 1 && (
          <button
            type='button'
            onClick={nextSlide}
            className='absolute right-2 top-1/2 z-[4] -translate-y-1/2 rounded-md bg-black/40 px-2 py-3 text-white transition hover:bg-black/65'
            aria-label='Next image'
          >

            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='2'
              stroke='currentColor'
              className='size-6'
            >

              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m8.25 4.5 7.5 7.5-7.5-7.5'
              />

            </svg>

          </button>
        )}

        {/* =========================================
            IMAGE INDICATORS
        ========================================= */}

        {validImages.length > 1 && (
          <div className='absolute bottom-4 left-1/2 z-[4] flex -translate-x-1/2 gap-2'>

            {validImages.map((_, index) => (
              <button
                key={index}
                type='button'
                onClick={() => {
                  if (index !== currentIndex) {
                    setImageLoading(true)
                    setCurrentIndex(index)
                  }
                }}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'scale-110 bg-white'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
                aria-current={
                  index === currentIndex
                    ? 'true'
                    : undefined
                }
              />
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default Carousel