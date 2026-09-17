import React, { useContext, useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import { ContextApp } from './ContextAPI'
import appRoutes from './routes/appRoutes'
import { generateRoute } from './routes'

function App() {
  const { role = 'Public' } = useContext(ContextApp)
  const routes = useMemo(() => {
    const availableRoutes = appRoutes.filter((route) => route.role?.includes(role))
    return generateRoute(availableRoutes)
  }, [role])

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          {routes}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
