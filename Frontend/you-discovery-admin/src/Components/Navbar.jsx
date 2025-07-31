import { useEffect, useState } from 'react';
import logo from '../Images/yd.webp';
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {

    const [admins, setAdmins] = useState([])

    // const firstName = admins[0]?.name?.split(" ")[0];

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

    return (
        <div className='bg-black fixed top-0 z-50 w-full shadow-md shadow-black/50 flex justify-between items-center px-10'>
            <Link to='/'>
                <img className='w-[90px]' src={logo} alt="" />
            </Link>
            <div className='flex gap-3 font-medium bg-blue-500 p-3 rounded-full items-center'>
                <FaUserCircle className='text-white text-[24px]' />
                {admins.name}
            </div>
        </div>
    )
}

export default Navbar