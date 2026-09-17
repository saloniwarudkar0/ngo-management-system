import React from 'react'

function Logo({ inverse = false, compact = false }) {
  return (
    <div className={`flex min-w-0 items-center ${compact ? 'gap-2.5' : 'gap-3'}`} aria-label='Jal Sanrakshanam'>
      <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-600 shadow-lg shadow-teal-900/20'>
        <svg viewBox='0 0 24 24' className='h-6 w-6 text-white' fill='none' aria-hidden='true'>
          <path d='M12 2.8c3.7 4.4 6.2 7.6 6.2 11a6.2 6.2 0 1 1-12.4 0c0-3.4 2.5-6.6 6.2-11Z' fill='currentColor' />
          <path d='M9 15.2c.5 1.4 1.5 2.1 3 2.3' stroke='#ccfbf1' strokeWidth='1.5' strokeLinecap='round' />
        </svg>
      </span>
      <span className='block min-w-0'>
        <span className={`block whitespace-nowrap font-bold leading-none tracking-tight ${compact ? 'text-[1rem] sm:text-[1.35rem]' : 'text-[1.35rem]'} ${inverse ? 'text-white' : 'text-slate-950'}`}>
          <span className={inverse ? 'text-cyan-300' : 'text-cyan-600'}>जल</span>{' '}
          <span className={inverse ? 'text-teal-300' : 'text-teal-700'}>संरक्षणम्</span>
        </span>
        <span className={`mt-1 block whitespace-nowrap font-semibold uppercase ${compact ? 'text-[0.5rem] tracking-[0.14em] sm:text-[0.65rem] sm:tracking-[0.22em]' : 'text-[0.65rem] tracking-[0.22em]'} ${inverse ? 'text-slate-400' : 'text-slate-500'}`}>
          Charitable Foundation
        </span>
      </span>
    </div>
  )
}

export default Logo
