import { useContext, useState } from 'react';
import FormAction from "./FormAction";
import FormExtra from "./FormExtra";
import Input from "./Input";
// import GoogleLogin from './GoogleLogin';
// import Logo from '../../assets/logo/Logo';
import { ContextApp } from '../ContextAPI';
import { useNavigate } from 'react-router-dom';
import Notification from '../Notification';
import { loginUser } from '../Actions/loginAction';
import { setItem } from './storageService';
import { Toaster, ToastIcon, toast, resolveValue } from "react-hot-toast";
import Loader from '../components/utilities/Loader';
import Logo from '../components/Logo';




export default function Login() {

    const navigate = useNavigate();



    // const [loginState, setLoginState] = useState();
    const { loggedIn, login, setLoggedIn, currentUser, setCurrentUser, setRole, loginModal, setLoginModal} = useContext(ContextApp);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {

        e.preventDefault();
        console.log(username, password);
        authenticateUser();

    }

    //Handle Login API Integration here
    const authenticateUser = async () => {
        setLoading(true);
        try {
            const trimmedUsername = username.trim();
    
            if (!trimmedUsername || !password) {
                notification('Username and password are required', 'error');
                return;
            }
    
            const response = await loginUser({ username: trimmedUsername, password });
            console.log("login response", response);
    
            if (response?.token) {
                setItem('role', response?.role);
                setItem('Token', response?.token);
                setItem('loggedIn', true);
                setLoggedIn(true);
                console.log("again i am here");
                setRole(response?.role)
                setLoginModal(false)
                // if (response?.role === 'Admin') {
                //     setRole('Admin');
                //     console.log("admin");
                //     navigate('/');
                // } else {
                //     setRole('User');
                //     // navigate('/files');
                //     navigate('/');
                // }
            } else if (response?.error) {
                notification(`Login failed: ${response?.error}`, 'error');
            } else {
                notification('Login failed: Unknown error', 'error');
            }
        } catch (error) {
            console.error("An error occurred during login", error);
            notification(`Login failed: ${error.message}`, 'error');
        }
        setLoading(false);
    };

    const notification = (msg, type) => {
        toast[type](msg);
    }

    return (
        <>
            <Notification />
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div class="w-full bg-gray-100  flex flex-col items-center justify-center py-8 px-4">

                    {/* <div className=' text-[32px] font-bold'><span className=' text-blue-400'>जल</span><span className=' text-green-700'>जीवनम्</span></div> */}
                    <Logo />
                    {/* <div className=''>
                    <div className=' flex items-center ml-10'>
                    <img src= 'y71logo.svg' />
                    <div class=" h-10 border-l-2 border-gray-400"></div>
                    <img className=' w-28 h-10' src= 's+.png' />
                    </div>
                    </div> */}
                    <div class="max-w-md w-full p-6">

                        <div class="text-2xl font-semibold mb-6 text-black text-center">Login to Your Account</div>
                        {/* <h1 class="text-sm font-semibold mb-6 text-gray-500 text-center">Join to Our Community with all time access and free </h1> */}
                        {/* <GoogleLogin /> */}
                        <div class="mt-4 text-sm text-gray-600 text-center">
                            {/* <p>or with email</p> */}
                        </div>
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                            <input value={username} onChange={(e) => { setUsername(e.target.value) }} required type="text" id="username" name="username" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300" />
                        </div>
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                            <input value={password} onChange={(e) => { setPassword(e.target.value) }} required type="password" id="password" name="password" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300" />
                        </div>
                        <div className=' mt-3'>
                            <FormExtra />
                        </div>
                        <div >
                            <button type="submit" disabled={loading?true:false} class="w-full flex justify-center mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-800 focus:outline-none focus:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300">
                               {loading?<Loader/>:'Sign In'} 
                                </button>
                        </div>
                        {/* <div class="mt-4 text-sm text-gray-600 text-center">
                        <p>Already have an account? <a href="#" class="text-black hover:underline">Login here</a>
                        </p>
                    </div> */}
                    </div>
                </div>
                {/**/}
                {/* <FormAction handleSubmit={handleSubmit} text="Login" /> */}

            </form>
        </>
    )
}