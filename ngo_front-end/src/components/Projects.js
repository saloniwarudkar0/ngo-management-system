import React, { useContext, useEffect, useState } from 'react'
import PageSpecificHeader from './PageSpecificHeader'
import SingleProject from './SingleProject'
import CreateProject from './CreateProject'
import { getProjects } from '../Actions/projectActions'
import { ContextApp } from '../ContextAPI'

function Projects() {
  const { role = 'Public' } = useContext(ContextApp)
  const [openModal, setOpenModal] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggleReload, setToggleReload] = useState(false)

  useEffect(() => {
    const getAllProjects = async () => {
      setLoading(true)
      const response = await getProjects()
      setProjects(response?.status ? response.projects : [])
      setLoading(false)
    }
    getAllProjects()
  }, [toggleReload])

  return (
    <div className='bg-slate-50'>
      {openModal && <CreateProject onClose={() => setOpenModal(false)} toggleReload={toggleReload} setToggleReload={setToggleReload} />}
      <PageSpecificHeader name='Projects' />

      <section className='py-16 sm:py-20'>
        <div className='site-container'>
          <div className='flex flex-col justify-between gap-8 lg:flex-row lg:items-end'>
            <div className='max-w-3xl'>
              <p className='section-kicker'>Restoration in action</p>
              <h2 className='section-title mt-3'>Work that returns water to the landscape.</h2>
              <p className='mt-5 text-lg leading-8 text-slate-600'>
                Explore the water sources and communities we are supporting across Rajasthan. Select a project to see its story, location, and progress.
              </p>
            </div>
            {role === 'Head-Volunteer' && (
              <button onClick={() => setOpenModal(true)} className='primary-button shrink-0'>Add a project</button>
            )}
          </div>

          {loading ? (
            <div className='mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3' aria-label='Loading projects'>
              {[1, 2, 3].map((item) => <div key={item} className='h-[420px] animate-pulse rounded-3xl bg-slate-200' />)}
            </div>
          ) : projects.length > 0 ? (
            <div className='mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
              {projects.map((project) => (
                <SingleProject key={project.id} project={project} toggleReload={toggleReload} setToggleReload={setToggleReload} />
              ))}
            </div>
          ) : (
            <div className='surface-card mt-12 flex min-h-[260px] flex-col items-center justify-center px-6 text-center'>
              <span className='flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-2xl'>💧</span>
              <h3 className='mt-5 text-xl font-semibold text-slate-900'>Project stories are being prepared</h3>
              <p className='mt-2 max-w-md text-base leading-7 text-slate-600'>Please check back soon to explore our restoration work.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Projects
