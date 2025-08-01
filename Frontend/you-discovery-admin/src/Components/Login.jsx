import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate()

    const [logIn, setLogInData] = useState({
        email: '',
        password: ''
    })

    const [allInputBoxFilled, setAllInputBoxFilled] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [status, setStatus] = useState({ message: '', type: '' })
    const [modal, setModal] = useState(false)


    useEffect(() => {
        if (logIn.email && logIn.password) {
            setAllInputBoxFilled(true)
        } else {
            setAllInputBoxFilled(false)
        }
    }, [logIn])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setLogInData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const login = async (e) => {
        e.preventDefault()

        setSubmitting(true)

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logIn)
            })

            const data = await res.json()

            const token = data.token;

            if (!res.ok) {
                setModal(true)
                setStatus({ message: data.error, type: 'error' })
            } else {
                console.log('Log in successful:', data);
                setModal(true)
                setStatus({ message: data.message, type: 'success' })
                setTimeout(() => {
                    navigate('/');
                }, 5600);
                localStorage.setItem('adminToken', token);
                localStorage.setItem('tokenTimestamp', Date.now());
            }
        } catch (error) {
            console.error('Log in error:', error);
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        if (modal) {
            const timer = setTimeout(() => {
                setModal(false);
                setStatus({ message: '', type: '' });
            }, 5600);

            return () => clearTimeout(timer);
        }
    }, [modal]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="mx-auto my-20 relative text-center flex flex-col items-center justify-center">
                <div className='sp:w-[441px] w-[353px] gap-5 flex flex-col items-center justify-center'>
                    <h1 className='sp:text-[40px] text-[32px] font-medium text-[#252525]'>Log in</h1>
                    <p className='text-[#25252580] text-[15px] mt-[-10px] font-normal'>Already have an account?
                        <Link to='/auth/signup'>
                            <span className='text-[16px] ml-2 underline cursor-pointer text-[#4285F4]'>Create account</span>
                        </Link>
                    </p>
                    {/* <div className='flex w-full rounded cursor-pointer items-center justify-center border-[1.38px] border-[#4285F4] py-3 px-[22px] gap-3'>
                        <img src={google} alt="" />
                        <p className='text-[#4285F4] font-medium text-[16px]'>Log in with Google</p>
                    </div> */}
                    <div className='text-[#55555580] flex gap-4 items-center'>
                        <hr className='w-[130px] border-[1.33px] border-[#55555580] mt-1' /><span className='text-[16px] font-medium'>or</span> <hr className='w-[130px] mt-1 border-[#55555580] border-[1.33px]' />
                    </div>
                    <form onSubmit={login} className='w-full gap-6 flex flex-col'>
                        {modal && (
                            <div className={`${status.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white absolute top-[30px] z-50 right-0 p-3 rounded-md flex items-center text-center justify-between`}>
                                <p className='md:text-[16px] text-[13px] 3xl:text-[22px] font-bold'>
                                    {status.type === 'error' ? `${status.message}` : `${status.message}. Redirecting...`}
                                </p>
                            </div>
                        )}
                        <input
                            className='border-[1.1px] text-[#252525] text-[16px] placeholder:text-[#25252580] font-medium outline-none border-[#25252580] p-3 gap-2 rounded-[2px] w-full'
                            type="email"
                            name="email"
                            value={logIn.email}
                            onChange={handleInputChange}
                            id="email"
                            placeholder='Email'
                        />
                        <input
                            className='border-[1.1px] text-[#252525] text-[16px] placeholder:text-[#25252580] font-medium outline-none border-[#25252580] p-3 gap-2 rounded-[2px] w-full'
                            type="password"
                            name="password"
                            value={logIn.password}
                            onChange={handleInputChange}
                            id="password"
                            placeholder='Enter your password'
                        />
                        <button
                            className={`text-white rounded-md p-3 gap-2 outline-none w-full ${allInputBoxFilled && !submitting ? 'bg-[#441890] hover:bg-[#441890CC] cursor-pointer' : allInputBoxFilled && submitting ? 'bg-[#4418904D] cursor-not-allowed' : 'bg-[#4418904D] cursor-not-allowed'}`}
                            type='submit'
                            disabled={!allInputBoxFilled || submitting}
                        >
                            {submitting ? 'Loading...' : 'Continue'}
                        </button>
                        {/* <p className='sp:text-[16px] underline text-[14px] font-medium w-full text-[#4285F4]'>Forgot your password?</p> */}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login