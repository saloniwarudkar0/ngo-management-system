import React from 'react'
import { config } from '../Config'

function SocialMedia({ inverse = false }) {
  const links = [
    { label: 'Facebook', url: config.universal_references.facebook, mark: 'f' },
    { label: 'X', url: config.universal_references.twitter, mark: '𝕏' },
    { label: 'LinkedIn', url: config.universal_references.linkedIn, mark: 'in' },
    { label: 'Instagram', url: config.universal_references.instagram, mark: '◎' },
  ]

  return (
    <div className='flex items-center gap-2' aria-label='Social media links'>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target='_blank'
          rel='noreferrer'
          aria-label={link.label}
          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition hover:-translate-y-0.5 ${inverse ? 'border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300 hover:text-cyan-300' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'}`}
        >
          {link.mark}
        </a>
      ))}
    </div>
  )
}

export default SocialMedia
