import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";

const Students = ({ admins }) => {
    const navigate = useNavigate()
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [smScreen, setSmScreen] = useState(window.innerWidth <= 600);
    const [sortOption, setSortOption] = useState("firstName-asc");
    const [studentModal, setStudentModal] = useState(false)


    const studentsPerPage = 40;

    useEffect(() => {
        const handleResize = () => {
            setSmScreen(window.innerWidth <= 600)
        }
        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const getStudents = async () => {
        const adminToken = localStorage.getItem("adminToken");
        setLoading(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
            });

            const data = await res.json();
            setStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sortStudents = (studentsList) => {
        const sorted = [...studentsList];

        switch (sortOption) {
            case "firstName-asc":
                return sorted.sort((a, b) =>
                    a.firstName?.toLowerCase().localeCompare(b.firstName?.toLowerCase())
                );

            case "lastName-asc":
                return sorted.sort((a, b) =>
                    a.lastName?.toLowerCase().localeCompare(b.lastName?.toLowerCase())
                );

            case "date-asc": // oldest → newest
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            case "date-desc": // newest → oldest
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            default:
                return studentsList;
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();

        const filtered = students.filter((student) => {
            const fullName = `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();
            const reverseFullName = `${student.lastName || ""} ${student.firstName || ""}`.toLowerCase();

            return (
                student.firstName?.toLowerCase().includes(query) ||
                student.lastName?.toLowerCase().includes(query) ||
                student.email?.toLowerCase().includes(query) ||
                fullName.includes(query) ||
                reverseFullName.includes(query)
            );
        });

        setFilteredStudents(filtered);
        setCurrentPage(1);
    }, [searchQuery, students]);



    const sortedStudents = sortStudents(filteredStudents);
    const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

    const currentStudents = sortedStudents.slice(
        (currentPage - 1) * studentsPerPage,
        currentPage * studentsPerPage
    );

    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages - 1, totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, 2, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(
                1,
                "...",
                currentPage - 1,
                currentPage,
                currentPage + 1,
                "...",
                totalPages
            );
        }

        return pages;
    };

    const onViewUsers = (id) => {
        if (admins.role !== 'Super Admin' && admins.role !== 'Academic/Admin Coordinator' && admins.role !== 'Analytics & Reporting Admin' && admins.role !== 'CRM/Admin Support' && admins.role !== 'Partnerships/Admin for B2B/B2G') {
            setStudentModal(true)
        } else {
            navigate(`/students/${id}`)
        }
    }

    return (
        <div className="sa:px-10 px-3 py-14 w-full">
            {/* 🔍 Search and Sort */}
            <p className="text-black/70 font-normal">Total Students: {students.length}</p>
            <div className="flex mt-5 items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border-[1.5px] border-gray-400 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    <FiSearch className="absolute right-3 top-2.5 text-[20px] text-gray-400" />
                </div>

                <select
                    className="border px-3 py-2 rounded text-sm"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="firstName-asc">First Name A–Z</option>
                    <option value="lastName-asc">Last Name A–Z</option>
                    <option value="date-asc">Date Joined (Oldest → Newest)</option>
                    <option value="date-desc">Date Joined (Newest → Oldest)</option>
                </select>
            </div>

            {/* 🧾 Table Header */}
            <div className="w-full">
                <div className="grid sh:grid-cols-9 grid-cols-7 gap-5 text-[14px] py-3 border-b border-black/30 text-black/50 font-medium">
                    <p className="col-span-2">First Name</p>
                    <p className="sh:col-span-1 col-span-2">Last Name</p>
                    <p className="col-span-3">Email Address</p>
                    <p className="col-span-2 sh:block hidden">Join Date</p>
                    <p className="sh:block hidden">Details</p>
                </div>
            </div>

            {/* 🧍 Students List */}
            {loading ? (
                <p className="my-5 text-center font-medium text-lg">Fetching Students...</p>
            ) : currentStudents.length === 0 ? (
                <div>
                    <p className="my-5 text-center text-gray-500">No students found.</p>
                    <p className="my-5 text-center text-gray-500">You probably don't have access to view students on this platform</p>
                </div>
            ) : (
                currentStudents.map((student, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            if (smScreen) {
                                navigate(`/students/${student._id}`)
                            }
                        }}
                        className="grid sh:grid-cols-9 grid-cols-7 pt-9 sh:hover:bg-transparent hover:bg-black/10 sh:cursor-auto cursor-pointer gap-5 text-[14px] sh:py-10 py-5 border-b border-black/30 text-black font-medium"
                    >
                        <p className="col-span-2 capitalize truncate">{student.firstName}</p>
                        <p className="sh:col-span-1 col-span-2 capitalize truncate">{student.lastName}</p>
                        <p className="col-span-3 truncate">{student.email}</p>
                        <p className="col-span-2 truncate sh:block hidden">
                            {new Date(student.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                            })}
                        </p>
                        <p onClick={() => onViewUsers(student._id)} className="text-blue-400 sh:block hidden cursor-pointer font-normal">Details</p>
                    </div>
                ))
            )}

            {/* 🔢 Pagination */}
            <div className="flex flex-wra sp:flex-row flex-col justify-center items-center sp:gap-2 gap-5 mt-10 text-sm sm:text-base">
                {/* First Page Button */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`px-2 sm:px-3 py-1 sm:py-2 border rounded ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-black border-blue-600 hover:bg-blue-50"}`}
                    >
                        ⏮
                    </button>

                    {/* Previous Page Button */}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-2 sm:px-3 py-1 sm:py-2 border rounded ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-black border-blue-600 hover:bg-blue-50"}`}
                    >
                        ⬅
                    </button>
                </div>

                {/* Page Numbers */}
                <div className="flex gap-2">
                    {getPageNumbers().map((page, i) =>
                        page === "..." ? (
                            <span key={i} className="px-2 sm:px-3 py-1 sm:py-2 text-gray-500 select-none">...</span>
                        ) : (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(page)}
                                className={`px-2 sm:px-4 py-1 sm:py-2 border rounded ${currentPage === page
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                {/* Next Page Button */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-2 sm:px-3 py-1 sm:py-2 border rounded ${currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white border-blue-600 hover:bg-blue-50"}`}
                    >
                        ➡
                    </button>

                    {/* Last Page Button */}
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`px-2 sm:px-3 py-1 sm:py-2 border rounded ${currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white border-blue-600 hover:bg-blue-50"}`}
                    >
                        ⏭
                    </button>
                </div>
            </div>

            {studentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
                        <h2 className="text-lg font-bold mb-3 text-red-700">Insufficient Privilleges.</h2>
                        <p>
                            Sorry, you don't have the privillege to view student details on this platform
                        </p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button onClick={() => setStudentModal(false)} className="bg-blue-500 rounded-md text-white p-2">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
