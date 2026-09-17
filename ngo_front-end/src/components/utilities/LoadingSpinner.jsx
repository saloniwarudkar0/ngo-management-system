import React from 'react'

export default function LoadingSpinner(props) {
  return (
    <div style={{height:'100vh'}} className=' flex items-center justify-center'>
    <div class=" w-12 h-12 rounded-full animate-spin border-2  border-solid border-green-500 border-t-transparent"></div>
    </div>
  )
}
