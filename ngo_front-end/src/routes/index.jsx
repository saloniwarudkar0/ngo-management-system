import React from 'react'
import { Route } from 'react-router-dom'
import PageWrapper from './PageWrapper'

export const generateRoute = (routes) => routes.map((route) => {
  const element = (
    <PageWrapper state={route.child ? undefined : route.state}>
      {route.element}
    </PageWrapper>
  )

  if (route.path === '/') {
    return <Route index element={element} key={route.path} />
  }

  return (
    <Route path={route.path} element={element} key={route.path}>
      {route.child ? generateRoute(route.child) : null}
    </Route>
  )
})
