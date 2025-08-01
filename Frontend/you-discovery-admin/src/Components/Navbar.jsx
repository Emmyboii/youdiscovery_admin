import logo from '../Images/yd.webp';
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from 'react';

const Navbar = ({ admins }) => {

    const [open, setOpen] = useState(false)

    const onClickSignout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className='bg-black fixed top-0 z-50 w-full shadow-md shadow-black/50 flex justify-between items-center sm:px-10 px-4'>
            <Link to='/'>
                <img className='w-[90px]' src={logo} alt="" />
            </Link>
            <div onClick={() => setOpen(!open)} className='flex gap-3 cursor-pointer font-medium bg-blue-500 p-3 sp:text-base text-sm rounded-full items-center'>
                <FaUserCircle className='text-white sp:text-[24px] text-lg' />
                {admins.name}
                <IoIosArrowDown className={`${open && 'rotate-180'} transition-all duration-300 sp:text-[24px] text-lg`} />
            </div>

            {open && (
                <div onClick={onClickSignout} className='absolute cursor-pointer right-5 w-[200px] bg-white px-3 py-2 rounded-md top-[68px] shadow-sm shadow-black/50'>
                    <p className='text-red-500 font-semibold flex items-center gap-2'>
                        <FaSignOutAlt className='mt-1 text-lg' />
                        Sign out
                    </p>
                </div>
            )}
        </div>
    )
}

export default Navbar