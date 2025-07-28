import { PiStudent } from "react-icons/pi";
import { FiMail } from "react-icons/fi";
import { FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className='border-r border-black/50 w-[300px] h-[85.5vh] shadow-sm shadow-black/30 sticky py-5'>
            <p className='px-5 pb-5 font-semibold text-2xl'>Admin Dashboard</p>
            <hr className='bg-black/50 h-[1px]' />
            <div className='px-5 mt-7 flex flex-col gap-7'>
                <Link to='/students'>
                    <div className="flex items-center gap-3 cursor-pointer text-[17px]">
                        <PiStudent className="text-2xl" />
                        <p>Students</p>
                    </div>
                </Link>
                <Link to='/mail'>
                    <div className="flex items-center gap-3 cursor-pointer text-[17px]">
                        <FiMail className="text-xl" />
                        <p>Send Mail</p>
                    </div>
                </Link>
                <Link to='/admin'>
                    <div className="flex items-center gap-3 cursor-pointer text-[17px]">
                        <FaUserSecret className="text-xl" />
                        <p>View Admins</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Sidebar