import React, { useState } from 'react'

const Switcher = (props) => {
    const { label, value, onChange, disabled } = props
    //   const [isChecked, setIsChecked] = useState(false)


    const handleCheckboxChange = () => {
        onChange(!value)
    }

    return (
        <div className=''>
            <label className='autoSaverSwitch relative inline-flex cursor-pointer select-none items-center gap-2'>
                <span className='label flex items-center text-sm font-medium text-black'>
                    {label}
                </span>
                <input
                    type='checkbox'
                    name='autoSaver'
                    disabled={disabled}
                    className='sr-only'
                    checked={value}
                    onChange={handleCheckboxChange}
                />
                <span
                    className={`slider mr-3 flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200 ${value ? ' bg-blue-600' : 'bg-[#CCCCCE]'
                        }`}
                >
                    <span
                        className={`dot h-[18px] w-[18px] rounded-full bg-white duration-200 ${value ? 'translate-x-6' : ''
                            }`}
                    ></span>
                </span>

            </label>
        </div>
    )
}

export default Switcher
