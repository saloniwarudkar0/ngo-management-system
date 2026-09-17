
import React, { useContext } from 'react'
import Modal from '../components/Modal/Modal'
import { ContextApp } from '../ContextAPI'

function Donate() {
  const { donateModal, setDonateModal } = useContext(ContextApp)

  const close = () => setDonateModal(!donateModal)

  return (
    <Modal toggle={close}>
      <div className='relative mx-4 max-h-[calc(100dvh-2rem)] w-[920px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-8 lg:p-10'>

        <button
          onClick={close}
          className='absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-700 sm:right-5 sm:top-5'
          aria-label='Close donation dialog'
        >
          ×
        </button>

        <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-x-10 lg:gap-y-7'>

          <div className='pr-12 lg:col-start-1 lg:row-start-1'>
            <p className='section-kicker'>
              Make every drop count
            </p>

            <h2 className='mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl'>
              Donate to restore water.
            </h2>
          </div>

          <div className='rounded-3xl bg-gradient-to-br from-cyan-50 to-teal-100 p-4 text-center sm:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center'>

            <p className='text-sm font-semibold uppercase tracking-[0.16em] text-teal-700'>
              Scan to contribute
            </p>

            {/* New Donation QR */}
            <img
              src='/donation-qr.png'
              alt='Donation QR code'
              className='mx-auto mt-4 max-h-[340px] w-full object-contain sm:max-h-[430px]'
            />

          </div>

          <div className='lg:col-start-1 lg:row-start-2'>

            <p className='mt-5 text-lg leading-8 text-slate-600'>
              Your contribution supports the restoration of natural water sources and helps create a more secure future for communities across Rajasthan.
            </p>

            <div className='mt-7 space-y-3 text-base text-slate-700'>

              {[
                'Support community-led restoration',
                'Protect habitats and local livelihoods',
                'Help build long-term water security'
              ].map((item) => (

                <div
                  key={item}
                  className='flex items-center gap-3'
                >
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700'>
                    ✓
                  </span>

                  {item}
                </div>

              ))}

            </div>

          </div>

        </div>
      </div>
    </Modal>
  )
}

export default Donate
