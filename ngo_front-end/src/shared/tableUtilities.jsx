import React from "react"
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce, useSortBy, usePagination, useRowSelect } from 'react-table'
import { classNames } from './Utils'
import { getDownloadableUrl } from "../Actions/fileActions"
import blank_img from '../components/utilities/blank.jpg'
import { useMediaQuery } from 'react-responsive';



export const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
        )
    }
)


// Define a default UI for filtering
export function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
}) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)

    }, 200)

    return (
        <div class="">
            <label htmlFor="table-search" class="sr-only">Search</label>
            <div class="relative  w-fit">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"></path>
                    </svg>
                </div>
                <input
                    type="text"
                    id="table-search"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Search for items "
                    value={value || ""}
                    onChange={e => {
                        setValue(e.target.value);
                        onChange(e.target.value);
                    }}
                />
            </div>
        </div>
    )
}

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
        const options = new Set()
        preFilteredRows.forEach(row => {
            if (row.values[id] === '-') return
            options.add(row.values[id])
        })
        return [...options.values()]
    }, [id, preFilteredRows])

    // Render a multi-select box
    return (
        <>

            {/* <span className="text-gray-700"> </span> */}
            <select
                className="bg-gray-50 border  border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                name={id}
                id={id}
                value={filterValue}
                onChange={e => {
                    setFilter(e.target.value || undefined)
                }}
            >
                <option value="">All</option>
                <option value="-">Non-Group</option>
                {options.map((option, i) => (
                    <option key={i} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <label
                for={id}
                className="absolute text-blue-600 translate-x-3 text-xs    -translate-y-[50px] bg-slate-100"
            >{render("Header")}</label>
        </>
    )
}

export function SmartIntegrationPill({ value, row, column }) {

    const status = value?'Enabled':'Disabled'
    // const status = row.original[column.imgAccessor]

    return (
        <span
            className={
                classNames(
                    "px-3 py-1  leading-wide  text-xs rounded-full shadow-sm",
                    status.startsWith("Enabled") ? "bg-green-100 text-green-800" : null,
                    status.startsWith("Disabled") ? "bg-red-100 text-red-800" : null
                )
            }
        >
            {status}
        </span>
    );
};

export const shortenNameCell = ({ value, row, column }) => {
    const maxLength = 50; // Define the maximum length of the name before shortening
    if (value.length > maxLength) {
        return value.substring(0, maxLength) + '...'; // Shorten and add "..."
    }
    return value; // Return the full name if it's within the maxLength
};


export function StatusPill({ value, row, column }) {

    const status = value
    // const status = row.original[column.imgAccessor]

    return (
        <span
            className={
                classNames(
                    "px-3 py-1  leading-wide  text-xs rounded-full shadow-sm",
                    status.startsWith("Benign") ? "bg-green-100 text-green-800" : null,
                    status.startsWith("User") ? "bg-yellow-100 text-yellow-800" : null,
                    status.startsWith("Malicious") ? "bg-red-100 text-red-800" : null,
                    status.startsWith("Admin")? "bg-blue-100 text-[#554713] uppercase" : null,
                    status.startsWith("Logged Out")? "bg-[#f6d8b3] text-[#df4936]" : null,
                    status.startsWith("Logged In")? "bg-[#e2dfed] text-[#30ad47]" : null,
                    status.startsWith("active")? "bg-[#F0F6FF] text-[#005CE8] uppercase" : null,
                    status.startsWith("expired")? "bg-[#f6d8b3] text-[#df4936] uppercase" : null,
                    status.startsWith("stock-admin")? "bg-[#e2dfed] text-[#30ad47] uppercase" : null,
                    status.startsWith("payment-admin")? "bg-[#F0F6FF] text-[#005CE8] uppercase" : null,
                )
            }
        >
            {status}
        </span>
    );
};


const getFiledownload = async (url) => {
    const response = await getDownloadableUrl(url);
    const presignedUrl = response.url;

    const res = await fetch(presignedUrl);
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const filename = url.split('/').pop();  // Extracts filename from key
    link.setAttribute('download', filename);  // Forces download of the blob
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
}

export const ModifiedStatusCell = ({ value, row, column }) =>{
    let status = ''
    // const status = row.original[column.imgAccessor]
    if (value){
        status = value
    }else{
        status = '-'
    }
    return  value?(
        <span
            className={
                classNames(
                    "px-3 py-1  leading-wide  text-xs rounded-full shadow-sm",
                    status.startsWith("Benign") ? "bg-green-100 text-green-800" : null,
                    status.startsWith("User") ? "bg-yellow-100 text-yellow-800" : null,
                    status.startsWith("Malicious") ? "bg-red-100 text-red-800" : null,
                )
            }
        >
            {status}
        </span>
    )
    :
    (
        <div>
           { status}
        </div>
    )
    ;
}


export function AvatarCell({ value, column, row }) {
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const isTablet = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
    const isMobile = useMediaQuery({ maxWidth: 639 });

    return (
        <div className="flex items-center">
            {(row.original[column.imgAccessor] && row.original[column.imgAccessor]!=='') && <div className="flex-shrink-0 h-10 w-10 hidden sm:block">
                <img className="h-10 w-10 rounded-full" src={row.original[column.imgAccessor]==''?blank_img:row.original[column.imgAccessor]} alt="" />
            </div>}
            {( row.original[column.imgAccessor]=='') && <div className="flex-shrink-0 h-10 w-10 hidden sm:block">
                <img className="h-10 w-10 rounded-full" src={blank_img} alt="" />
            </div>}

            <div className="sm:ml-4 flex-grow">
                <div className="text-sm font-medium text-gray-900 hidden sm:block  truncate pointer" >
                    {
                        row.original.s3_url ? <a
                            href={row.original.s3_url}
                            download={row.original.s3_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" cursor-pointer"
                            onClick={() =>{}}
                        >
                            {value}
                        </a> 
                        : 
                        <a 
                        href = {`/Organisations/users?id=${row.original._id}`}
                        onClick={()=>{console.log("clicked")}}
                        >
                            {value}
                        </a>
                    }
                </div>
                {/* <div className="text-sm font-medium text-gray-900  sm:hidden  truncate pointer" >
                    {
                        row.original.s3_url ? <a
                            href={row.original.s3_url}
                            download={row.original.s3_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" cursor-pointer"
                            onClick={() =>{}}
                        >
                           {value?.length <= 20 ? value : value.slice(0, 20) + '...'}
                        </a> 
                        : 
                        <a 
                        href = {`/files?id=${row.original._id}`}
                        onClick={()=>{console.log("clicked")}}
                        >
                          {value?.length <= 20 ? value : value.slice(0, 20) + '...'}
                        </a>
                    }
                </div> */}
                {/* <a href = {`/files?id=${row.original._id}`} className="text-sm font-medium text-gray-900  sm:hidden truncate " >{value?.length <= 20 ? value : value.slice(0, 20) + '...'}</a> */}
                <div className="text-sm text-gray-500 hidden lg:block">{row.original[column.emailAccessor]}</div>
                <div className="text-sm text-gray-500 lg:hidden" >
                    {row.original[column.firstAccessor]} {row.original[column.secondAccessor] ? ' | ' : ''} {row.original[column.secondAccessor]} {row.original[column.thirdAccessor] ? ' | ' : ''} {row.original[column.thirdAccessor]}
                </div>
            </div>
        </div>
    )
}


export function ProductAvatarCell({ value, column, row }) {
    return (
        <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
                <img className="h-10 w-10 rounded-lg" src={row.original[column.imgAccessor]} alt="" />
            </div>
            <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{row.original[column.emailAccessor]}</div>
            </div>
        </div>
    )
}


export function CustomValues({ value, column, row }) {

    return (
        <div>{value}</div>
    )
}


export function ArrayPills({ value, column, row }){
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400', 'bg-purple-400', 'bg-cyan-400'];

    // Function to get color based on index or content
    const getColor = (index) => {
        return colors[index % colors.length]; // Cycle through colors
    };

    return(
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {value?.map((item, index) => (
                <div key={index} className={` ${getColor(index)} px-3 py-1  leading-wide  text-xs rounded-full shadow-sm  text-white `} >
                    {item.stock_type_name}
                </div>
            ))}
        </div>
    );

}


export function objectRenderColumnvalues ({ value, column, row }){
    console.log("Here is the column and row to see possibilities ", value, column, row)
    const accessor = column?.diplayValue;
    return (
        <div className=" text-xs text-gray-500">
           {value[accessor]}
        </div>
    )
}

