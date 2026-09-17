import React, { useState } from 'react'
import { registerVolunteer } from '../Actions/volunteerActions'
import BlueTick from './BlueTick'

function CreateVolunteer({ disabled = false }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setSuccess(false)
    setErrorMsg('')
    setName('')
    setAddress('')
    setEmail('')
    setMobile('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const response = await registerVolunteer({
        name: name.trim(),
        address: address.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
      })
      if (response?.status) {
        setSuccess(true)
      } else {
        setErrorMsg(response?.error || 'We could not submit your details. Please try again.')
      }
    } catch (error) {
      setErrorMsg('We could not submit your details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className='flex flex-col items-center px-4 py-8 text-center'>
        <BlueTick />
        <h3 className='mt-5 text-2xl font-semibold text-slate-950'>Thank you for volunteering.</h3>
        <p className='mt-3 max-w-lg text-base leading-7 text-slate-600'>We have received your information and our team will be in touch soon.</p>
        <button onClick={resetForm} className='primary-button mt-7'>Register another volunteer</button>
      </div>
    )
  }

  const inputClasses = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-100'

  return (
    <form onSubmit={handleSubmit}>
      <div className='grid gap-6 sm:grid-cols-2'>
        <label className='text-sm font-semibold text-slate-700'>
          Full name <span className='text-teal-700'>*</span>
          <input className={inputClasses} value={name} onChange={(event) => setName(event.target.value)} disabled={disabled} required autoComplete='name' placeholder='Your name' />
        </label>
        <label className='text-sm font-semibold text-slate-700'>
          Mobile number <span className='text-teal-700'>*</span>
          <input className={inputClasses} value={mobile} onChange={(event) => setMobile(event.target.value)} disabled={disabled} required inputMode='tel' autoComplete='tel' placeholder='Your mobile number' />
        </label>
        <label className='text-sm font-semibold text-slate-700 sm:col-span-2'>
          Email address
          <input className={inputClasses} value={email} onChange={(event) => setEmail(event.target.value)} disabled={disabled} type='email' autoComplete='email' placeholder='you@example.com' />
        </label>
        <label className='text-sm font-semibold text-slate-700 sm:col-span-2'>
          Address
          <textarea className={`${inputClasses} min-h-[120px] resize-y py-3`} value={address} onChange={(event) => setAddress(event.target.value)} disabled={disabled} placeholder='Village, town, or city' />
        </label>
      </div>
      {errorMsg && <p className='mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700' role='alert'>{errorMsg}</p>}
      <div className='mt-7 flex justify-end'>
        <button type='submit' className='primary-button w-full sm:w-auto' disabled={loading || disabled}>
          {loading ? 'Sending…' : 'Send application'}
        </button>
      </div>
    </form>
  )
}

export default CreateVolunteer
