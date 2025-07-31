import { PiStudent } from "react-icons/pi";
import { FiMail } from "react-icons/fi";
import { FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { useState } from "react";

const Sidebar = ({ open, setOpen }) => {

    return (
        <div className={`border-r border-black/50 w-[300px] transition-all duration-300 ${!open && 'w-[70px]'} h-[85.5vh] shadow-sm shadow-black/30 fixed z-50 bg-white py-5`}>
            <div className="flex items-center px-5 pb-5 justify-between">
                <p className={`font-semibold text-2xl ${!open && 'hidden'}`}>Admin Dashboard</p>
                <div className="hover:bg-black/10 rounded-lg p-1">
                    <IoIosArrowBack onClick={() => setOpen(!open)} className={`text-2xl cursor-pointer ${!open && 'rotate-180 duration-300 transition-all'}`} />
                </div>
            </div>
            <hr className='bg-black/50 h-[1px]' />
            <div className='px-5 mt-7 flex flex-col gap-7'>
                <Link to='/students'>
                    <div className={`flex hover:bg-black/10 rounded-lg ${open && 'p-2'} items-center gap-3 cursor-pointer text-[17px]`}>
                        <PiStudent className="text-3xl" />
                        <p className={`${!open && 'hidden'}`}>Students</p>
                    </div>
                </Link>
                <Link to='/mail'>
                    <div className={`flex hover:bg-black/10 rounded-lg ${open && 'p-2'} items-center gap-3 cursor-pointer text-[17px]`}>
                        <FiMail className="text-2xl" />
                        <p className={`${!open && 'hidden'}`}>Send Mail</p>
                    </div>
                </Link>
                <Link to='/admin'>
                    <div className={`flex hover:bg-black/10 rounded-lg ${open && 'p-2'} items-center gap-3 cursor-pointer text-[17px]`}>
                        <FaUserSecret className="text-2xl" />
                        <p className={`${!open && 'hidden'}`}>View Admins</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Sidebar