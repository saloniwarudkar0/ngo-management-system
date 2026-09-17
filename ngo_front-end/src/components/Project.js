import React, { useEffect, useState, useContext } from 'react'
import { getProjectById } from '../Actions/projectActions'
import Carousel from './carousel'
import HandHoldingPencil from '../Icons/HandHoldingPencil'
import { DeleteIcon } from '../Icons/DeleteIcon'
import moment from 'moment/moment'
import { ContextApp } from '../ContextAPI'

function Project(props) {
  const {
    setOpenModal,
    setEditMode,
    projectId,
    setDeleteMode
  } = props

  const {
    role = 'Public'
  } = useContext(ContextApp)

  const [projectName, setprojectName] = useState('')
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSingleProjectById()
  }, [projectId])

  const getSingleProjectById = async () => {
    try {
      setLoading(true)

      const res = await getProjectById(projectId)

      console.log('PROJECT DETAILS RESPONSE:', res)

      if (res?.status) {
        const project = res?.project || {}

        console.log('PROJECT DATA:', project)

        setprojectName(project?.name || '')
        setStartDate(project?.start || '')
        setEndDate(project?.end || '')
        setDescription(project?.description || '')
        setAddress(project?.address || '')
        setImages(project?.images || [])
      } else {
        console.log('Unable to get project details')
      }
    } catch (error) {
      console.error('Error while getting project:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full'>

      <div className='flex h-full items-center justify-center'>

        <div className='w-full overflow-hidden bg-white'>

          {/* PROJECT IMAGE */}

          <div className='h-[400px]'>
            <Carousel
              height='h-[400px]'
              images={images}
            />
          </div>

          {/* PROJECT INFORMATION */}

          <div className='p-4 sm:p-6'>

            {/* PROJECT NAME + ACTIONS */}

            <div className='flex items-center gap-2'>

              <p className='mb-1 text-[22px] font-bold uppercase leading-7 text-gray-700'>
                {projectName}
              </p>

              {role === 'Head-Volunteer' && (

                <div className='flex items-center gap-2'>

                  {/* EDIT */}

                  <div
                    className='cursor-pointer rounded-full p-1 hover:bg-slate-300'
                    onClick={() => {
                      setEditMode(true)
                    }}
                  >
                    <HandHoldingPencil
                      className='size-4 fill-blue-700'
                    />
                  </div>

                  {/* DELETE */}

                  <div
                    className='cursor-pointer rounded-full p-1 hover:bg-slate-300'
                    onClick={() => {
                      setDeleteMode(true)
                    }}
                  >
                    <DeleteIcon className='size-4' />
                  </div>

                </div>

              )}

            </div>

            {/* DATE + ADDRESS */}

            <div className='flex flex-col-reverse'>

              {address && (
                <p className='mr-2 text-[17px] text-gray-700'>
                  {address}
                </p>
              )}

              {startDate && (
                <p className='text-[17px] font-bold text-[#1b7f5a]'>

                  {moment(startDate).format('DD/MMM/YYYY')}

                  {startDate !== endDate &&
                    endDate &&
                    ` - ${moment(endDate).format('DD/MMM/YYYY')}`}

                </p>
              )}

            </div>

            {/* DESCRIPTION */}

            <p className='mt-3 text-[15px] leading-7 text-gray-700'>
              {description}
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Project