import { useEffect, useState } from "react"
import AgeSegmentationChart from "../Components/AgeSegmentationChart"
import CohortInsights from "../Components/CohortInsights"
import DropOffTracking from "../Components/DropOffTracking"
import EngagementAnalysis from "../Components/EngagementAnalysis"
import GenderDistributionChart from "../Components/GenderDistributionChart"
import GeographicalSpread from "../Components/GeographicalSpread"
import PerformanceMetricsOverview from "../Components/PerformanceMetricsOverview"
import TopPerformers from "../Components/TopPerformers"
import { downloadExcel, downloadPDF } from '../utils/downloadUtils';

const Analytics = () => {

    const [loading, setLoading] = useState(false);

    const [allData, setAllData] = useState({
        gender: [],
        age: [],
        geography: [],
        engagement: [],
        performance: [],
        cohort: [],
        topPerformers: [],
        dropOff: [],
        classActivities: []
    });

    const fetchAllData = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        setLoading(true);
        try {
            const [
                genderRes,
                ageRes,
                geoRes,
                engagementRes,
                performanceRes,
                cohortRes,
                topRes,
                dropOffRes,
                classActRes
            ] = await Promise.all([
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gender-distribution?cohort=`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/age-segmentation`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/geographical-distribution`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/engagement-analysis?range=monthly`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/performance-metrics`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cohort-insights`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/top-performers`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/drop-off-tracking`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/class-completions`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const [
                gender, age, geography, engagement, performance, cohort, topPerformers, dropOff, classActivities
            ] = await Promise.all([
                genderRes.json(),
                ageRes.json(),
                geoRes.json(),
                engagementRes.json(),
                performanceRes.json(),
                cohortRes.json(),
                topRes.json(),
                dropOffRes.json(),
                classActRes.json()
            ]);

            setAllData({
                gender,
                age,
                geography,
                engagement,
                performance,
                cohort,
                topPerformers,
                dropOff,
                classActivities
            });
        } catch (err) {
            console.error("Error loading all analytics data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);


    return (
        <div className="mh:px-10 relative px-3 py-20 flex overflow-y-auto flex-col gap-6">
            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <GenderDistributionChart data={allData.gender} loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <AgeSegmentationChart data={allData.age} loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <GeographicalSpread data={allData.geography} loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <EngagementAnalysis data2={allData.classActivities} data={allData.engagement} loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <PerformanceMetricsOverview data={allData.performance} loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <CohortInsights data={allData.cohort} loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <TopPerformers data={allData.topPerformers} loading={loading} setLoading={setLoading} />
            </div>

            <div className='border-[1.5px] border-[#25252533] sd:rounded-[20px] rounded-xl flex flex-col gap-[26px] sd:py-[30px] p-[20px] xl:px-[50px]'>
                <DropOffTracking data={allData.dropOff} loading={loading} setLoading={setLoading} />
            </div>

            <div className="flex absolute top-0 sp:right-10 right-3 gap-4 justify-end my-4">
                <button
                    className="bg-blue-600 text-white sp:px-4 px-1 sp:text-base text-sm py-2 rounded"
                    onClick={() => downloadExcel(allData, 'Analytics_Report.xlsx')}
                >
                    📥 Download CSV
                </button>

                <button
                    className="bg-green-600 text-white sp:px-4 px-1 sp:text-base text-sm py-2 rounded"
                    onClick={() => downloadPDF(allData, 'Analytics_Report.pdf')}
                >
                    📄 Download PDF
                </button>
            </div>

        </div>
    )
}

export default Analytics