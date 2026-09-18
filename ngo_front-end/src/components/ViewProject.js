import React, { useState, useContext } from 'react'
import Modal from './Modal/Modal'
import { deleteProject } from '../Actions/projectActions'
import WarningPage from './utilities/WarningPage'
import ProjectDetails from './ProjectDetails'
import CreateProject from './CreateProject'
import { ContextApp } from '../ContextAPI'

function ViewProject(props) {
  const {
    projectId,
    projectData,
    onClose,
    toggleReload,
    setToggleReload
  } = props

  const {
    loggedIn = true,
    role = 'Public',
    donateModal,
    setDonateModal,
    volunteerModal,
    setVolunteerModal
  } = useContext(ContextApp)

  const [editMode, setEditMode] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const deleteConfirmation = (confirmation) => {
    if (confirmation) {
      deleteProjectByID()
    } else {
      closeDeleteMode()
    }
  }

  const deleteProjectByID = async () => {
    const res = await deleteProject(projectId)

    console.log('project deleted', res)

    if (res?.status) {
      setEditMode(false)
      setDeleteMode(false)
      setToggleReload(!toggleReload)
      onClose()
    } else {
      setErrorMsg('Something went wrong')
    }
  }

  const closeDeleteMode = () => {
    setDeleteMode(false)
  }

  return (
    <Modal
      toggle={!deleteMode && !editMode ? onClose : undefined}
    >

      {!deleteMode ? (

        <div className='w-[90vw] max-w-5xl'>

          {!editMode ? (

            <ProjectDetails
              onClose={onClose}
              setEditMode={setEditMode}
              projectId={projectId}
              setDeleteMode={setDeleteMode}

              // Already available from Projects page
              // Prevents another API request
              projectData={projectData}
            />

          ) : (

            <CreateProject
              toggleReload={toggleReload}
              setToggleReload={setToggleReload}
              onClose={onClose}
              projectId={projectId}
              mode='Edit'
            />

          )}

        </div>

      ) : (

        <WarningPage
          targetFunction={deleteConfirmation}
          errorMsg={errorMsg}
        />

      )}

    </Modal>
  )
}

export default ViewProject