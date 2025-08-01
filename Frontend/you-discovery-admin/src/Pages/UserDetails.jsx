import React, { useEffect, useState } from 'react'
import { FiSave } from 'react-icons/fi'
import editImg from '../Images/edit.svg';
import { useParams } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import ActivityBarChart from '../Components/ActivityChartBar';

const UserDetails = () => {

    const { id } = useParams();
    const [status, setStatus] = useState({ message: '', type: '' })
    const [modal, setModal] = useState(false)
    const [edit, setEdit] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [validationError, setValidationError] = useState({})
    const [loading, setLoading] = useState(false);

    const [students, setStudents] = useState({})

    const [coursesCompleted, setCoursesCompleted] = useState('')
    const [totalCourses, setTotalCourses] = useState('')
    const [classesCompleted, setClassesCompleted] = useState('')
    const [totalClasses, setTotalClasses] = useState('')
    const [chaptersCompleted, setChaptersCompleted] = useState('')
    const [totalChapter, setTotalChapter] = useState('')
    const [quiz, setQuiz] = useState('')
    const [quizAttempted, setQuizAttempted] = useState('')
    // const [quizPasses, setQuizPasses] = useState('')
    const [quizAverage, setQuizAverage] = useState('')
    const [strengthLvl, setStrengthLvl] = useState('')
    const [stats, setStats] = useState(null);
    const [timeline, setTimeline] = useState([]);

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let error = {}

        if (!emailRegex.test(students.email)) {
            error.email = 'Please Enter a Valid Email address.'
        }

        setValidationError(error)
        return Object.keys(error).length === 0;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setStudents({ ...students, [name]: value })
        setValidationError((prev) => ({ ...prev, [name]: '' }));
    }

    const getUsers = async () => {

        const token = localStorage.getItem('adminToken')
        if (!token) {
            console.warn('No token found');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
            })

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Failed to get details');
            }

            const data = await res.json()
            console.log(data);


            setStudents(data)


        } catch (error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {
        getUsers()
    }, [id])

    const getStats = async () => {

        const token = localStorage.getItem('adminToken')
        if (!token) {
            console.warn('No token found');
            return;
        }

        setLoading(true)

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stats/user/${id}/stats`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
            })

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Failed to get details');
            }

            const data = await res.json()
            console.log(data);


            setCoursesCompleted(data.coursesCompleted)
            setTotalCourses(data.totalCourses)
            setClassesCompleted(data.completedClasses)
            setTotalClasses(data.totalClasses)
            setChaptersCompleted(data.completedChapters)
            setTotalChapter(data.totalChapters)
            setQuiz(data.totalQuizzes)
            setQuizAttempted(data.quizzesAttempted)
            // setQuizPasses(data.quizzesPassed)
            setQuizAverage(data.quizAverage)
            setStats(data)

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getStats()
    }, [id])

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/activities/user/${id}/timeline`);
                const data = await res.json();
                setTimeline(data.timeline || []);
            } catch (err) {
                console.error('Failed to fetch timeline:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeline();
    }, [id]);

    const chapterPercentage = (chaptersCompleted / totalChapter) * 100
    const coursesPercentage = (coursesCompleted / totalCourses) * 100
    const quizPercentage = (quizAttempted / quiz) * 100
    const classPercentage = (classesCompleted / totalClasses) * 100

    useEffect(() => {
        if (quizAverage >= 80) {
            setStrengthLvl('Outstanding')
        } else if (quizAverage >= 60) {
            setStrengthLvl('Good')
        } else if (quizAverage >= 45) {
            setStrengthLvl('Average')
        } else if (quizAverage < 45) {
            setStrengthLvl('Fair')
        }
    }, [quizAverage])

    useEffect(() => {
        if (modal) {
            const timer = setTimeout(() => {
                setModal(false);
                setStatus({ message: '', type: '' });
            }, 3500);

            return () => clearTimeout(timer);
        }
    }, [modal]);


    const editProfile = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem('adminToken')
        if (!token) {
            console.warn('No token found');
            return;
        }
        if (!validateForm()) {
            console.log("Validation failed!");
            return;
        }
        setSubmitting(true)

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(students)
            })

            if (!res.ok) {
                setModal(true)
                setStatus({ message: 'Could not edit details. Try again later', type: 'error' })
                const errText = await res.text();
                throw new Error(errText || 'Failed to get details');
            }

            const data = await res.json()

            console.log('Edit successful:', data);
            setModal(true)
            setStatus({ message: 'Edited Successfully', type: 'success' })

        } catch (error) {
            console.error('Edit error:', error);
        } finally {
            setEdit(false)
            setSubmitting(false)
        }
    }

    return (
        <div>
            {loading ? (
                <p className="my-5 text-center font-medium text-lg">Fetching Student details...</p>
            ) : (
                <div className='flex flex-col gap-4 mh:px-10 px-3 py-14'>
                    {modal && (
                        <div className={`${status.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white fixed top-[80px] z-50 right p-3 rounded-md flex items-center text-center justify-between`}>
                            <p className='text-[16px] 3xl:text-[22px] font-bold'>
                                {status.message}
                            </p>
                        </div>
                    )}
                    <h1 className="text-[18px] text-[#252525] mk:hidden block font-medium mb-2">Student's Information</h1>
                    <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                        <div className='flex items-center justify-between gap-3'>
                            <p className='sa:text-xl text-lg font-medium text-[#252525]'>🙋 Personal Information</p>
                            <div className='flex sh:hidden flex-col gap-2'>
                                <div onClick={(e) => {
                                    if (edit) {
                                        editProfile(e)
                                    } else {
                                        setEdit(true)
                                    }
                                }}
                                    className="text-[16px] cursor-pointer gap-1 font-normal sd:py-[5px] py-[2px] sd:px-[21px] px-[14px] flex items-center justify-center rounded-[20px] text-[#441890] hover:bg-black/10 bg-[#ffffff] border-[0.8px] border-[#441890]"
                                >
                                    {edit ? (
                                        <p>
                                            {submitting ? "Saving..." : "Save"}
                                        </p>
                                    ) : (
                                        <p>Edit</p>
                                    )}
                                    {edit ? (
                                        <FiSave />
                                    ) : (
                                        <img src={editImg} alt="" />
                                    )}
                                </div>
                                {edit && (
                                    <p
                                        className="text-[16px] cursor-pointer gap-1 font-normal sd:py-[5px] py-[2px] sd:px-[21px] px-[14px] flex items-center justify-center rounded-[20px] text-[#441890] hover:bg-black/10 bg-[#ffffff] border-[0.8px] border-[#441890]"
                                        onClick={() => setEdit(false)}
                                    >
                                        Cancel
                                        <FaTimes />
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className='flex sh:flex-row flex-col justify-between sh:gap-2 gap-8 sh:items-start items-center w-full'>
                            <div className='flex sp:gap-2 gap-5 sp:flex-row flex-col items-center sh:items-start w-full justify-between'>
                                <div className='flex flex-col gap-[33px] items-center sh:items-start w-full'>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>First Name</p>
                                        <input
                                            type="text"
                                            value={students?.firstName}
                                            onChange={handleChange}
                                            className={`text-[14px] md:text-[16px] text-center sh:text-start w-full font-medium text-[#252525] outline-none ${edit && 'outline-black/50 w-[70%] px-2 py-1 rounded'}`}
                                            name="firstName"
                                            id=""
                                            readOnly={!edit}
                                        />
                                    </div>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-xs md:text-[14px] font-medium text-center sh:text-start text-[#25252580]'>Email</p>
                                        {edit ? (
                                            <input
                                                type="text"
                                                value={students?.email}
                                                onChange={handleChange}
                                                className={`text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] w-full outline-none ${edit && 'outline-black/50 sh:w-[70%] w-full px-2 py-1 rounded'}`}
                                                name="email"
                                            />
                                        ) : (
                                            <a
                                                href={`mailto:${students?.email}`}
                                                className="text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] underline w-fit"
                                            >
                                                {students?.email}
                                            </a>
                                        )}
                                        {validationError.email && <p className='text-red-500 text-[14px]'>{validationError.email}</p>}
                                    </div>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>Date of Birth</p>

                                        {edit ? (
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={
                                                    students?.dateOfBirth
                                                        ? new Date(students?.dateOfBirth).toISOString().split("T")[0]
                                                        : ''
                                                }
                                                onChange={handleChange}
                                                className="text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] border-[2px] border-black/50 outline-black/50 sh:w-[70%] rounded-lg px-2 py-1"
                                            />
                                        ) : (
                                            <p className='text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525]'>
                                                {students?.dateOfBirth
                                                    ? new Date(students?.dateOfBirth).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })
                                                    : 'Not Provided'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className='flex flex-col gap-[33px] items-center sh:items-start w-full'>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>Last Name</p>
                                        <input
                                            type="text"
                                            value={students?.lastName}
                                            onChange={handleChange}
                                            className={`text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] outline-none ${edit && 'outline-black/50 sh:w-[70%] px-2 py-1 rounded'}`}
                                            name="lastName"
                                            id=""
                                            readOnly={!edit}
                                        />
                                    </div>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>Phone Number</p>
                                        {edit ? (
                                            <input
                                                type="text"
                                                value={students?.phonenumber}
                                                onChange={handleChange}
                                                className={`text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] outline-none ${edit && 'outline-black/50 sh:w-[70%] px-2 py-1 rounded'}`}
                                                name="phonenumber"
                                            />
                                        ) : (
                                            <a
                                                href={`tel:${students?.phonenumber}`}
                                                className="text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] underline w-fit"
                                            >
                                                {students.phonenumber}
                                            </a>
                                        )}
                                    </div>
                                    <div className='flex flex-col gap-3 text-center'>
                                        <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>Is Active</p>
                                        <input
                                            type="text"
                                            value={students?.isActive}
                                            onChange={handleChange}
                                            className={`text-[14px] md:text-[16px] text-center sh:text-start capitalize font-medium text-[#252525] outline-none ${edit && 'outline-black/50 sh:w-[70%] px-2 py-1 rounded'}`}
                                            name="isActive"
                                            id=""
                                            readOnly={!edit}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-2 sh:w-1/2 w-full'>
                                <div className='flex flex-col gap-[33px] items-center sh:items-start w-full'>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>Cohort</p>
                                        {edit ? (
                                            <input
                                                type="text"
                                                value={students?.cohortApplied}
                                                onChange={handleChange}
                                                className={`text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] outline-none ${edit && 'outline-black/50 sh:w-[70%] px-2 py-1 rounded'}`}
                                                name="cohortApplied"
                                            />
                                        ) : (
                                            <p className="text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525]">
                                                {students.cohortApplied ? students.cohortApplied : 'Not Provided'}
                                            </p>
                                        )}
                                    </div>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>Date Joined</p>

                                        <p className="text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525]">
                                            {new Date(students.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>Cerificates Earned</p>
                                        {edit ? (
                                            <textarea
                                                value={students?.certificatesEarned}
                                                onChange={handleChange}
                                                className={`text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] outline-none ${edit && 'outline-black/50 sh:w-[70%] px-2 py-1 rounded'}`}
                                                name="certificatesEarned"
                                            />
                                        ) : (
                                            <p className="text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525]">
                                                {students.certificatesEarned ? students.certificatesEarned : 'No Cerificates yet'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className='sh:flex hidden flex-col gap-2'>
                                    <div onClick={(e) => {
                                        if (edit) {
                                            editProfile(e)
                                        } else {
                                            setEdit(true)
                                        }
                                    }}
                                        className="text-[16px] cursor-pointer gap-1 font-normal sd:py-[5px] py-[2px] sd:px-[21px] px-[14px] flex items-center justify-center rounded-[20px] text-[#441890] hover:bg-black/10 bg-[#ffffff] border-[0.8px] border-[#441890]"
                                    >
                                        {edit ? (
                                            <p>
                                                {submitting ? "Saving..." : "Save"}
                                            </p>
                                        ) : (
                                            <p>Edit</p>
                                        )}
                                        {edit ? (
                                            <FiSave />
                                        ) : (
                                            <img src={editImg} alt="" />
                                        )}
                                    </div>
                                    {edit && (
                                        <p
                                            className="text-[16px] cursor-pointer gap-1 font-normal sd:py-[5px] py-[2px] sd:px-[21px] px-[14px] flex items-center justify-center rounded-[20px] text-[#441890] hover:bg-black/10 bg-[#ffffff] border-[0.8px] border-[#441890]"
                                            onClick={() => setEdit(false)}
                                        >
                                            Cancel
                                            <FaTimes />
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col items-center sh:items-start gap-3'>
                            <p className='text-xs md:text-[14px] text-center sh:text-start font-medium text-[#25252580]'>Comment</p>
                            {edit ? (
                                <textarea
                                    value={students?.note}
                                    onChange={handleChange}
                                    className={`text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525] outline-none ${edit && 'outline-black/50 w-[70%] px-2 py-1 rounded'}`}
                                    name="note"
                                />
                            ) : (
                                <p className="text-[14px] md:text-[16px] text-center sh:text-start font-medium text-[#252525]">
                                    {students.note ? students.note : 'No Comment'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                        <p className='sa:text-xl text-lg font-medium text-[#252525]'>📊 Performance Summary</p>
                        <div className='flex justify-between items-start w-full'>
                            <div className='flex flex-col gap-[33px]'>
                                <div className='flex flex-col gap-3'>
                                    <p className='text-[15px] md:text-[17px] font-medium text-[#25252580]'>Chapters</p>
                                    <p className='text-[14px] md:text-[16px] text-center font-medium text-[#252525] outline-none'>
                                        <span>{chaptersCompleted}</span> / <span>{totalChapter}</span>
                                    </p>
                                    <div className='bg-black/20 w-full rounded-full h-[10px]'>
                                        <div
                                            className={`h-full rounded-full ${chapterPercentage > 40 ? "bg-green-500" : "bg-red-500"}`}
                                            style={{ width: `${chapterPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <p className='text-[15px] md:text-[17px] font-medium text-[#25252580]'>Courses</p>
                                    <p className='text-[14px] md:text-[16px] text-center font-medium text-[#252525] outline-none'>
                                        <span>{coursesCompleted}</span> / <span>{totalCourses}</span>
                                    </p>
                                    <div className='bg-black/20 w-full rounded-full h-[10px]'>
                                        <div
                                            className={`h-full rounded-full ${coursesPercentage > 40 ? "bg-green-500" : "bg-red-500"}`}
                                            style={{ width: `${coursesPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col gap-[33px]'>
                                <div className='flex flex-col gap-3'>
                                    <p className='text-[15px] md:text-[17px] font-medium text-[#25252580]'>Classes</p>
                                    <p className='text-[14px] md:text-[16px] text-center font-medium text-[#252525] outline-none'>
                                        <span>{classesCompleted}</span> / <span>{totalClasses}</span>
                                    </p>
                                    <div className='bg-black/20 w-full rounded-full h-[10px]'>
                                        <div
                                            className={`h-full rounded-full ${classPercentage > 40 ? "bg-green-500" : "bg-red-500"}`}
                                            style={{ width: `${classPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <p className='text-[15px] md:text-[17px] font-medium text-[#25252580]'>Quizzes</p>
                                    <p className='text-[14px] md:text-[16px] text-center font-medium text-[#252525] outline-none'>
                                        <span>{quizAttempted}</span> / <span>{quiz}</span>
                                    </p>
                                    <div className='bg-black/20 w-full rounded-full h-[10px]'>
                                        <div
                                            className={`h-full rounded-full ${quizPercentage > 40 ? "bg-green-500" : "bg-red-500"}`}
                                            style={{ width: `${quizPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col gap-[65px]'>
                                <div className='flex flex-col gap-3'>
                                    <p className='text-[15px] md:text-[17px] font-medium text-[#25252580]'>Quiz Average</p>
                                    <p className='text-[14px] md:text-[16px] text-center font-medium text-[#252525] outline-none'>
                                        <span>{quizAverage}%</span>
                                    </p>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <p className='text-[15px] md:text-[17px] font-medium text-[#25252580]'>Strength Level</p>
                                    <p className='text-[14px] md:text-[16px] text-center font-medium text-[#252525] outline-none'>
                                        <span>{strengthLvl}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[15px] xl:px-[50px]'>
                        <ActivityBarChart stats={stats} />
                    </div>
                    <div className="border border-gray-200 rounded-2xl bg-white p-5 sm:p-8 space-y-6 shadow-md">
                        <h2 className="sa:text-xl text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-blue-600">📘</span> Recent Activity
                        </h2>

                        {timeline.length === 0 ? (
                            <p className="text-gray-500">No recent activity yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {timeline.map((item) => (
                                    <div
                                        key={item.blogId}
                                        className="border border-gray-100 rounded-xl bg-gray-50 p-4 hover:shadow-sm transition duration-200"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="sm:text-lg sa:text-base text-sm font-semibold text-gray-800">{item.blogTitle}</h3>
                                                <p className="sa:text-sm text-xs text-gray-600 mt-1">
                                                    <span className="font-medium">Chapter:</span> {item.chapterTitle}
                                                </p>
                                                <p className="sa:text-sm text-xs text-gray-600">
                                                    <span className="font-medium">Course:</span> {item.courseNumber || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="sa:text-sm text-xs text-gray-500 text-right">
                                                <p className="font-medium text-green-500">Completed</p>
                                                <p>{new Date(item.completedAt).toLocaleDateString()}<br />{new Date(item.completedAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserDetails