import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar";
import ProtectedRoutes from "./Components/ProtectedRoutes";
import PublicRoute from "./Components/PublicRoute";
import Sidebar from "./Components/Sidebar";
import Admins from "./Pages/Admins";
import Authentication from "./Pages/Authentication";
import Mail from "./Pages/Mail";
import NotFound from "./Pages/NotFound";
import Students from "./Pages/Students";
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import UserDetails from "./Pages/UserDetails";
import { IoMenuSharp } from "react-icons/io5";

function App() {
  const location = useLocation()
  const [open, setOpen] = useState(true)
  const [openSidebar, setOpenSidebar] = useState(false)
  const [admins, setAdmins] = useState([])
  // const firstName = admins[0]?.name?.split(" ")[0];

  const hideSidebar = location.pathname.startsWith('/auth') || location.pathname === '/404';

  useEffect(() => {
    const timestamp = localStorage.getItem('tokenTimestamp');
    const now = Date.now();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    if (timestamp && now - Number(timestamp) > TWO_DAYS) {
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')

    const fetchAdmins = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admins/profile`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
        const data = await res.json();
        setAdmins(data); // Make sure this is the actual admin object or array
      } catch (err) {
        console.error(err);
      }
    };

    fetchAdmins();
  }, []);

  useEffect(() => {
    if (openSidebar) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openSidebar])

  return (
    <div className={`w-full`}>
      {!hideSidebar && (
        <Navbar admins={admins} />
      )}
      <div className={`flex w-full ${!hideSidebar && 'mt-[90px]'}`}>
        {!hideSidebar && (
          <Sidebar admins={admins} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} open={open} setOpen={setOpen} />
        )}
        {openSidebar && (
          <div onClick={() => setOpenSidebar(!openSidebar)} className="absolute cursor-pointer w-full mp:hidden block h-screen z-40 bg-black/30"></div>
        )}
        <IoMenuSharp onClick={() => setOpenSidebar(!openSidebar)} className={`text-4xl z-50 ${openSidebar && 'hidden'} hover:bg-black/10 rounded-lg p-1 mp:hidden block cursor-pointer absolute sm:left-5 left-2 top-[91px]`} />
        <div className={`w-full ${!hideSidebar && `mp:ml-[300px] ${!open && 'ml-[70px]'}`}`}>
          <Routes>

            <Route element={<ProtectedRoutes />}>
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<UserDetails />} />
              <Route path="/admin" element={<Admins />} />
              <Route path="/mail" element={<Mail />} />
            </Route>

            <Route path="/auth/*" element={<PublicRoute><Authentication /></PublicRoute>} />
            <Route path="/" element={<Navigate to='/students' />} />

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
