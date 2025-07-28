import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import Admins from "./Pages/Admins";
import Mail from "./Pages/Mail";
import Students from "./Pages/Students";
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App w-full">
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="w-full">
          <Routes>
            <Route path="/students" element={<Students />} />
            <Route path="/admin" element={<Admins />} />
            <Route path="/mail" element={<Mail />} />
            <Route path="/" element={<Navigate to='/students' />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
