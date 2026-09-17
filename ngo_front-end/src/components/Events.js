import React, { useContext, useEffect, useState } from 'react'
import PageSpecificHeader from './PageSpecificHeader'
import EventCalendar from './EventCalendar'
import CreateEvent from './CreateEvent'
import { getEvents } from '../Actions/eventActions'
import { ContextApp } from '../ContextAPI'

function Events() {
  const { role = 'Public' } = useContext(ContextApp)
  const [events, setEvents] = useState([])
  const [toggleReload, setToggleReload] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getAllEvents = async () => {
      setLoading(true)
      const response = await getEvents()
      setEvents(response?.status ? response.events : [])
      setLoading(false)
    }
    getAllEvents()
  }, [openModal, toggleReload])

  return (
    <div className='bg-slate-50'>
      {openModal && <CreateEvent setInitialEvents={setEvents} initialEvents={events} onClose={() => setOpenModal(false)} />}
      <PageSpecificHeader name='Events' />

      <section className='py-16 sm:py-20'>
        <div className='site-container'>
          <div className='flex flex-col justify-between gap-8 lg:flex-row lg:items-end'>
            <div className='max-w-3xl'>
              <p className='section-kicker'>Come together</p>
              <h2 className='section-title mt-3'>A calendar for community action.</h2>
              <p className='mt-5 text-lg leading-8 text-slate-600'>
                Find upcoming restoration work, community gatherings, and awareness activities. Select an event to view its complete details.
              </p>
            </div>
            {role === 'Head-Volunteer' && (
              <button onClick={() => setOpenModal(true)} className='primary-button shrink-0'>Create an event</button>
            )}
          </div>

          <div className='surface-card mt-12 overflow-hidden p-4 sm:p-7 lg:p-9'>
            {loading ? (
              <div className='h-[560px] animate-pulse rounded-2xl bg-slate-100' aria-label='Loading events' />
            ) : (
              <EventCalendar INITIAL_EVENTS={events} toggleReload={toggleReload} setToggleReload={setToggleReload} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Events
