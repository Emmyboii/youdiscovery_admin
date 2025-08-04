import { useState } from "react"
import AgeSegmentationChart from "../Components/AgeSegmentationChart"
import CohortInsights from "../Components/CohortInsights"
import DropOffTracking from "../Components/DropOffTracking"
import EngagementAnalysis from "../Components/EngagementAnalysis"
import GenderDistributionChart from "../Components/GenderDistributionChart"
import GeographicalSpread from "../Components/GeographicalSpread"
import PerformanceMetricsOverview from "../Components/PerformanceMetricsOverview"
import TopPerformers from "../Components/TopPerformers"

const Analytics = () => {

    const [loading, setLoading] = useState(false);

    return (
        <div className="mh:px-10 px-3 z-50 py-14 flex flex-col gap-4">
            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <GenderDistributionChart loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <AgeSegmentationChart loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <GeographicalSpread loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <EngagementAnalysis loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <PerformanceMetricsOverview loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <CohortInsights loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <TopPerformers loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <DropOffTracking loading={loading} setLoading={setLoading} />
            </div>
        </div>
    )
}

export default Analytics