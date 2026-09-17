import React from "react";

const ModalCards = (props) => {
    return (
        <>
            <div className="block max-h-[680px] overflow-hidden relative bg-white border p-4 border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                <div className="flex items-center pb-2 justify-between w-full rounded-t dark:border-gray-600">
                   {props.header? (<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {props.header}
                    </h3>)
                    :''
                    }
                    {props.close?(<button onClick={props.close} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>)
                    :''
                    }
                </div>
                <div className="overflow-scroll overflow-x-hidden max-h-[450px] py-4">
                    {props.children}
                </div>
            </div>
        </>
    )
}

export default ModalCards;