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

function App() {
  const location = useLocation()

  const hideSidebar = location.pathname.startsWith('/auth') || location.pathname === '/404';

  useEffect(() => {
    const timestamp = localStorage.getItem('tokenTimestamp');
    const now = Date.now();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    if (timestamp && now - Number(timestamp) > TWO_DAYS) {
      localStorage.clear();
    }
  }, []);

  const [open, setOpen] = useState(true)


  return (
    <div className="w-full overflow-x-hidde">
      {!hideSidebar && (
        <Navbar />
      )}
      <div className={`flex w-full ${!hideSidebar && 'mt-[90px]'}`}>
        {!hideSidebar && (
          <Sidebar open={open} setOpen={setOpen} />
        )}
        <div className={`w-full ${!hideSidebar && `ml-[300px] ${!open && 'ml-[70px]'}`}`}>
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
