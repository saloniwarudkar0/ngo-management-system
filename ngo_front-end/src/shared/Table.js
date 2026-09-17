import React, { useState, useEffect, useContext } from 'react'
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce, useSortBy, usePagination, useRowSelect, actions } from 'react-table'
import { ChevronDoubleLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/solid'
import { Button, PageButton } from './Button'

import { SortIcon, SortUpIcon, SortDownIcon } from './Icons'
import { IndeterminateCheckbox, GlobalFilter } from './tableUtilities'
import RowActions from './RowActions'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { DeleteIcon } from '../Icons/DeleteIcon';
import LoadingSpinner from '../components/utilities/LoadingSpinner'
import { Toaster, ToastIcon, toast, resolveValue } from "react-hot-toast";
import Notification from '../Notification'
import { ContextApp } from '../ContextAPI'


function Table(props) {
    // Use the state and functions returned from useTable to build your UI
    const [modal, setModal] = useState(false);
    const [tableLoading, setTableLoading] = useState(false)
    const location = useLocation();
    const { ModalLoadedComponent, ModalUser={}, doubleModalDisable = false, columns = [], Actions = [], deleteMultipleRows, data = [], enableRowSelect = false, enableActions = true, enableGlobalSearch = false, enableCreateRow = false, emptyTableMessage = "No Data to Show...", postUrls = `${location.pathname}${location.search!=''?(location.search+'&'):'?'}openModal=true`, addNewElement,  hideColums=[]} = props

    const [initials, setInitials] = useState([]);

    const {role} = useContext(ContextApp);

    console.log("data from table", data)

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const modalState = Boolean(searchParams.get('openModal'));
    // const doubleModalState = Boolean(searchParams.get(''));

    const notification = (msg, type) => {
        toast[type](msg)
    }

    useEffect(() => {
        if (modalState) {
            setModal(true)
        } else {
            setModal(false)
        }
    }, [location])

    useEffect(() => {
        setTableLoading(true);
        const temp = [...hideColums]
        if (!enableRowSelect) {
            temp.push("selection");

        }

        if (!enableActions) {
            temp.push("actions")
        }
        setInitials(temp)
        setHiddenColumns(temp)
        setTableLoading(false);
    }, [location])

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        selectedFlatRows,
        state,
        preGlobalFilteredRows,
        setGlobalFilter,
        setHiddenColumns
    } = useTable({
        columns,
        data,
        initialState: { hiddenColumns: initials,  },
    },

        useFilters, // useFilters!
        useGlobalFilter,
        useSortBy,
        usePagination,  // new
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        (<div>

                         <span className=''>   <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} /> </span>
                        </div>)
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({ row }) => (
                        <div onClick={() => {

                        }}>
                          <span className=''> <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> </span> 
                        </div>
                    ),
                    disableSortBy: true,
                },
                ...columns,
                {
                    id: 'actions',
                    Header: '',
                    Cell: ({ row }) => (
                        <div>
                            <RowActions Actions={Actions} row={row} />
                        </div>
                    ),
                    disableSortBy: true,
                }
            ])
        }
    )




    // Render the UI for your table
    const table = (
        <>
            <Notification />
            {modal && !doubleModalDisable ? <ModalLoadedComponent modalUser={ModalUser} notification={(msg, type) => { notification(msg, type) }} close={() => { setModal(false) }} /> : ''}
            <div className=' flex justify-between overflow-hidden items-center '>
                {enableGlobalSearch ? (<div className="sm:flex sm:gap-x-2  items-center ml-5 my-3">
                    <GlobalFilter
                        preGlobalFilteredRows={preGlobalFilteredRows}
                        globalFilter={state.globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                    {headerGroups.map((headerGroup) =>
                        headerGroup.headers.map((column) =>
                            column.Filter ? (
                                <div className=" min-w-[255px] " key={column.id}>
                                    {column.render("Filter")}
                                </div>
                            ) : null
                        )
                    )}
                    {/* This snippet can render multiple select component based on value passed from header group   */}

                </div>) : ""}
                {enableCreateRow & role=='Admin' ? (
                    <div className='mr-5'>
                    <Button onClick={() => { navigate(postUrls) }}  >
                        <span className=' my-1'> {addNewElement} </span>
                    </Button>
                    </div>
                    ) 
                    : ''}
            </div>
            {/* table */}


            <div className="   flex flex-col">
                {/* multiple delete icon */}
                {selectedFlatRows.length ? (
                    <div className=' bg-red-200 rounded-sm flex flex-row justify-end pr-6'>
                        <div className=' flex flex-row cursor-pointer select-none' onClick={() => { deleteMultipleRows(selectedFlatRows) }}>
                            <DeleteIcon />({selectedFlatRows.length})
                        </div>
                    </div>) : ''}
                {/* table start */}
                <div className="flex flex-col ">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow-sm overflow-hidden border-b border-gray-200 ">
                                <table className="min-w-full  text-[10px]">
                                    <thead className="bg-[#F5F6F7]">
                                        {headerGroups.map(headerGroup => (
                                            <tr {...headerGroup.getHeaderGroupProps()}>
                                                {headerGroup.headers.map(column => (
                                                    // Add the sorting props to control sorting. For this example
                                                    // we can add them into the header props
                                                    <th
                                                        scope="col"
                                                        className="group px-6 py-2 text-left  font-medium text-gray-500 uppercase tracking-wider"
                                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                           <span className=' '> {column.render('Header')}</span>
                                                            {/* Add a sort direction indicator */}
                                                            <span className={column.disableSortBy ? " hidden" : ""}>
                                                                {column.isSorted
                                                                    ? column.isSortedDesc
                                                                        ? <SortDownIcon className="w-4 h-4 text-gray-400" />
                                                                        : <SortUpIcon className="w-4 h-4 text-gray-400" />
                                                                    : (
                                                                        <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                                                    )}
                                                            </span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {page?.map((row, i) => {  // new
                                            prepareRow(row)
                                            return (
                                                <tr {...row.getRowProps()} id={i}>
                                                    {row.cells.map(cell => {
                                                        return (
                                                            <>
                                                                <td
                                                                    {...cell.getCellProps()}
                                                                    className="px-[5%] sm:px-6 py-4  "
                                                                    role="cell"
                                                                    id={i}
                                                                >
                                                                    {cell.column.Cell.name === "defaultRenderer"
                                                                        ? <div className="text-[12px] text-gray-500 ">{cell.render('Cell')}</div>
                                                                        :  <div className="text-[12px] text-gray-700 "> {cell.render('Cell')}</div>
                                                                    }
                                                                </td>
                                                            </>
                                                        )
                                                    })}

                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                {page.length == 0 ? <div className='text-center select-none p-5 text-xl italic text-gray-400'>{emptyTableMessage}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Pagination */}
            <div className="py-3 px-6 flex items-center justify-between ">
                <div className="flex-1 flex justify-between sm:hidden">
                    <Button onClick={() => previousPage()} disabled={!canPreviousPage}>Previous</Button>
                    <Button onClick={() => nextPage()} disabled={!canNextPage}>Next</Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex gap-x-2 items-baseline">
                        <span className="text-sm text-gray-700">
                            Page <span className="font-medium">{state.pageIndex + 1}</span> of <span className="font-medium">{pageOptions.length}</span>
                        </span>
                        <label>
                            <span className="sr-only">Items Per Page</span>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={state.pageSize}
                                onChange={e => {
                                    setPageSize(Number(e.target.value))
                                }}
                            >
                                {[15, 25, 35, 50].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>
                                        Show {pageSize}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <PageButton
                                className="rounded-l-md"
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                            >
                                <span className="sr-only">First</span>
                                <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </PageButton>
                            <PageButton
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </PageButton>
                            <PageButton
                                onClick={() => nextPage()}
                                disabled={!canNextPage
                                }>
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </PageButton>
                            <PageButton
                                className="rounded-r-md"
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}
                            >
                                <span className="sr-only">Last</span>
                                <ChevronDoubleRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </PageButton>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    )
    return tableLoading ? <LoadingSpinner /> : table;
}

export default Table; 