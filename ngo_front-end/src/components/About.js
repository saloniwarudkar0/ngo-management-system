
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LeafIcon from '../Icons/LeafIcon'
import HeartIcon from '../Icons/HeartIcon'
import GiftIcon from '../Icons/GiftIcon'
import ThumbsUpIcon from '../Icons/ThumbsUpIcon'
import PersonAddIcon from '../Icons/PersonAddIcon'
import PageSpecificHeader from './PageSpecificHeader'
import { ContextApp } from '../ContextAPI'
import VolunteerList from '../Volunteer'
import VolunteerRequestList from '../Volunteer/VolunteerRequestList'
import { getProjects } from '../Actions/projectActions'
import { getVolunteers } from '../Actions/volunteerActions'

function About() {
  const { role = 'Public' } = useContext(ContextApp)
  const navigate = useNavigate()
  const [listReload, setListReload] = useState(false)
  const [roleListReload, setRoleListReload] = useState(false)
  const [totalProjectCount, setTotalProjectCount] = useState(0)
  const [totalVolunteerCount, setTotalVolunteerCount] = useState(0)

  useEffect(() => {
    setRoleListReload(true)
    const timer = setTimeout(() => setRoleListReload(false), 300)
    return () => clearTimeout(timer)
  }, [role])

  useEffect(() => {
    const loadImpact = async () => {
      const [projectsResponse, volunteersResponse] = await Promise.all([
        getProjects(),
        getVolunteers()
      ])

      if (projectsResponse?.status) {
        setTotalProjectCount(projectsResponse.projects?.length || 0)
      }

      if (volunteersResponse?.status) {
        setTotalVolunteerCount(volunteersResponse.volunteers?.length || 0)
      }
    }

    loadImpact()
  }, [])

  const features = [
    {
      number: '01',
      icon: <HeartIcon />,
      heading: 'Pond protection',
      text: 'Protect and restore ponds through careful cleaning and responsible local stewardship.'
    },
    {
      number: '02',
      icon: <LeafIcon />,
      heading: 'Green initiatives',
      text: 'Support healthier landscapes with planting and sustainable care.'
    },
    {
      number: '03',
      icon: <GiftIcon />,
      heading: 'Wildlife welfare',
      text: 'Safeguard habitats that depend on reliable natural water sources.'
    },
    {
      number: '04',
      icon: <ThumbsUpIcon />,
      heading: 'Community support',
      text: 'Work alongside people to create practical, lasting water solutions.'
    },
  ]

  const impact = [
    {
      number: totalProjectCount,
      icon: <HeartIcon className='size-9' />,
      text: 'Projects supported'
    },
    {
      number: totalVolunteerCount,
      icon: <PersonAddIcon className='size-10' />,
      text: 'Active volunteers'
    },
  ]

  const volunteers = [
    // Middle photo moved to first position
    {
      name: 'Dev Kishan',
      photo: '/dev_kishan.png',
      role: 'Head volunteer'
    },
    {
      name: 'Harish Paliwal',
      photo: '/harish.png',
      role: 'Senior volunteer'
    },
    {
      name: 'Bhagwandas Paliwal',
      photo: '/bhagwandas.png',
      role: 'Head volunteer'
    },
  ]

  return (
    <div className='bg-slate-50'>
      <PageSpecificHeader name='About Us' />

      <section className='py-16 sm:py-24'>
        <div className='site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20'>
          <div className='surface-card order-2 overflow-hidden bg-gradient-to-br from-cyan-100 to-teal-200 p-3 lg:order-1'>
            <img
              src='/water1.png'
              className='h-[380px] w-full rounded-[1.25rem] object-cover sm:h-[520px]'
              alt='A restored natural water source'
            />
          </div>

          <div className='order-1 lg:order-2'>
            <p className='section-kicker'>Who we are</p>

            <h2 className='section-title mt-4'>
              Water conservation rooted in community.
            </h2>

            <p className='mt-6 text-lg leading-8 text-slate-600'>
              We are dedicated to preserving water—the lifeline of our planet.
              We conserve rainwater, restore natural sources, and encourage
              practical habits that help every drop go further.
            </p>

            <p className='mt-4 text-lg leading-8 text-slate-600'>
              By working with communities, we aim to improve access to clean
              water and restore the balance between people and nature.
            </p>

            <button
              onClick={() => navigate('/contact-us#add-volunteer')}
              className='primary-button mt-8'
            >
              Join the mission
            </button>
          </div>
        </div>
      </section>

      <section className='pb-20 sm:pb-24'>
        <div className='site-container'>
          <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-4'>
            {features.map((feature) => (
              <article key={feature.number} className='surface-card p-6'>
                <div className='flex items-center justify-between'>
                  <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white'>
                    {feature.icon}
                  </span>

                  <span className='text-sm font-bold text-slate-300'>
                    {feature.number}
                  </span>
                </div>

                <h3 className='mt-6 text-lg font-semibold text-slate-950'>
                  {feature.heading}
                </h3>

                <p className='mt-3 text-base leading-7 text-slate-600'>
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='relative isolate overflow-hidden bg-slate-950 py-16 text-white'>
        <img
          className='absolute inset-0 -z-20 h-full w-full object-cover'
          src='/raj6.jpg'
          alt=''
        />

        <div className='absolute inset-0 -z-10 bg-slate-950/85' />

        <div className='site-container grid gap-8 sm:grid-cols-2'>
          {impact.map((item) => (
            <div
              key={item.text}
              className='flex items-center justify-center gap-5 rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur'
            >
              <span className='text-cyan-300'>
                {item.icon}
              </span>

              <span>
                <strong className='block text-4xl font-semibold'>
                  {item.number}
                </strong>

                <span className='mt-1 block text-base text-slate-300'>
                  {item.text}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className='py-20 sm:py-24'>
        <div className='site-container'>
          <div className='mx-auto max-w-3xl text-center'>
            <p className='section-kicker'>The people behind the work</p>

            <h2 className='section-title mt-4'>
              Meet our volunteers.
            </h2>

            <p className='mt-5 text-lg leading-8 text-slate-600'>
              Our volunteers bring local knowledge, time, and care to every
              restoration effort.
            </p>
          </div>

          <div className='mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3'>
            {volunteers.map((volunteer) => (
              <article
                key={volunteer.name}
                className='surface-card overflow-hidden text-center'
              >
                <div className='relative flex h-64 items-end justify-center bg-gradient-to-b from-cyan-50 to-teal-100 px-6'>
                  <img
                    src={volunteer.photo}
                    className='h-[92%] max-w-full object-contain object-bottom'
                    alt={volunteer.name}
                  />
                </div>

                <div className='p-5'>
                  <h3 className='text-lg font-semibold text-slate-950'>
                    {volunteer.name}
                  </h3>

                  <p className='mt-1 text-sm text-slate-500'>
                    {volunteer.role}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className='mt-16'>
            {!roleListReload && (
              <VolunteerList
                listReload={listReload}
                setListReload={setListReload}
              />
            )}

            {role === 'Head-Volunteer' && (
              <VolunteerRequestList
                listReload={listReload}
                setListReload={setListReload}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
