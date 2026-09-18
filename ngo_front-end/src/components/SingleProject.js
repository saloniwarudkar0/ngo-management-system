import React, { useState } from 'react'
import ViewProject from './ViewProject'
import moment from 'moment/moment'

function SingleProject({ project, setToggleReload, toggleReload }) {
  const [openModal, setOpenModal] = useState(false)

  const description = project?.description || ''

  // Use the Cloudinary URL directly from the backend.
  // Do not modify the URL on the frontend.
  const image = project?.images?.[0] || '/blank_scenary.png'

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

        {/* Project Image */}
        <div className='relative h-56 w-full overflow-hidden bg-slate-200'>
          <img
            src={image}
            alt={project?.name || 'Water restoration project'}
            width='600'
            height='350'
            loading='lazy'
            decoding='async'
            className='h-full w-full object-cover object-center transition duration-500 group-hover:scale-105'
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = '/blank_scenary.png'
            }}
          />

          <span className='absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur'>
            Project
          </span>
        </div>

        {/* Project Information */}
        <div className='flex flex-1 flex-col p-6'>

          <h3 className='text-xl font-semibold tracking-tight text-slate-950'>
            {project?.name}
          </h3>

          {project?.start && (
            <p className='mt-3 text-sm font-semibold text-teal-700'>
              {moment(project.start).format('DD MMM YYYY')}

              {hasDateRange &&
                ` — ${moment(project.end).format('DD MMM YYYY')}`}
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
            <span aria-hidden='true'>→</span>
          </button>

        </div>
      </article>
    </div>
  )
}

export default SingleProject