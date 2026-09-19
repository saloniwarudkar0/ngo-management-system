import React, { useState } from 'react'
import ViewProject from './ViewProject'
import moment from 'moment/moment'

function SingleProject({ project, setToggleReload, toggleReload }) {
  const [openModal, setOpenModal] = useState(false)

  const description = project?.description || ''

  /*
    ----------------------------------------
    CLEAN CLOUDINARY IMAGE URL
    ----------------------------------------
    Some older project records may contain
    repeated Cloudinary transformations.

    Example of problematic URL:

    /image/upload/c_limit,f_auto,q_auto,w_1200/
    v1/c_limit,f_auto,q_auto,w_1200/
    v1/projects/...

    We remove the unwanted transformation
    sections and keep the actual project path.
  */
  const cleanCloudinaryUrl = (url) => {
    if (typeof url !== 'string') return ''

    const trimmedUrl = url.trim()

    if (!trimmedUrl) return ''

    /*
      Only clean Cloudinary URLs.
      Other URLs remain unchanged.
    */
    if (!trimmedUrl.includes('res.cloudinary.com')) {
      return trimmedUrl
    }

    try {
      const parsedUrl = new URL(trimmedUrl)

      const pathname = parsedUrl.pathname

      const uploadMarker = '/upload/'

      const uploadIndex = pathname.indexOf(uploadMarker)

      if (uploadIndex === -1) {
        return trimmedUrl
      }

      const beforeUpload = pathname.substring(
        0,
        uploadIndex + uploadMarker.length
      )

      const afterUpload = pathname.substring(
        uploadIndex + uploadMarker.length
      )

      const parts = afterUpload
        .split('/')
        .filter(Boolean)

      const cleanedParts = []

      let foundProjectsPath = false

      for (const part of parts) {

        /*
          Once projects/ is reached,
          everything after it is the actual
          Cloudinary public path.
        */
        if (part === 'projects') {
          foundProjectsPath = true
          cleanedParts.push(part)
          continue
        }

        if (foundProjectsPath) {
          cleanedParts.push(part)
          continue
        }

        /*
          Remove Cloudinary transformation values.
        */
        if (
          part === 'c_limit,f_auto,q_auto,w_1200' ||
          part === 'c_limit,f_auto,q_auto,w_800' ||
          part === 'c_limit,f_auto,q_auto' ||
          part.startsWith('c_limit') ||
          part.startsWith('w_') ||
          part.startsWith('f_') ||
          part.startsWith('q_')
        ) {
          continue
        }

        /*
          Keep only the first version number.
        */
        if (/^v\d+$/.test(part)) {
          if (!cleanedParts.includes(part)) {
            cleanedParts.push(part)
          }
          continue
        }
      }

      /*
        If we successfully found the project path,
        rebuild the Cloudinary URL.
      */
      if (foundProjectsPath) {
        const cleanedPath =
          beforeUpload +
          cleanedParts.join('/')

        return (
          `${parsedUrl.origin}${cleanedPath}` +
          `${parsedUrl.search || ''}`
        )
      }

      return trimmedUrl
    } catch (error) {
      console.error(
        'Cloudinary project card URL cleaning failed:',
        error
      )

      return trimmedUrl
    }
  }

  /*
    ----------------------------------------
    PROJECT IMAGE
    ----------------------------------------
  */
  const originalImage =
    Array.isArray(project?.images)
      ? project.images.find(
          (image) =>
            typeof image === 'string' &&
            image.trim() !== ''
        )
      : ''

  const image =
    cleanCloudinaryUrl(originalImage) ||
    '/blank_scenary.png'

  /*
    Debug the final image URL used by the card.
  */
  console.log(
    'PROJECT CARD IMAGE URL:',
    image
  )

  const hasDateRange =
    project?.start &&
    project?.end &&
    project.start !== project.end

  return (
    <div className='min-w-0'>

      {openModal && (
        <ViewProject
          onClose={() => setOpenModal(false)}
          projectId={project.id}
          projectData={project}
          toggleReload={toggleReload}
          setToggleReload={setToggleReload}
        />
      )}

      <article className='group surface-card flex h-full w-full flex-col overflow-hidden text-left transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_24px_70px_-35px_rgba(15,118,110,0.45)]'>

        {/* =========================================
            PROJECT IMAGE
        ========================================= */}
        <div className='relative h-56 w-full overflow-hidden bg-slate-200'>

          <img
            src={image}
            alt={
              project?.name ||
              'Water restoration project'
            }
            width='600'
            height='350'
            loading='lazy'
            decoding='async'
            className='h-full w-full object-cover object-center transition duration-500 group-hover:scale-105'
            onLoad={() => {
              console.log(
                'PROJECT CARD IMAGE LOADED:',
                image
              )
            }}
            onError={(event) => {
              console.error(
                'PROJECT CARD IMAGE FAILED:',
                image
              )

              event.currentTarget.onerror = null
              event.currentTarget.src =
                '/blank_scenary.png'
            }}
          />

          <span className='absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur'>
            Project
          </span>

        </div>

        {/* =========================================
            PROJECT INFORMATION
        ========================================= */}
        <div className='flex flex-1 flex-col p-6'>

          <h3 className='text-xl font-semibold tracking-tight text-slate-950'>
            {project?.name}
          </h3>

          {project?.start && (
            <p className='mt-3 text-sm font-semibold text-teal-700'>

              {moment(project.start).format(
                'DD MMM YYYY'
              )}

              {hasDateRange &&
                ` — ${moment(project.end).format(
                  'DD MMM YYYY'
                )}`}

            </p>
          )}

          {project?.address && (
            <p className='mt-2 text-sm text-slate-500'>
              {project.address}
            </p>
          )}

          <p className='mt-4 line-clamp-3 text-base leading-7 text-slate-600'>
            {description}
          </p>

          <button
            type='button'
            onClick={() => setOpenModal(true)}
            className='mt-6 inline-flex items-center gap-2 text-left text-sm font-semibold text-teal-700 transition hover:gap-3'
          >
            View project

            <span aria-hidden='true'>
              →
            </span>

          </button>

        </div>

      </article>

    </div>
  )
}

export default SingleProject