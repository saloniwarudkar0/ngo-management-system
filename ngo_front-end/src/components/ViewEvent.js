import React, { useEffect, useState } from 'react'
import Modal from './Modal/Modal';
import { deleteEvent, getEventById } from '../Actions/eventActions';
import EventDetails from './EventDetails';
import CreateEvent from './CreateEvent';
import WarningPage from './utilities/WarningPage';

function ViewEvent(props) {
  const { eventId, onClose,  toggleReload, setToggleReload} = props;

  const [eventName, setEventName] = useState('')
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [description, setDescription] = useState()
  const [address, setAddress] = useState()


  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const [errorMsg, setErrorMsg] = useState('')

  const deleteConfirmation = (confirmation) => {
    if (confirmation) {
      deleteEventByID(); // Only called when confirmation is true
    } else {
      closeDeleteMode(); // Only called when confirmation is false
    }
  };


  const deleteEventByID = async () => {
    const res = await deleteEvent(eventId);
    console.log("event deleted", res);
    if (res?.status) {
      console.log("res of k")
      setEditMode(false);
      setDeleteMode(false);
      setToggleReload(!toggleReload);
      onClose();
    }else{
      setErrorMsg("Something went wrong")
    }

  }

  const closeDeleteMode = () =>{
    console.log("closeing delete mode")
    setDeleteMode(false)
  }



  useEffect(() => {
    getSingleEventById()
  }, [])

  const getSingleEventById = async () => {
    const res = await getEventById(eventId);
  }
  return (
    <Modal toggle={!deleteMode && !editMode ? onClose : undefined}>
      {!deleteMode ? <div className=' max-w-[400px]  '>
        {!editMode ? <EventDetails setOpenModal={onClose} setEditMode={setEditMode} eventId={eventId} setDeleteMode={setDeleteMode}  /> : <CreateEvent onClose={onClose} eventId={eventId} mode={'Edit'} />}
      </div>
        :
        <WarningPage targetFunction={deleteConfirmation} errorMsg={errorMsg}  />
      }

    </Modal>
  )
}

export default ViewEvent