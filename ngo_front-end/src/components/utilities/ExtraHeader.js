import React, { useContext } from 'react'
import Logo from '../Logo'
import { ContextApp } from '../../ContextAPI'
import { config } from '../../Config'

function ExtraHeader() {
  const { setDonateModal } = useContext(ContextApp)

  return (
    <div className='border-b border-slate-200 bg-white'>
      <div className='site-container flex min-h-[88px] items-center justify-between gap-8'>
        <Logo />
        <div className='flex items-center gap-8'>
          <a href={`mailto:${config.universal_references.email}`} className='group flex items-center gap-3 text-sm text-slate-600'>
            <span className='flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 transition group-hover:bg-cyan-100'>
              <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden='true'>
                <path d='M4 6.5h16v11H4z' />
                <path d='m4.5 7 7.5 6 7.5-6' />
              </svg>
            </span>
            <span>
              <span className='block text-xs font-semibold uppercase tracking-wider text-slate-400'>Write to us</span>
              {config.universal_references.email}
            </span>
          </a>
          <a href={`tel:${config.universal_references.phone_number}`} className='group flex items-center gap-3 text-sm text-slate-600'>
            <span className='flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition group-hover:bg-teal-100'>
              <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' aria-hidden='true'>
                <path d='M8.2 3.8 10 7.7 7.8 9.4c1.3 2.8 3.5 5 6.3 6.3l1.7-2.2 3.9 1.8v3c0 1-.8 1.8-1.8 1.8C10.1 20.1 3.9 13.9 3.9 6c0-1 .8-1.8 1.8-1.8l2.5-.4Z' />
              </svg>
            </span>
            <span>
              <span className='block text-xs font-semibold uppercase tracking-wider text-slate-400'>Call us</span>
              +91 {config.universal_references.phone_number}
            </span>
          </a>
          <button onClick={() => setDonateModal(true)} className='primary-button min-h-11 px-5 py-2 text-sm'>
            Donate now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExtraHeader
