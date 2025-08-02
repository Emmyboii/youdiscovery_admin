import AgeSegmentationChart from "../Components/AgeSegmentationChart"
import CohortInsights from "../Components/CohortInsights"
import DropOffTracking from "../Components/DropOffTracking"
import EngagementAnalysis from "../Components/EngagementAnalysis"
import GenderDistributionChart from "../Components/GenderDistributionChart"
import GeographicalSpread from "../Components/GeographicalSpread"
import PerformanceMetricsOverview from "../Components/PerformanceMetricsOverview"
import TopPerformers from "../Components/TopPerformers"

const Analytics = () => {
    return (
        <div className="mh:px-10 px-3 py-14 flex flex-col gap-4">
            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <GenderDistributionChart />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <AgeSegmentationChart />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <GeographicalSpread />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <EngagementAnalysis />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <PerformanceMetricsOverview />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <CohortInsights />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <TopPerformers />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <DropOffTracking />
            </div>
        </div>
    )
}

export default Analytics