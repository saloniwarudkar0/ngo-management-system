import React from 'react'

function Tabs(props) {
    const {tabs, activeTab} = props

  return (
<div class="text-sm font-medium text-center  text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
    <ul class="flex flex-wrap -mb-px">
        {tabs.map((tab, index) => (
            <li class="-mb-px">
                <a  class={`inline-block p-4 border-b-2  rounded-t-lg transition-colors duration-300 ease-in-out transform   ${activeTab === tab.id ? 'text-blue-600 hover:text-blue-600 hover:border-blue-600  border-blue-600 ' : 'hover:text-gray-600 hover:border-gray-300'}`} onClick={() => tab.onClick()}>{tab.name}</a>
            </li>
        ))}
        {/* <li class="me-2">
            <a href="#" class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Profile</a>
        </li>
        <li class="me-2">
            <a href="#" class="inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500" aria-current="page">Dashboard</a>
        </li> */}
       
    </ul>
</div>

  )
}

export default Tabs