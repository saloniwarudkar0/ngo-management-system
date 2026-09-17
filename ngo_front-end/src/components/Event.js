import React, { useEffect, useState, useContext } from 'react'
import PageSpecificHeader from './PageSpecificHeader'
import AddEventIcon from '../Icons/AddEventIcon'
import Carousel from './carousel'
import { PencilIcon } from '../Icons/PencilIcon'
import { DeleteIcon } from '../Icons/DeleteIcon'
import HandHoldingPencil from '../Icons/HandHoldingPencil'
import { getEventById } from '../Actions/eventActions'
import moment from 'moment'
import { ContextApp } from '../ContextAPI'


function Event(props) {
  const { setOpenModal, setEditMode, eventId, setDeleteMode } = props
    const { loggedIn = true,   role = "Public", donateModal, setDonateModal, volunteerModal, setVolunteerModal } = useContext(ContextApp);


  const [eventName, setEventName] = useState('')
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [description, setDescription] = useState()
  const [address, setAddress] = useState();
  const [images, setImages] = useState([]);



  useEffect(() => {
    getSingleEventById()
  }, [])

  const getSingleEventById = async () => {
    const res = await getEventById(eventId);
    if (res.status) {
      const event = res?.event;
      setEventName(event.name);
      setStartDate(event.start);
      setEndDate(event.end);
      setDescription(event.description);
      setAddress(event.address);
      setImages(event.images);
    }
  }



  return (

    <div classNameName=' '>
      <div className='flex items-center justify-center h-full   '>
        <div className='w-full h-full    bg-white shadow-lg  overflow-hidden'>
          <div className='  '>

            {/* <img className='h-[236px] w-full  object-cover' src='https://img.freepik.com/free-photo/pasta-spaghetti-with-shrimps-sauce_1220-5072.jpg?w=2000&t=st=1678041911~exp=1678042511~hmac=e4aa55e70f8c231d4d23832a611004f86eeb3b6ca067b3fa0c374ac78fe7aba6' /> */}
            <div className=' h-[236px]'>
              <Carousel height='h-[236px]' images={images} />
            </div>
            <div className='p-4 sm:p-6'>
              <div className=' flex  items-center gap-2'>
                <p className='font-bold text-gray-700 text-[22px] leading-7 mb-1 uppercase'>{eventName}</p>
                {
                  role == 'Head-Volunteer' && 
                  <div className='flex  items-center gap-2'>
                <div className=' cursor-pointer hover:bg-slate-300 p-1 rounded-full' onClick={() => { setEditMode(true) }}> <HandHoldingPencil className={'size-4 fill-blue-700'} /> </div>
                <div className=' cursor-pointer hover:bg-slate-300 p-1 rounded-full' onClick={() => { setDeleteMode(true) }}>  <DeleteIcon className={'size-4'} /></div>
                </div>
                }
              </div>

              <div className='flex flex-col-reverse'>
                <p className='text-[#8b8bb199] text-[17px] mr-2 '>{address}</p>
                <p className='text-[17px] font-bold text-[#1b7f5a]'>
                  {moment(startDate).format('DD/MMM/YYYY')}
                  {startDate !== endDate && ` - ${moment(endDate).format('DD/MMM/YYYY')}`}
                </p>
              </div>
              <p className='text-[#7C7C80] font-[15px] mt-6 min-w-[350px] min-h-[200px] max-h-[300px] overflow-scroll'>
                {description}
                </p>


              {/* <a target='_blank' href='foodiesapp://food/1001' className='block mt-10 w-full px-4 py-3 font-medium tracking-wide text-center capitalize transition-colors duration-300 transform bg-[#FFC933] rounded-[14px] hover:bg-[#FFC933DD] focus:outline-none focus:ring focus:ring-teal-300 focus:ring-opacity-80'>
                View on foodies
              </a>
              <a target='_blank' href="https://apps.apple.com/us/app/id1493631471" className='block mt-1.5 w-full px-4 py-3 font-medium tracking-wide text-center capitalize transition-colors duration-300 transform rounded-[14px] hover:bg-[#F2ECE7] hover:text-[#000000dd] focus:outline-none focus:ring focus:ring-teal-300 focus:ring-opacity-80'>
                Download app
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default Event