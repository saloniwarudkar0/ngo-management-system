import React, { useContext, useEffect, useState } from 'react'
import Modal from './Modal/Modal'
import CloseIcon from '../Icons/CloseIcon'
import appRoutes from '../routes/appRoutes'
import SideBarItem from './SideBarItem'
import { ContextApp } from '../ContextAPI'
import SocialMedia from './SocialMedia'
import WarningPage from './utilities/WarningPage'
import Logo from './Logo'
import { config } from '../Config'

function SideBarModalComponent({ setSideBarModal }) {
  const { role, setLoginModal, loggedIn, setDonateModal } = useContext(ContextApp)
  const [routes, setRoutes] = useState(appRoutes)
  const [warning, setWarning] = useState(false)

  const close = () => setSideBarModal(false)

  const logout = (permitted = false, requestWarning = true) => {
    if (requestWarning) {
      setWarning(true)
      return
    }
    if (permitted) {
      localStorage.clear()
      window.location.reload()
    }
    setWarning(false)
  }

  useEffect(() => {
    setRoutes(appRoutes.filter((route) => route.role?.includes(role)))
  }, [role])

  return (
    <>
      {warning && <WarningPage targetFunction={(permitted) => logout(permitted, false)} warningMsg='Are you sure you want to log out?' />}
      <Modal toggle={close} className='fixed inset-0 flex justify-end overflow-hidden lg:hidden'>
        <aside className='relative h-full w-[88vw] max-w-[390px] overflow-y-auto bg-slate-950 px-6 pb-8 pt-6 text-white shadow-2xl'>
          <div className='flex items-center justify-between'>
            <Logo inverse />
            <button onClick={close} className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white' aria-label='Close navigation'>
              <CloseIcon />
            </button>
          </div>

          <div className='mt-10 rounded-3xl border border-white/10 bg-white/5 p-5'>
            <p className='text-sm font-semibold text-cyan-300'>Help restore Rajasthan's water sources.</p>
            <div className='mt-4 flex gap-3'>
              <button onClick={() => { setDonateModal(true); close() }} className='rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white'>Donate</button>
              <a href={`tel:${config.universal_references.phone_number}`} className='rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200'>Call us</a>
            </div>
          </div>

          <nav className='mt-10' aria-label='Mobile navigation'>
            <p className='px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>Explore</p>
            <ul className='mt-4 space-y-2'>
              {routes.map((route) => (
                <li key={route.path}><SideBarItem setSideBarModal={setSideBarModal} item={route} showSidebarIcon /></li>
              ))}
            </ul>
          </nav>

          <div className='mt-8 border-t border-white/10 pt-8'>
            <button
              onClick={() => {
                if (loggedIn) logout()
                else { setLoginModal(true); close() }
              }}
              className='w-full rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-slate-200'
            >
              {loggedIn ? 'Log out' : 'Volunteer login'}
            </button>
            <div className='mt-8'>
              <p className='mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>Stay connected</p>
              <SocialMedia inverse />
            </div>
          </div>
        </aside>
      </Modal>
    </>
  )
}

export default SideBarModalComponent
