import React, { useState } from 'react';

function SelectValues(props) {
  
  const {label, items, setSelectedItem, selectedItem, disabled} = props;

  const handleChange = (event) => {
    setSelectedItem(event.target.value);
  };

  return (
    <>
    <div className=' relative w-full'>
      <select value={selectedItem} onChange={handleChange}
      disabled={disabled}
        className='block px-2.5 pb-2.5 pt-2 w-full text-gray-900 bg-transparent rounded-lg border border-blue-600 placeholder-shown:border-gray-500  dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 hover:border-gray-500 focus:border-blue-600 placeholder-transparent  peer'
      >
        {/* <option value="">Select a financial year</option> */}
        {items.map(item => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <label
        className="absolute text-blue-600 -translate-y-4 translate-x-1 px-2    duration-300 transform scale-75 top-2 z-10 origin-[0]  bg-white   peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4  rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto  select-none"
      >
        {label}
      </label>
      </div>
    </>
  );
}

export default SelectValues;