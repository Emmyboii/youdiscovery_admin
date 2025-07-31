import { Routes, Route } from 'react-router-dom';
import SignUp from '../Components/SignUp';
import Login from '../Components/Login';

const Authentication = () => {
    return (
        <div>
            <Routes>
                <Route path='signup' element={<SignUp />} />
                <Route path='login' element={<Login />} />
            </Routes>
        </div>
    )
}

export default Authentication