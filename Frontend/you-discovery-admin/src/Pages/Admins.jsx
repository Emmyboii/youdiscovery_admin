import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("firstName-asc");

    const [editModal, setEditModal] = useState(null); // holds admin to edit
    const [deleteModal, setDeleteModal] = useState(null); // holds admin to delete
    const [editForm, setEditForm] = useState({ name: "", role: "", cohortAssigned: "" });

    const getAdmins = async () => {
        const token = localStorage.getItem("adminToken");
        setLoading(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admins`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAdmins(data);
                setFilteredAdmins(sortAdmins(data));
            } else if (Array.isArray(data.admins)) {
                setAdmins(data.admins);
                setFilteredAdmins(sortAdmins(data.admins));
            } else {
                console.error('Unexpected response format:', data);
            }
            console.log('Fetched admins:', data);


        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sortAdmins = (adminList) => {
        const sorted = [...adminList];
        switch (sortOption) {
            case "firstName-asc":
                return sorted.sort((a, b) => a.firstName?.localeCompare(b.firstName));
            case "firstName-desc":
                return sorted.sort((a, b) => b.firstName?.localeCompare(a.firstName));
            case "lastName-asc":
                return sorted.sort((a, b) => a.lastName?.localeCompare(b.lastName));
            case "lastName-desc":
                return sorted.sort((a, b) => b.lastName?.localeCompare(a.lastName));
            default:
                return sorted;
        }
    };

    useEffect(() => {
        getAdmins();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = admins.filter(
            (admin) =>
                admin.firstName?.toLowerCase().includes(query) ||
                admin.lastName?.toLowerCase().includes(query) ||
                admin.email?.toLowerCase().includes(query)
        );
        setFilteredAdmins(sortAdmins(filtered));
    }, [searchQuery, admins, sortOption]);

    const openEditModal = (admin) => {
        setEditForm({
            name: admin.name,
            role: admin.role,
            cohortAssigned: admin.cohortAssigned,
        });
        setEditModal(admin);
    };

    const handleEditSubmit = async () => {
        const token = localStorage.getItem("adminToken");
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admins/${editModal._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                setEditModal(null);
                getAdmins();
            }
        } catch (err) {
            console.error("Edit failed:", err);
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem("adminToken");
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admins/${deleteModal._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setDeleteModal(null);
                getAdmins();
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="px-10 py-14 w-full">
            {/* Search & Sort */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
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

            {/* Table Header */}
            <div className="grid grid-cols-8 gap-10 py-3 border-b text-[12px] border-black/30 text-black/50 font-medium">
                <p className="col-span-2">Full Name</p>
                <p className="col-span-2 truncate">Email Address</p>
                <p className="col-span-2">Admin Role</p>
                <p className="col-span-1 truncate">Cohort Assigned</p>
                <p className="text-center">Actions</p>
            </div>

            {/* Admin Rows */}
            {loading ? (
                <p className="my-5 text-center font-medium text-lg">Fetching Admins...</p>
            ) : filteredAdmins.length === 0 ? (
                <p className="my-5 text-center text-gray-500">No Admin found.</p>
            ) : (
                filteredAdmins.map((admin, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-8 gap-10 py-6 border-b text-sm border-black/20 text-black font-medium items-center"
                    >
                        <p className="col-span-2 capitalize">
                            {admin.name}
                        </p>
                        <p className="col-span-2 truncate">{admin.email}</p>
                        <p className="capitalize col-span-2">{admin.role}</p>
                        <p className="capitalize col-span-1 mx-auto">{admin.cohortAssigned ? admin.cohortAssigned : '-'}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => openEditModal(admin)}
                                className="border border-black rounded-lg px-3 py-1 text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setDeleteModal(admin)}
                                className="bg-red-600 text-white rounded-lg px-3 py-1 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Edit Admin</h2>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="border rounded p-2"
                            />
                            <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                className="border rounded p-2"
                            >
                                <option value="">Select Role</option>
                                <option value="Master Admin">Master Admin</option>
                                <option value="Super Admin">Super Admin</option>
                                <option value="SupportAdmin">Support Admin</option>
                                <option value="Mini Admin">Mini Admin</option>
                                <option value="Cohort Admin">Cohort Admin</option>
                            </select>
                            {editForm.role === 'Cohort Admin' && (
                                <input
                                    type="text"
                                    placeholder="Assign Cohort"
                                    value={editForm.cohortAssigned}
                                    onChange={(e) => setEditForm({ ...editForm, cohortAssigned: e.target.value })}
                                    className="border rounded p-2"
                                />
                            )}
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setEditModal(null)} className="text-gray-600 border border-black/40 rounded-md px-2">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSubmit}
                                    className="bg-blue-700 text-white px-4 py-2 rounded"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
                        <h2 className="text-lg font-bold mb-3 text-red-700">Confirm Delete</h2>
                        <p>
                            Are you sure you want to delete admin{" "}
                            <strong>
                                {deleteModal.firstName} {deleteModal.lastName}
                            </strong>
                            ?
                        </p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button onClick={() => setDeleteModal(null)} className="text-gray-600 border border-black/40 rounded-md px-2">
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admins;
