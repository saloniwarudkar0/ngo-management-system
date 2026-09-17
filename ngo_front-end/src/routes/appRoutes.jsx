import Home from "../components/Home";
import About from "../components/About";
import Events from "../components/Events";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import HomeIcon from "../Icons/HomeIcon";
import InfoIcon from "../Icons/InfoIcon";
import SquareIcon from "../Icons/SquareIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import ContactUsIcon from "../Icons/ContactUsIcon";

const appRoutes = [
  {
    path: "/",
    index:true,
    element: <Home />,
    state: "Home",
    role: ["Admin", "Public", "Head-Volunteer"],
    sidebarProps: {
      displayText: "Home",
      icon: <div>Home</div>,
      sidebarIcon : <HomeIcon className={'size-5'}/>
    }
  },
  // {
  //   path: "/files",
  //   index:true,
  //   role:['User', 'Admin'],
  //   element: <AllFiles />,
  //   state: "file",
  //   sidebarProps: {
  //     displayText: "Files",
  //     icon: <FilesIcon />
  //   }
  // },
 {
    path: "/about",
    index:true,
    role:['Public', 'Admin',"Head-Volunteer"],
    element: <About/>,
    state: "organisations",
    sidebarProps: {
      displayText: "organisation",
      icon: <div>About Us</div>,
      sidebarIcon : <InfoIcon className={'size-5'}/>
    }
  },
  {
    path: "/projects",
    index:true,
    role:['Public', 'Admin', "Head-Volunteer"],
    element: <Projects/>,
    state: "projects",
    sidebarProps: {
      displayText: "projects",
      icon: <div>Projects</div>,
      sidebarIcon : <SquareIcon className={'size-5'} />
    }
  },
  {
    path: "/events",
    index:true,
    role:['Public', 'Admin', "Head-Volunteer"],
    element: <Events/>,
    state: "events",
    sidebarProps: {
      displayText: "events",
      icon: <div>Events</div>,
      sidebarIcon : <CalendarIcon className={'size-5'} />
    }
  },
  {
    path: "/contact-us",
    index:true,
    role:['Public', 'Admin', "Head-Volunteer"],
    element: <Contact/>,
    state: "contact-us",
    sidebarProps: {
      displayText: "contact-us",
      icon: <div>Contact Us</div>,
      sidebarIcon : <ContactUsIcon className={'size-5'}/>
    }
  },

  // {
  //   path: "/donate",
  //   index:true,
  //   role:['User', 'Admin'],
  //   element: <Contact/>,
  //   state: "donate",
  //   sidebarProps: {
  //     displayText: "donate",
  //     icon: <div>Donate Now</div>
  //   }
  // }
  

  // {
  //   path: "/Organisations/users",
  //   // index:true,
  //   role:['User', 'Admin'],
  //   element: <Home/>,
  //   state: "file",
  //   // sidebarProps: {
  //   //   displayText: "Files",
  //   //   icon: <FilesIcon />
  //   // }
  // },

];

export default appRoutes;


