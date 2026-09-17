import React, { useContext } from 'react'
import { ContextApp } from '../ContextAPI'
import { Link, useLocation } from 'react-router-dom'
import { classNames } from './utilities/utilityFunctions'

function SideBarItem({ item, setSideBarModal, className, showSidebarIcon = false }) {
  const { appState } = useContext(ContextApp)
  const location = useLocation()

  const handleNavigation = () => {
    setSideBarModal?.(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!item.sidebarProps || !item.path) return null

  const isActive = appState === item.state

  return (
    <Link
      to={!isActive ? item.path : location.pathname + location.search}
      className={className || `block rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-white/10 text-cyan-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
      onClick={handleNavigation}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={classNames(item.state === 'donate' ? 'text-white' : 'flex items-center gap-3')}>
        {showSidebarIcon && item.sidebarProps.sidebarIcon}
        {item.sidebarProps.icon}
      </span>
    </Link>
  )
}

export default SideBarItem
