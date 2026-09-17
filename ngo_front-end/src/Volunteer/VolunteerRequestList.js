import React, { useEffect, useMemo, useState, useCallback, useContext } from 'react'
import Table from '../shared/Table'
import { AvatarCell, SelectColumnFilter, StatusPill,SmartIntegrationPill } from "../shared/tableUtilities"
import { DeleteIcon } from '../Icons/DeleteIcon';
import { PencilIcon } from '../Icons/PencilIcon';
import EyeIcon from '../Icons/EyeIcon';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { deleteUser, getAllUsers } from '../Actions/userAction';
import loadable from '@loadable/component'
import { useMediaQuery } from 'react-responsive';
import Notification from '../Notification';
import { Toaster, ToastIcon, toast, resolveValue } from "react-hot-toast";
import WarningPage from '../components/utilities/WarningPage';
import { getItem } from '../login/storageService';
import { ContextApp } from '../ContextAPI';
import TableWrapper from '../shared/TableWrapper';
import { authorizeVolunteer, deleteVolunteer, getVolunteerRequestList, getVolunteers } from '../Actions/volunteerActions';
import TickIcon from '../Icons/TickIcon';
import CrossIcon from '../Icons/CrossIcon';



const CreateUser = loadable(() => import('./ModifyVolunteer'));
// const CreateUser = <div>hii</div>
// const role = getItem('role');
// console.log("role in all-users", role)
function VolunteerRequestList(props) {
    const { listReload, setListReload } = props
  const navigate = useNavigate();
  const location = useLocation();

  // const loggedIn = getItem('loggedIn');
  // if(loggedIn!=true){

  //   navigate('/login')
  // }
  // console.log("role in all-users", role)
  const {role} = useContext(ContextApp)
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isTablet = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
  const isMobile = useMediaQuery({ maxWidth: 639 });

  const [warning, setWarning] = useState(false);

  const [deleteConfig, setDeleteConfig] = useState(undefined);

  const [loading, setLoading] = useState(true);

  // const n = getData();
  const [data, setData] = useState([]);
  const memoData = useMemo(() => { return data }, [data])

  useEffect(() => {
    console.log("location", location)
    getAllusersList();
  }, [location, listReload])

  

  const getAllusersList = async () => {
    // This function call API function from ACTIONS.
    setLoading(true)
    const response = await getVolunteerRequestList();
    console.log("response to check token ", response)
    if (response) {
      // if(response.message == 'Token is invalid!')
      //   {
      //     navigate('/login')
      //   }
      if(response?.status){
        setData(response?.volunteers);
        notification("Volunteer list fetched successfully", "success")
      }else{
        notification("Volunteer list fetch failed", "error")
      }
     
    }
    setLoading(false)

  }

  useEffect(()=>{
    console.log("checking role", role )
    // if(role != 'Admin'){
    //   navigate('/files')
    // }
    
  },[role, location])


  const commonAction = async (actionName, dataId, confirmation = false, openWarning = true ) => {
    if (actionName == 'delete') {
      if (openWarning) {
        setDeleteConfig({dataId, commonAction:true})
        setWarning(true);
        return;
      }
      if (confirmation) {
      // const newData = kData.filter((d1)=>{return !(d1.id==dataId)});
      // const temp_user = data.find((d1) => { return d1._id == dataId });
      // console.log("temp_user", temp_user)
      // const fileName = temp_user?.name + '-' + temp_user?._id;
      // console.log("fileName", fileName)
      const response = await deleteVolunteer(dataId);
      
      if (response?.status) {
        setData((prev) => prev.filter((d1) => { return !(d1.id == dataId) }));
        notification('Volunteer Deleted Successfully', 'success')
        setListReload(!listReload)

      } else {
        notification('Volunteer Not Deleted', 'error')
      }
    }
      // pData = newData;

    }
    if (actionName == 'view' || actionName == 'edit') {
      const postUrls = `${location.pathname}?openModal=true&mode=${actionName}&id=${dataId}`
      navigate(postUrls)
    }

    if (actionName == 'accept')
    {
        const response = await authorizeVolunteer(dataId);
        if (response?.status) {
            setListReload(!listReload)
            notification('Volunteer Authorized Successfully', 'success')
        }else{
            notification('Something Went Wrong, action: Authorize', 'error')
        }
    }
  }


  const columns = React.useMemo(() => [
    {
      Header: "Name",
      accessor: 'name',

      // Cell: AvatarCell,
      // imgAccessor: "image",
      // emailAccessor: "email",
      // secondAccessor: 'city',
      // mobileAccessor: 'mobile',
      // firstAccessor: 'role',
      // thirdAccessor: 'organisation'
    },
    // {
    //   id: 'city',
    //   Header: "City",
    //   accessor: 'city',
    // },
    {
      id: 'mobile',
      Header: "Mobile No.",
      accessor: 'mobile',
    },
    {
      id:'password',
      Header: "Password",
      accessor: 'password',
    },
    // {
    //   id: 'organisation',
    //   Header: "Organisation",
    //   accessor: 'organisation',
    // },

    {
      id: 'role',
      Header: "Role",
      accessor: 'role',
      Cell: StatusPill,
    },

    {
      id: 'address',
      Header: "Address",
      accessor: 'address',
      // Cell: StatusPill,
    },

    // {
    //   id: 'smart_integration',
    //   Header: "Smart Integration ",
    //   accessor: 'smart_integration',
    //   Cell: SmartIntegrationPill,
    // },
    // {
    //   id: 'login_status',
    //   Header: "Login Status",
    //   accessor: 'login_status',
    //   Cell: StatusPill,
    // }




    // {
    //   Header: "Title",
    //   accessor: 'title',
    // },
    // {
    //   Header: "Status",
    //   accessor: 'status',
    //   Cell: StatusPill,
    // },
    // {
    //   Header: "Age",
    //   accessor: 'age',
    // },
    // {
    //   Header: "Role",
    //   accessor: 'role',
    //   Filter: SelectColumnFilter,  // new
    //   filter: 'includes',
    // },

  ], [])

  const Actions = [
    {
      element: <div className=' cursor-pointer flex gap-2'> <EyeIcon /> View Request</div>,
      actionName: "view",
      action: commonAction
    },
    {
      element: <div className=' text-green-800 cursor-pointer flex gap-2'><TickIcon /> Accept Request </div>,
      actionName: "accept",
      action: commonAction
      // onClick: props.onClick,
    },
    {
      element: <div className=' text-red-800 cursor-pointer flex gap-2'><CrossIcon /> Reject Request</div>,
      actionName: "delete",
      action: commonAction
    }
  ]


  const deleteMultipleRows = (selectedFlatRows, confirmation = false, openWarning = true) => {
    if (openWarning) {
      setDeleteConfig({selectedFlatRows})
      setWarning(true);
      return;
    }
    if (confirmation) {
      selectedFlatRows.map((row) => {
        commonAction("delete", row.original._id, true, false)
      })
    }
  }

  const getPermissionToDelete = (c) => {
    setWarning(false);
    if(deleteConfig?.commonAction){
      commonAction('delete', deleteConfig.dataId, c, false)
      return;
    }
    // commonAction('delete', deleteConfig.dataId, deleteConfig, p, false)
    deleteMultipleRows(deleteConfig.selectedFlatRows, c, false)
  }

  const notification = (msg, type) => {
    toast[type](msg);
  }


  const addNewElement = (
    <div className=' flex justify-center items-center' >
      <span className=' px-1 inline-block'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" width="18" height="18">
          <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z"></path>
        </svg>               </span>
      {/* <div className=' inline-block'>Add User</div> */}
    </div>
  )
  // let data = React.useMemo(() => getData(), [])

  return  (
    <>
      {warning ? <WarningPage targetFunction={getPermissionToDelete} /> : ''}
      <div className="w-full h-full   text-gray-900">
        <main className=" mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="">
            {/* <h1 className="text-xl font-semibold">Table Header</h1> */}
          </div>
          {isDesktop && <div className="mt-6 ">
            <TableWrapper enableGlobalSearch={true} enableCreateRow={true} loading={loading} header={"Volenteers Request List"}  ModalLoadedComponent={CreateUser} columns={columns} data={memoData} Actions={Actions} deleteMultipleRows={deleteMultipleRows} addNewElement={addNewElement} />
          </div>}
          {isTablet && <div className=" ">
            <TableWrapper enableGlobalSearch={true} enableCreateRow={true} loading={loading} header={"Volenteers Request List"}  enableRowSelect={false} hideColums={['city', 'role', 'address']} ModalLoadedComponent={CreateUser} columns={columns} data={memoData} Actions={Actions} deleteMultipleRows={deleteMultipleRows} addNewElement={addNewElement} />
          </div>}
          {isMobile && <div className=" ">
            <TableWrapper enableGlobalSearch={true} enableCreateRow={true} loading={loading} header={"Volenteers Request List"}  enableRowSelect={false} hideColums={['city', 'role', 'password', 'address']} ModalLoadedComponent={CreateUser} columns={columns} data={memoData} Actions={Actions} deleteMultipleRows={deleteMultipleRows} addNewElement={addNewElement} />
          </div>}
        </main>
      </div>

    </>
  )
}

export default VolunteerRequestList;


