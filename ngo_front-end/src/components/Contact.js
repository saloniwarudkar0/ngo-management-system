import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageSpecificHeader from './PageSpecificHeader'
import MailIcon from '../Icons/MailIcon'
import PhoneIcon from '../Icons/PhoneIcon'
import LocationPinIcon from '../Icons/LocationPinIcon'
import CreateVolunteer from '../Volunteer/CreateVolunteer'
import { config } from '../Config'

function Contact() {
  const { hash } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''))
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash])

  const contactInfo = [
    { icon: <PhoneIcon />, label: 'Call us', value: `+91 ${config.universal_references.phone_number}`, url: `tel:${config.universal_references.phone_number}` },
    { icon: <MailIcon />, label: 'Email us', value: config.universal_references.email, url: `mailto:${config.universal_references.email}` },
    { icon: <LocationPinIcon />, label: 'Visit us', value: config.universal_references.address },
  ]

  return (
    <div className='bg-slate-50'>
      <PageSpecificHeader name='Contact Us' />

      <section className='py-16 sm:py-20'>
        <div className='site-container'>
          <div className='grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16'>
            <div>
              <p className='section-kicker'>Let’s talk</p>
              <h2 className='section-title mt-4'>Every meaningful change starts with a conversation.</h2>
              <p className='mt-6 text-lg leading-8 text-slate-600'>
                Reach out to support our work, ask a question, or learn how you can take part in restoring Rajasthan's water sources.
              </p>
              <div className='mt-9 space-y-4'>
                {contactInfo.map((info) => {
                  const content = (
                    <>
                      <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700'>{info.icon}</span>
                      <span className='min-w-0'>
                        <span className='block text-sm font-semibold uppercase tracking-wider text-slate-400'>{info.label}</span>
                        <span className='mt-1 block break-words text-base font-semibold text-slate-800'>{info.value}</span>
                      </span>
                    </>
                  )
                  return info.url ? (
                    <a key={info.label} href={info.url} className='surface-card flex items-center gap-4 p-5 transition hover:border-teal-200'>{content}</a>
                  ) : (
                    <div key={info.label} className='surface-card flex items-center gap-4 p-5'>{content}</div>
                  )
                })}
              </div>
            </div>

            <div className='surface-card relative overflow-hidden bg-gradient-to-br from-cyan-50 to-teal-100 p-3'>
              <iframe
                title='Map showing Bap, Rajasthan'
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14171.957597229624!2d72.33879086822171!3d27.376046471982512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3940986999c5368f%3A0xd05bdfe1a1307ee2!2sBap%2C%20Rajasthan%20342307!5e0!3m2!1sen!2sin!4v1734771540898!5m2!1sen!2sin'
                className='h-[460px] w-full rounded-[1.25rem] border-0'
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              />
              <div className='absolute bottom-7 left-7 rounded-2xl bg-slate-950/90 px-5 py-4 text-white shadow-xl backdrop-blur'>
                <span className='block text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300'>Our location</span>
                <span className='mt-1 block text-base font-semibold'>{config.universal_references.address}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id='add-volunteer' className='scroll-mt-24 border-t border-slate-200 bg-white py-16 sm:py-20'>
        <div className='site-container'>
          <div className='mx-auto max-w-4xl'>
            <div className='mx-auto mb-10 max-w-2xl text-center'>
              <p className='section-kicker'>Volunteer with us</p>
              <h2 className='section-title mt-4'>Turn your time into lasting impact.</h2>
              <p className='mt-5 text-lg leading-8 text-slate-600'>Share a few details and our team will get in touch with you.</p>
            </div>
            <div className='surface-card p-6 sm:p-10'>
              <CreateVolunteer />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
