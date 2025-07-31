import { useEffect, useState } from "react";

const Mail = () => {
    const [mail, setMail] = useState({
        subject: '',
        message: '',
        filter: {
            minCompletedClasses: '',
            cohortApplied: '',
            isActiveOnly: false
        }
    });

    const [userCount, setUserCount] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [modal, setModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name in mail.filter) {
            setMail(prev => ({
                ...prev,
                filter: { ...prev.filter, [name]: value }
            }));
        } else {
            setMail(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setMail(prev => ({
            ...prev,
            filter: { ...prev.filter, [name]: checked }
        }));
    };

    const fetchUserCount = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/email-count`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mail.filter)
            });

            const data = await res.json();
            if (res.ok) {
                setUserCount(data.count);
            } else {
                setUserCount(null);
            }
        } catch {
            setUserCount(null);
        }
    };

    useEffect(() => {
        fetchUserCount();
    }, [mail.filter]);

    const sendMail = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('adminToken');
        if (!token) {
            setStatus({ message: 'No token found. Please log in.', type: 'error' });
            setModal(true);
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/send-email`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mail)
            });

            if (!res.ok) {
                const errText = await res.text();
                setStatus({ message: errText || 'Failed to send email.', type: 'error' });
                setModal(true);
                return;
            }

            const data = await res.json();
            setStatus({ message: data.message || 'Emails sent successfully.', type: 'success' });
            setModal(true);

            setMail({
                subject: '',
                message: '',
                filter: {
                    minCompletedClasses: '',
                    cohortApplied: '',
                    isActiveOnly: false
                }
            });

        } catch {
            setStatus({ message: 'An error occurred while sending.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (modal) {
            const timer = setTimeout(() => {
                setModal(false);
                setStatus({ message: '', type: '' });
            }, 3500);

            return () => clearTimeout(timer);
        }
    }, [modal]);

    return (
        <div className="flex flex-col max-w-[700px items-center my-5 px-10 gap-6 mx-auto w-full">
            {modal && (
                <div className={`${status.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white fixed top-[80px] z-50 right p-3 rounded-md flex items-center text-center justify-between`}>
                    <p className='text-[16px] 3xl:text-[22px] font-bold'>
                        {status.message}
                    </p>
                </div>
            )}
            <div className="flex items-start justify-between w-full">
                <div>
                    <p className="text-[33px] font-bold">Send Message to All Users</p>

                    {userCount !== null && (
                        <div className="text-base text-gray-700 my-2 italic">
                            📬 Message will be sent to <strong>{userCount}</strong> user{userCount !== 1 ? 's' : ''}.
                        </div>
                    )}

                    <form className="flex flex-col gap-8" onSubmit={sendMail}>
                        <label htmlFor="subject" className="flex flex-col gap-2">
                            <span className="font-medium">Subject</span>
                            <input
                                type="text"
                                name="subject"
                                value={mail.subject}
                                onChange={handleChange}
                                id="subject"
                                required
                                className="border border-black/40 rounded-lg w-full p-2"
                            />
                        </label>

                        <label htmlFor="message" className="flex flex-col gap-2">
                            <span className="font-medium">Message</span>
                            <textarea
                                name="message"
                                value={mail.message}
                                onChange={handleChange}
                                id="message"
                                required
                                className="border resize-none h-[200px] border-black/40 rounded-lg w-full p-2"
                            />
                        </label>


                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-900 text-white px-6 py-3 rounded-md w-fit self-end hover:bg-blue-800 transition"
                        >
                            {submitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>

                <div className="flex flex-col gap-4 bg-gray-50 border p-4 rounded-lg">
                    <p className="font-semibold">Filter Options (Optional)</p>

                    <label className="flex flex-col gap-1">
                        <span>Minimum Completed Classes</span>
                        <input
                            type="number"
                            name="minCompletedClasses"
                            value={mail.filter.minCompletedClasses}
                            onChange={handleChange}
                            className="border border-black/30 rounded-md p-2"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span>Cohort Applied</span>
                        <input
                            type="text"
                            name="cohortApplied"
                            value={mail.filter.cohortApplied}
                            onChange={handleChange}
                            className="border border-black/30 rounded-md p-2"
                        />
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isActiveOnly"
                            checked={mail.filter.isActiveOnly}
                            onChange={handleCheckboxChange}
                            className="w-5 h-5"
                        />
                        <span>Only Active Users</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Mail;
