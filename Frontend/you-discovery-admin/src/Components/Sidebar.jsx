import { PiStudent } from "react-icons/pi";
import { FiMail } from "react-icons/fi";
import { FaTimes, FaUserSecret } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { useState } from "react";
import { SiGoogleanalytics } from "react-icons/si";

const Sidebar = ({ open, setOpen, admins, openSidebar, setOpenSidebar }) => {

    const navigate = useNavigate()

    const [adminModal, setAdminModal] = useState(false)
    const [emailModal, setEmailModal] = useState(false)
    const [analyticsModal, setAnalyticsModal] = useState(false)

    const onViewAdmins = () => {
        if (admins.role !== 'Super Admin' && admins.role !== 'Developer/System Admin') {
            setAdminModal(true)
        } else {
            navigate('/admin')
            setOpenSidebar(!openSidebar)
        }
    }

     const onViewAnalytics = () => {
        if (admins.role === 'Developer/System Admin' && admins.role === 'Finance/Billing Admin') {
            setAdminModal(true)
        } else {
            navigate('/analytics')
            setOpenSidebar(!openSidebar)
        }
    }

    const onSendEmail = () => {
        if (admins.role !== 'Community Manager' && admins.role !== 'CRM/Admin Support' && admins.role !== 'Super Admin') {
            setEmailModal(true)
        } else {
            navigate('/mail')
            setOpenSidebar(!openSidebar)
        }
    }

    return (
        <div>
            <div className={`border-r border-black/50 w-[300px] transition-all duration-300 ${!open && 'w-[70px]'} h-[85.5vh] shadow-sm shadow-black/30 fixed mp:block hidden z-50 bg-white py-5`}>
                <div className="flex items-center px-5 pb-5 justify-between">
                    <p className={`font-semibold text-2xl ${!open && 'hidden'}`}>Admin Dashboard</p>
                    <div className="hover:bg-black/10 rounded-lg p-1">
                        <IoIosArrowBack onClick={() => setOpen(!open)} className={`text-2xl cursor-pointer ${!open && 'rotate-180 duration-300 transition-all'}`} />
                    </div>
                </div>
                <hr className='bg-black/50 h-[1px]' />
                <div className='px-5 mt-7 flex flex-col gap-7'>
                    {/* <Link to='/students'> */}
                    <div onClick={() => navigate('/students')} className={`flex hover:bg-black/10 rounded-lg ${open && 'p-2'} items-center gap-3 cursor-pointer text-[17px]`}>
                        <PiStudent className="text-3xl" />
                        <p className={`${!open && 'hidden'}`}>Students</p>
                    </div>
                    {/* </Link> */}
                    {/* <Link to='/mail'> */}
                    <div onClick={onSendEmail} className={`flex hover:bg-black/10 rounded-lg ${open && 'p-2'} items-center gap-3 cursor-pointer text-[17px]`}>
                        <FiMail className="text-2xl" />
                        <p className={`${!open && 'hidden'}`}>Send Mail</p>
                    </div>
                    {/* </Link> */}
                    {/* <Link to='/admin'> */}
                    <div onClick={onViewAdmins} className={`flex hover:bg-black/10 rounded-lg ${open && 'p-2'} items-center gap-3 cursor-pointer text-[17px]`}>
                        <FaUserSecret className="text-2xl" />
                        <p className={`${!open && 'hidden'}`}>View Admins</p>
                    </div>
                    {/* </Link> */}
                    <div onClick={onViewAnalytics} className={`flex hover:bg-black/10 rounded-lg ${open && 'p-2'} items-center gap-3 cursor-pointer text-[17px]`}>
                        <SiGoogleanalytics className="text-2xl" />
                        <p className={`${!open && 'hidden'}`}>Analytics</p>
                    </div>
                </div>

                {adminModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
                            <h2 className="text-lg font-bold mb-3 text-red-700">Insufficient Privilleges.</h2>
                            <p>
                                Sorry, you don't have the privillege to view or edit admins on this platform
                            </p>
                            <div className="flex justify-center gap-4 mt-6">
                                <button onClick={() => setAdminModal(false)} className="bg-blue-500 rounded-md text-white p-2">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {emailModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
                            <h2 className="text-lg font-bold mb-3 text-red-700">Insufficient Privilleges.</h2>
                            <p>
                                Sorry, you don't have the privillege to send email to students on this platform
                            </p>
                            <div className="flex justify-center gap-4 mt-6">
                                <button onClick={() => setEmailModal(false)} className="bg-blue-500 rounded-md text-white p-2">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`border-r border-black/50  transition-all duration-500 ${!openSidebar ? 'left-[-300px]' : 'w-[300px] z-40'} h-screen shadow-sm shadow-black/30 fixed block mp:hidden bg-white py-5`}>
                <div className="flex items-center px-5 pb-5 justify-between">
                    <p className={`font-semibold text-2xl`}>Admin Dashboard</p>
                    <div className="hover:bg-black/10 rounded-lg p-1">
                        <FaTimes onClick={() => setOpenSidebar(!openSidebar)} className={`text-2xl cursor-pointer`} />
                    </div>
                </div>
                <hr className='bg-black/50 h-[1px]' />
                <div className='px-5 mt-7 flex flex-col gap-7'>
                    {/* <Link to='/students'> */}
                    <div onClick={() => {
                        navigate('/students')
                        setOpenSidebar(!openSidebar)
                    }}
                        className={`flex hover:bg-black/10 p-2 z-0 rounded-lg items-center gap-3 cursor-pointer text-[17px]`}
                    >
                        <PiStudent className="text-3xl" />
                        <p>Students</p>
                    </div>
                    {/* </Link> */}
                    {/* <Link to='/mail'> */}
                    <div onClick={onSendEmail} className={`flex hover:bg-black/10 z-0 rounded-lg p-2 items-center gap-3 cursor-pointer text-[17px]`}>
                        <FiMail className="text-2xl" />
                        <p>Send Mail</p>
                    </div>
                    {/* </Link> */}
                    {/* <Link to='/admin'> */}
                    <div onClick={onViewAdmins} className={`flex hover:bg-black/10 z-0 rounded-lg p-2 items-center gap-3 cursor-pointer text-[17px]`}>
                        <FaUserSecret className="text-2xl" />
                        <p>View Admins</p>
                    </div>
                    {/* </Link> */}

                    <div onClick={onViewAnalytics}
                        className={`flex hover:bg-black/10 rounded-lg p-2 z-0 items-center gap-3 cursor-pointer text-[17px]`}
                    >
                        <SiGoogleanalytics className="text-2xl" />
                        <p className={`${!open && 'hidden'}`}>Analytics</p>
                    </div>
                </div>

                {adminModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
                            <h2 className="text-lg font-bold mb-3 text-red-700">Insufficient Privilleges.</h2>
                            <p>
                                Sorry, you don't have the privillege to view or edit admins on this platform
                            </p>
                            <div className="flex justify-center gap-4 mt-6">
                                <button onClick={() => setAdminModal(false)} className="bg-blue-500 rounded-md text-white p-2">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {emailModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
                            <h2 className="text-lg font-bold mb-3 text-red-700">Insufficient Privilleges.</h2>
                            <p>
                                Sorry, you don't have the privillege to send email to students on this platform
                            </p>
                            <div className="flex justify-center gap-4 mt-6">
                                <button onClick={() => setEmailModal(false)} className="bg-blue-500 rounded-md text-white p-2">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                 {analyticsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
                            <h2 className="text-lg font-bold mb-3 text-red-700">Insufficient Privilleges.</h2>
                            <p>
                                Sorry, you don't have the privillege to view the analytics of this platform
                            </p>
                            <div className="flex justify-center gap-4 mt-6">
                                <button onClick={() => setAnalyticsModal(false)} className="bg-blue-500 rounded-md text-white p-2">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Sidebar