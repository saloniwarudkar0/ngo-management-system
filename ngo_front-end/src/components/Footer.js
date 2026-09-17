import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import SocialMedia from './SocialMedia'
import { config } from '../Config'

function Footer() {
  const exploreLinks = [
    ['Home', '/'],
    ['About us', '/about'],
    ['Projects', '/projects'],
    ['Events', '/events'],
    ['Contact us', '/contact-us'],
  ]

  return (
    <footer className='relative isolate overflow-hidden bg-slate-950 text-slate-300'>
      <img className='absolute inset-0 -z-20 h-full w-full object-cover opacity-20' src='/footer.jpg' alt='' />
      <div className='absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-950/95 to-teal-950/90' />
      <div className='site-container py-14 sm:py-16'>
        <div className='grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_1fr]'>
          <div className='max-w-md'>
            <Logo inverse />
            <p className='mt-6 text-base leading-7 text-slate-400'>
              Restoring natural water sources and supporting the communities that protect them across Rajasthan.
            </p>
            <div className='mt-6'><SocialMedia inverse /></div>
          </div>

          <div>
            <h2 className='text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300'>Explore</h2>
            <ul className='mt-5 space-y-3'>
              {exploreLinks.map(([title, link]) => (
                <li key={title}><Link to={link} className='text-base transition hover:text-white'>{title}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className='text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300'>Get in touch</h2>
            <div className='mt-5 space-y-4 text-base'>
              <a href={`mailto:${config.universal_references.email}`} className='block break-words transition hover:text-white'>{config.universal_references.email}</a>
              <a href={`tel:${config.universal_references.phone_number}`} className='block transition hover:text-white'>+91 {config.universal_references.phone_number}</a>
              <p className='leading-7 text-slate-400'>{config.universal_references.address}</p>
            </div>
          </div>
        </div>
        <div className='mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between'>
          <p>© {new Date().getFullYear()} Jalsanrakshanam Charitable Foundation</p>
          <p>Water for every life.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
