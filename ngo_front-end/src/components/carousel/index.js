import React, { useState, useEffect } from 'react'

function Carousel(props) {
  const {
    images = [],
    height = 'h-[236px]'
  } = props

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, 3000)

    return () => clearInterval(interval)
  }, [images.length])

  useEffect(() => {
    if (currentIndex >= images.length && images.length > 0) {
      setCurrentIndex(0)
    }
  }, [images, currentIndex])

  return (
    <div className='w-full h-full'>

      <div className={`relative w-full ${height} flex justify-center items-center overflow-hidden`}>

        {/* DARK OVERLAY */}

        <div className='absolute inset-0 z-[1] bg-black/20 pointer-events-none' />


        {/* PREVIOUS ARROW */}

        {images.length > 1 && (
          <button
            type='button'
            onClick={prevSlide}
            className='absolute left-2 top-1/2 z-[3] -translate-y-1/2 rounded-md bg-black/40 px-2 py-3 text-white transition hover:bg-black/65'
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


        {/* CAROUSEL IMAGE */}

        <div className='w-full h-full overflow-hidden'>

          {images.length > 0 ? (
            <img
              key={images[currentIndex]}
              src={images[currentIndex]}
              alt={`Project ${currentIndex + 1}`}
              className={`w-full ${height} object-cover transition duration-700 ease-in-out`}
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = '/blank_scenary.png'
              }}
            />
          ) : (
            <img
              src='/blank_scenary.png'
              alt='Project'
              className={`w-full ${height} object-cover`}
            />
          )}

        </div>


        {/* NEXT ARROW */}

        {images.length > 1 && (
          <button
            type='button'
            onClick={nextSlide}
            className='absolute right-2 top-1/2 z-[3] -translate-y-1/2 rounded-md bg-black/40 px-2 py-3 text-white transition hover:bg-black/65'
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
                d='m8.25 4.5 7.5 7.5-7.5 7.5'
              />
            </svg>
          </button>
        )}


        {/* IMAGE INDICATORS */}

        {images.length > 1 && (
          <div className='absolute bottom-4 left-1/2 z-[3] flex -translate-x-1/2 gap-2'>
            {images.map((_, index) => (
              <button
                key={index}
                type='button'
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'scale-110 bg-white'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

      </div>

    </div>
  )
}

export default Carousel