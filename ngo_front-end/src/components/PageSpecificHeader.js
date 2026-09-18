import React from 'react'

function PageSpecificHeader({ name }) {
  return (
    <section className='relative isolate overflow-hidden bg-slate-950 text-white'>
      <img
        src='https://res.cloudinary.com/obxbqtss/image/upload/f_auto,q_auto,w_1600/v1789745270/rajTour.jpg'
        className='absolute inset-0 -z-20 h-full w-full object-cover object-center'
        alt='Rajasthan landscape'
        loading='eager'
        fetchPriority='high'
        decoding='async'
      />

      <div className='absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/80 to-teal-950/45' />

      <div className='site-container flex min-h-[260px] items-end py-12 sm:min-h-[300px] sm:py-14'>
        <div>
          <p className='mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300'>
            Jal Sanrakshanam
          </p>

          <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
            {name}
          </h1>

          <div className='mt-5 h-1 w-16 rounded-full bg-teal-400' />
        </div>
      </div>
    </section>
  )
}

export default PageSpecificHeader