import React, { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import './eventCalendar.css'
import ViewEvent from './ViewEvent'

function EventCalendar({ INITIAL_EVENTS, toggleReload, setToggleReload }) {
  const calendarRef = useRef(null)
  const [eventId, setEventId] = useState('')
  const [openViewModal, setOpenViewModal] = useState(false)

  const handleEventClick = ({ event }) => {
    setEventId(event.id)
    setOpenViewModal(true)
  }

  return (
    <div className='calendar-shell'>
      {openViewModal && (
        <ViewEvent
          eventId={eventId}
          onClose={() => setOpenViewModal(false)}
          toggleReload={toggleReload}
          setToggleReload={setToggleReload}
        />
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{ left: 'title', center: '', right: 'prev,next today' }}
        initialView='dayGridMonth'
        buttonText={{ today: 'Today' }}
        editable={false}
        selectable={false}
        dayMaxEvents={true}
        eventClick={handleEventClick}
        events={INITIAL_EVENTS}
        timeZone='Asia/Kolkata'
        height='auto'
      />
    </div>
  )
}

export default EventCalendar
