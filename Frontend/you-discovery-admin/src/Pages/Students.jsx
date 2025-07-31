import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("firstName-asc");

    const studentsPerPage = 40;

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
            case "firstName-desc":
                return sorted.sort((a, b) =>
                    b.firstName?.toLowerCase().localeCompare(a.firstName?.toLowerCase())
                );
            case "lastName-asc":
                return sorted.sort((a, b) =>
                    a.lastName?.toLowerCase().localeCompare(b.lastName?.toLowerCase())
                );
            case "lastName-desc":
                return sorted.sort((a, b) =>
                    b.lastName?.toLowerCase().localeCompare(a.lastName?.toLowerCase())
                );
            default:
                return studentsList;
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();

        const filtered = students.filter(
            (student) =>
                student.firstName?.toLowerCase().includes(query) ||
                student.lastName?.toLowerCase().includes(query) ||
                student.email?.toLowerCase().includes(query)
        );

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

    return (
        <div className="px-10 py-14 w-full">
            {/* 🔍 Search and Sort */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
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
                    <option value="firstName-desc">First Name Z–A</option>
                    <option value="lastName-asc">Last Name A–Z</option>
                    <option value="lastName-desc">Last Name Z–A</option>
                </select>
            </div>

            {/* 🧾 Table Header */}
            <div className="w-full">
                <div className="grid grid-cols-9 gap-5 text-[14px] py-3 border-b border-black/30 text-black/50 font-medium">
                    <p className="col-span-2">First Name</p>
                    <p className="col-span-1">Last Name</p>
                    <p className="col-span-3">Email Address</p>
                    <p className="col-span-2">Join Date</p>
                    <p>Details</p>
                </div>
            </div>

            {/* 🧍 Students List */}
            {loading ? (
                <p className="my-5 text-center font-medium text-lg">Fetching Students...</p>
            ) : currentStudents.length === 0 ? (
                <p className="my-5 text-center text-gray-500">No students found.</p>
            ) : (
                currentStudents.map((student, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-9 gap-5 text-[14px] py-10 border-b border-black/30 text-black font-medium"
                    >
                        <p className="col-span-2 truncate">{student.firstName}</p>
                        <p className="col-span-1 truncate">{student.lastName}</p>
                        <p className="col-span-3 truncate">{student.email}</p>
                        <p className="col-span-2 truncate">
                            {new Date(student.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                            })}
                        </p>
                        <Link to={`/students/${student._id}`}>
                            <p className="text-blue-400 cursor-pointer font-normal">Details</p>
                        </Link>
                    </div>
                ))
            )}

            {/* 🔢 Pagination */}
            <div className="flex justify-center mt-10 space-x-2 flex-wrap">
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 border rounded ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-black border-blue-600 hover:bg-blue-50"}`}
                >
                    ⏮
                </button>

                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 border rounded ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-black border-blue-600 hover:bg-blue-50"}`}
                >
                    ⬅
                </button>

                {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                        <span key={i} className="px-3 py-2 text-gray-500 select-none">
                            ...
                        </span>
                    ) : (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border rounded ${currentPage === page
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                                }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 border rounded ${currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white border-blue-600 hover:bg-blue-50"}`}
                >
                    ➡
                </button>

                <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 border rounded ${currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white border-blue-600 hover:bg-blue-50"}`}
                >
                    ⏭
                </button>
            </div>
        </div>
    );
};

export default Students;
