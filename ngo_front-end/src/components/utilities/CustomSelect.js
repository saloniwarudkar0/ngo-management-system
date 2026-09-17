import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-tailwindcss-select';

function CustomSelect(props) {
    const { placeholder, value, options, loading, onChange, isSearchable = false, isMultiple = false, disabled } = props
   
    const [customOptions, setCustomOptions] = useState([]);
    const [customValue, setCustomValue] = useState(undefined);
   
    useEffect(() => {
        Array.isArray(options) && setCustomOptions(options.map((option) => {
            return {
                value: option.id,
                label: option.name,
                ...option
            }
        }))
        // if (isMultiple) {
        //     if (value.length == 0) {
        //         setCustomValue(undefined)
        //     } else {
        //         Array.isArray(value) && setCustomValue(value.map((val) => {
        //           
        //             return {
        //                 value: val.id,
        //                 label: val.name,
        //                 ...val
        //             }
        //         }))
        //     }
        // } else {
        //      setCustomValue({ ...value, value: value?.name, label: value?.name })
        // }
   
    }, [options])
    useEffect(() => {
        if (isMultiple) {
            if (value.length == 0) {
                setCustomValue(undefined)
            } else {
                Array.isArray(value) && setCustomValue(value.map((val) => {
                 
                    return {
                        value: val.id,
                        label: val.name,
                        ...val
                    }
                }))
            }
        } else {
            if(value?.name==undefined  ){
         
                if(value=="" || value==null || value==undefined){
                    setCustomValue(undefined);
                }
                else{
                    setCustomValue({value: value, label: value})
                }
               
            }else{
            setCustomValue({ ...value, value: value?.name, label: value?.name })
            }
        }
    }, [value]) 

    const handleOnChange = (selectedOptions) => {
      
        if (isMultiple) {
            if (selectedOptions == null) {
                onChange([])
            } else {
                onChange(selectedOptions)
            }
        } else {
            onChange(selectedOptions)
        }

    }


    return (
        <div className='w-full'>
            <Select classNames={{ menu: 'absolute z-20 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700' }}
                placeholder={placeholder}
                value={value?.name==""?undefined:customValue}
                isDisabled={disabled}
                options={customOptions}
                loading={loading}
                id={props.id}
                isSearchable={isSearchable}
                onChange={handleOnChange}
                isMultiple={isMultiple}
            />
            <label for={props.id} className= 'absolute text-blue-600 translate-x-2 text-xs placeholder-shown:invisible    -translate-y-[45px] bg-white'>{props.label}</label>
        </div>
    )
}


export default CustomSelect
