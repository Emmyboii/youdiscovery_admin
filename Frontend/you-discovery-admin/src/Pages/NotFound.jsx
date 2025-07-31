import { FaHome } from "react-icons/fa";
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="flex flex-col justify-center h-[90vh] items-center">
        <h1 className="text-[70px] font-bold">404 </h1>
        <p className='text-[30px] font-semibold'>Page Not Found</p>
        <p className="mb-6">Oops! The page you're looking for doesn't exist. <br /> It might have been delted or moved or deleted</p>
        <Link to="/students" className="bg-black flex items-center gap-2 justify-center py-2 font-semibold text-[20px] w-[200px] rounded-full mx-auto text-white">
            <FaHome />
            Go back home
        </Link>
    </div>
);

export default NotFound;
