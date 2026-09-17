import React, { useContext, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { ContextApp } from '../ContextAPI'
import SideNav from './SideNav'
import ExtraHeader from './utilities/ExtraHeader'
import Footer from './Footer'
import CreateVolunteer from '../Volunteer/CreateVolunteer'
import Donate from '../Donate'

function MainLayout() {
  const { donateModal, volunteerModal } = useContext(ContextApp)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      {volunteerModal && <CreateVolunteer />}
      {donateModal && <Donate />}
      <div className='flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50'>
        <div className='z-10 hidden lg:block'><ExtraHeader /></div>
        <SideNav />
        <main className='w-full flex-1 pt-16 lg:pt-0'>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default MainLayout
