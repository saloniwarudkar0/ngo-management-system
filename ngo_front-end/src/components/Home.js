import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ContextApp } from '../ContextAPI'

function Home() {
  const navigate = useNavigate()
  const { setDonateModal } = useContext(ContextApp)

  const goToCreateVolunteer = () => navigate('/contact-us#add-volunteer')

  return (
    <div className='bg-slate-50'>
      <section className='relative isolate overflow-hidden bg-slate-950 text-white sm:min-h-[620px] lg:min-h-[680px]'>
        <img
          src='/image.png'
          className='absolute inset-0 -z-20 h-full w-full object-cover object-center'
          alt='A river winding through a green Rajasthan landscape'
        />
        <div className='absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,20,32,0.94)_0%,rgba(4,47,58,0.76)_48%,rgba(2,20,32,0.28)_100%)]' />
        <div className='absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/70 to-transparent' />

        <div className='site-container relative py-14 sm:flex sm:min-h-[620px] sm:items-center sm:py-20 lg:min-h-[680px]'>
          <div className='max-w-3xl'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur'>
              <span className='h-2 w-2 rounded-full bg-cyan-300' />
              Restoring Rajasthan's natural water sources
            </div>
            <p className='mb-3 text-lg font-semibold tracking-wide text-cyan-300 sm:text-xl'>जल ही जीवन है</p>
            <h1 className='max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl'>
              Reviving water.<br />Renewing life.
            </h1>
            <p className='mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl'>
              We work with communities to restore traditional water bodies and build a more water-secure future for people and wildlife.
            </p>
            <div className='mt-9 flex flex-col gap-3 sm:flex-row'>
              <button onClick={() => setDonateModal(true)} className='primary-button w-full sm:w-auto'>Support our mission</button>
              <button onClick={goToCreateVolunteer} className='secondary-button w-full sm:w-auto'>Become a volunteer</button>
            </div>
          </div>
        </div>

        <div className='site-container relative mt-1 pb-8 sm:-mt-20'>
          <div className='grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 shadow-2xl backdrop-blur-md sm:grid-cols-3'>
            {[
              ['01', 'Restore', 'Revive ponds and natural water sources'],
              ['02', 'Protect', 'Care for communities and wildlife'],
              ['03', 'Sustain', 'Preserve water for future generations'],
            ].map(([number, title, text]) => (
              <div key={number} className='flex gap-4 bg-slate-950/55 p-5 sm:p-6'>
                <span className='text-sm font-bold text-cyan-300'>{number}</span>
                <span>
                  <strong className='block text-base text-white'>{title}</strong>
                  <span className='mt-1 block text-sm leading-6 text-slate-300'>{text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='py-20 sm:py-24'>
        <div className='site-container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20'>
          <div className='relative'>
            <div className='absolute -left-5 -top-5 h-32 w-32 rounded-full bg-cyan-200/60 blur-3xl' />
            <div className='surface-card relative overflow-hidden bg-gradient-to-br from-cyan-100 to-teal-200 p-3'>
              <img
                src='/raj2.png'
                className='h-[360px] w-full rounded-[1.25rem] object-cover object-center sm:h-[480px]'
                alt='Water conservation work in Rajasthan'
              />
            </div>
            <div className='absolute -bottom-6 right-4 max-w-[230px] rounded-2xl bg-teal-700 p-5 text-white shadow-xl sm:right-8'>
              <p className='text-sm font-semibold uppercase tracking-[0.16em] text-teal-200'>Our belief</p>
              <p className='mt-2 text-lg font-semibold leading-6'>Every restored source creates a stronger community.</p>
            </div>
          </div>
          <div className='pt-8 lg:pt-0'>
            <p className='section-kicker'>A future shaped by water</p>
            <h2 className='section-title mt-4'>Local action can bring a landscape back to life.</h2>
            <p className='mt-6 text-lg leading-8 text-slate-600'>
              Join us in restoring natural water sources and making clean, accessible water possible for communities in need. Together, we can protect Rajasthan's ecology and create lasting change.
            </p>
            <div className='mt-8 grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl border border-slate-200 bg-white p-5'>
                <span className='text-sm font-semibold text-teal-700'>Community-led</span>
                <p className='mt-2 text-sm leading-6 text-slate-600'>Work shaped around local needs and long-term care.</p>
              </div>
              <div className='rounded-2xl border border-slate-200 bg-white p-5'>
                <span className='text-sm font-semibold text-teal-700'>Nature-focused</span>
                <p className='mt-2 text-sm leading-6 text-slate-600'>Restoration that supports people, land, and wildlife.</p>
              </div>
            </div>
            <button onClick={() => navigate('/projects')} className='mt-8 inline-flex items-center gap-2 text-base font-semibold text-teal-700 transition hover:gap-3'>
              Explore our projects <span aria-hidden='true'>→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
