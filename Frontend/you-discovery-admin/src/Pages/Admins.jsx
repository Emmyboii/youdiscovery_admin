
const Admins = () => {
    return (
        <div className='px-10 py-14 w-full'>
            <div className='grid grid-cols-6 gap-10 py-3 border-b border-black/30 text-black/50 font-medium'>
                <p className=''>First Name</p>
                <p className=''>Last Name</p>
                <p className='col-span-2'>Email Address</p>
                <p className=''>Admin Role</p>
                {/* <p className=''>View Details</p> */}
            </div>
            <div className='grid grid-cols-6 gap-10 py-10 border-b border-black/30 text-black font-medium'>
                <p className=''>Emmanuel</p>
                <p className=''>Olukoya</p>
                <p className='col-span-2'>olukoyae01@gmail.com</p>
                <p className=''>Super Admin</p>
                <div className="flex items-center gap-4">
                    <p className="border border-black rounded-lg cursor-pointer px-3 py-1 font-normal">Edit</p>
                    <p className="rounded-lg cursor-pointer bg-red-600 text-white px-3 py-1 font-normal">Delete</p>
                </div>
            </div>
        </div>
    )
}

export default Admins