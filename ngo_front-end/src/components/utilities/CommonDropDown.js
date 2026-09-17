import React from 'react'

function CommonDropDown(props) {
  return (
   
    <>
    <div className="absolute w-fit z-10 mt-1  text-base list  bg-white divide-y divide-gray-100 rounded-lg shadow">
      <ul className=" overflow-y-hidden flex flex-col  " aria-labelledby="dropdownButton">
        {props.items.map((item, index) => (
        <li onClick={item.onClick} className=" cursor-pointer">
            {item.component}
        </li>
        ))}
      </ul>
    </div>
  </>
  )
}

export default CommonDropDown