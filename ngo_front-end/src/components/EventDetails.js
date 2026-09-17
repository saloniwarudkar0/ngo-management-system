import React from 'react'
import Event from './Event'
import AddEventIcon from '../Icons/AddEventIcon'
import CloseIcon from '../Icons/CloseIcon'

function EventDetails(props) {
  const { setOpenModal, setEditMode, eventId, setDeleteMode } = props
  return (
    <div className=' rounded-lg overflow-hidden' >

      <div className='  px-2 bg-green-700 p-4  text-white flex flex-row justify-between items-center border-b-2'>
        <div className=' font-bold text-[16px] '> Event Details</div>
        <div className=' rounded-full p-2 hover:bg-gray-500 hover:bg-opacity-50 cursor-pointer ' onClick={() => { setOpenModal(false) }}><CloseIcon size={5} /></div>
      </div>
      <Event setOpenModal={setOpenModal} setEditMode={setEditMode} eventId={eventId} setDeleteMode={setDeleteMode}  />

    </div>
  )
}

export default EventDetails