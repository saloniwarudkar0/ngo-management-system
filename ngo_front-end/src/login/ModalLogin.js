import React, {useContext} from 'react'
import Modal from '../components/Modal/Modal'
import Login from './Login'
import { ContextApp } from '../ContextAPI'




function ModalLogin() {

  const { loading, setLoading, role, loginModal, setLoginModal } = useContext(ContextApp);

  const toggleModal = () =>{
    setLoginModal(!loginModal)
  }

  return (
    <Modal toggle={toggleModal} >
        <Login />
    </Modal>
  )
}

export default ModalLogin