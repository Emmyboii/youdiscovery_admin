import logo from '../Images/yd.webp';
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <div className='bg-black sticky top-0 z-50 w-full shadow-md shadow-black/50 flex justify-between items-center px-10'>
            <Link to='/'>
                <img className='w-[90px]' src={logo} alt="" />
            </Link>
            <div className='flex gap-3 font-medium bg-blue-500 p-3 rounded-full items-center'>
                <FaUserCircle className='text-white text-[24px]' />
                Admin
            </div>
        </div>
    )
}

export default Navbar