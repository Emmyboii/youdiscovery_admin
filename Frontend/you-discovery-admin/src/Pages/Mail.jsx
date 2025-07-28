
const Mail = () => {
    return (
        <div className="flex flex-col max-w-[700px] mt-5 gap-4 mx-auto w-full">
            <p className="text-[33px] font-bold">Send Message to All Users</p>
            <form className="flex flex-col gap-10">
                <label htmlFor="subject" className="flex flex-col gap-3">
                    <p>Subject</p>
                    <input
                        type="text"
                        name=""
                        id="subject"
                        className="border border-black/40 rounded-lg w-full p-2"
                    />
                </label>
                <label htmlFor="message" className="flex flex-col gap-3">
                    <p>Message</p>
                    <textarea
                        type="text"
                        name=""
                        id="message"
                        className="border resize-none h-[200px] border-black/40 rounded-lg w-full p-2"
                    />
                </label>
            </form>
        </div>
    )
}

export default Mail