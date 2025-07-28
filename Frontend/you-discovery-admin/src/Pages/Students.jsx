
const Students = () => {
    return (
        <div className='px-10 py-14 w-full'>
            <div className='grid grid-cols-6 gap-20 py-3 border-b border-black/30 text-black/50 font-medium'>
                <p className=''>First Name</p>
                <p className=''>Last Name</p>
                <p className='col-span-2'>Email Address</p>
                <p className=''>Join Date</p>
                <p className=''>View Details</p>
            </div>
            <div className='grid grid-cols-6 gap-20 py-10 border-b border-black/30 text-black font-medium'>
                <p className=''>First Name</p>
                <p className=''>Last Name</p>
                <p className='col-span-2'>Email Address</p>
                <p className=''>Join Date</p>
                <p className='text-blue-400 cursor-pointer font-normal'>View Details</p>
            </div>
        </div>
    )
}

export default Students