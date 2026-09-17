import React, { useContext, useEffect, useState } from 'react'
import appRoutes from '../routes/appRoutes'
import SideBarItem from './SideBarItem'
import { ContextApp } from '../ContextAPI'
import Notification from '../Notification'
import WarningPage from './utilities/WarningPage'
import ModalLogin from '../login/ModalLogin'
import Logo from './Logo'
import SidebarIcon from '../Icons/SidebarIcon'
import SideBarModalComponent from './SideBarModalComponent'

function SideNav() {
  const { role, loginModal, setLoginModal, loggedIn } = useContext(ContextApp)
  const [routes, setRoutes] = useState(appRoutes)
  const [warning, setWarning] = useState(false)
  const [sideBarModal, setSideBarModal] = useState(false)

  const logout = (permitted = false, getWarning = true) => {
    if (getWarning) {
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
      {loginModal && <ModalLogin />}
      <Notification />
      {warning && <WarningPage targetFunction={(permitted) => logout(permitted, false)} warningMsg='Are you sure you want to log out?' />}

      <nav className='sticky top-0 z-40 hidden border-b border-white/10 bg-slate-950/95 text-white shadow-lg shadow-slate-950/10 backdrop-blur lg:block'>
        <div className='site-container flex min-h-[64px] items-center justify-between gap-8'>
          <div className='text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300'>Water for every life</div>
          <ul className='flex items-center gap-1'>
            {routes.map((route) => (
              <li key={route.path}>
                <SideBarItem item={route} />
              </li>
            ))}
          </ul>
          <button
            onClick={() => loggedIn ? logout() : setLoginModal(true)}
            className='rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-300'
          >
            {loggedIn ? 'Log out' : 'Volunteer login'}
          </button>
        </div>
      </nav>

      <div className='fixed inset-x-0 top-0 z-40 block border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur lg:hidden'>
        <div className='flex h-16 items-center justify-between gap-3 px-4 sm:px-5'>
          <Logo compact />
          <button
            className='flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-900'
            onClick={() => setSideBarModal(!sideBarModal)}
            aria-label='Open navigation'
          >
            <SidebarIcon />
          </button>
          {sideBarModal && <SideBarModalComponent setSideBarModal={setSideBarModal} sideBarModal={sideBarModal} />}
        </div>
      </div>
    </>
  )
}

export default SideNav
