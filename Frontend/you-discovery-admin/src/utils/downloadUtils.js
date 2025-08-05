import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const downloadExcel = (data, filename = 'Analytics_Report.xlsx') => {
    const wb = XLSX.utils.book_new();

    // 1. Gender Distribution
    if (Array.isArray(data.gender)) {
        const genderSheet = XLSX.utils.json_to_sheet(
            data.gender.map(d => ({ Gender: d.name, Count: d.value }))
        );
        XLSX.utils.book_append_sheet(wb, genderSheet, 'Gender Distribution');
    }

    // 2. Age Segmentation
    if (Array.isArray(data.age)) {
        const ageSheet = XLSX.utils.json_to_sheet(
            data.age.map(d => ({ 'Age Group': d.range, Count: d.count }))
        );
        XLSX.utils.book_append_sheet(wb, ageSheet, 'Age Segmentation');
    }

    // 3. Geographical Spread
    if (data.geography?.byCountry) {
        const geoSheet = XLSX.utils.json_to_sheet(
            Object.entries(data.geography.byCountry).map(([country, count]) => ({
                Country: country,
                Count: count
            }))
        );
        XLSX.utils.book_append_sheet(wb, geoSheet, 'Geography');
    }

    // 4. Engagement Analysis
    if (data.engagement) {
        const regSheet = XLSX.utils.json_to_sheet(
            (data.engagement.registrations || []).map(r => ({
                Date: r.label,
                Registrations: r.count
            }))
        );
        XLSX.utils.book_append_sheet(wb, regSheet, 'New Registrations');

        const loginSheet = XLSX.utils.json_to_sheet(
            (data.engagement.logins || []).map(r => ({
                Date: r.label,
                Logins: r.logins
            }))
        );
        XLSX.utils.book_append_sheet(wb, loginSheet, 'Logins');
    }

    // 5. Performance Metrics
    if (data.performance) {
        const perfSheet = XLSX.utils.json_to_sheet([
            {
                'Avg Quiz Score': `${data.performance.averageQuizScore}%`,
                'Avg Completion Rate': `${data.performance.avgCompletionRate}%`,
                'Certificates Issued': data.performance.certificatesIssued,
                'Most Popular Course': data.performance.mostPopularCourse,
                'Most Completed Class': data.performance.mostCompletedClass,
                'Most Completed Quiz': data.performance.mostCompletedQuiz
            }
        ]);
        XLSX.utils.book_append_sheet(wb, perfSheet, 'Performance');
    }

    // 6. Cohort Insights
    if (typeof data.cohort === 'object' && data.cohort !== null) {
        const cohortSheet = XLSX.utils.json_to_sheet(
            Object.entries(data.cohort).map(([key, value]) => ({
                Metric: key,
                Value: value
            }))
        );
        XLSX.utils.book_append_sheet(wb, cohortSheet, 'Cohort Insights');
    }

    // 7. Top Performers
    if (data.topPerformers) {
        if (Array.isArray(data.topPerformers.topByScore)) {
            const topScoreSheet = XLSX.utils.json_to_sheet(
                data.topPerformers.topByScore.map((u, i) => ({
                    Rank: i + 1,
                    Name: u.name,
                    Email: u.email,
                    'Average Score': `${u.avgScore}%`,
                    Cohort: u.cohort
                }))
            );
            XLSX.utils.book_append_sheet(wb, topScoreSheet, 'Top by Score');
        }

        if (Array.isArray(data.topPerformers.topByConsistency)) {
            const topConsSheet = XLSX.utils.json_to_sheet(
                data.topPerformers.topByConsistency.map((u, i) => ({
                    Rank: i + 1,
                    Name: u.name,
                    Email: u.email,
                    Consistency: `${u.consistency}%`,
                    Cohort: u.cohort
                }))
            );
            XLSX.utils.book_append_sheet(wb, topConsSheet, 'Top by Consistency');
        }
    }

    // 8. Drop-Off Tracking
    if (data.dropOff && typeof data.dropOff === 'object') {
        const dropOffSheet = XLSX.utils.json_to_sheet(
            Object.entries(data.dropOff).map(([stage, count]) => ({
                Stage: stage,
                DropOffs: count
            }))
        );
        XLSX.utils.book_append_sheet(wb, dropOffSheet, 'Drop-Off');
    }

    // Write to file
    XLSX.writeFile(wb, filename);
};

export const downloadPDF = (data, filename = 'analytics.pdf') => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("Analytics Report", 105, 20, { align: 'center' });

    const sections = flattenAnalyticsData(data, true); // { title, rows }[]
    let y = 30;

    sections.forEach((section, index) => {
        // Add new page if we're too far down
        if (y > 250 && index !== 0) {
            doc.addPage();
            y = 20;
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text("Analytics Report", 105, y, { align: 'center' });
            y += 10;
        }

        // 🔹 Bold + bigger section title
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(section.title, 14, y);
        y += 6;

        // 🔸 Normal font for table
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        autoTable(doc, {
            head: [Object.keys(section.rows[0] || {})],
            body: section.rows.map(Object.values),
            startY: y,
            theme: 'striped',
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 },
            didDrawPage: (data) => {
                y = data.cursor.y + 10;
            },
        });
    });

    doc.save(filename);
};



const flattenAnalyticsData = (data, forPDF = false) => {
    const sections = [];

    // Gender
    if (data.gender) {
        const rows = (Array.isArray(data.gender) ? data.gender : [data.gender])
            .map(d => ({ Gender: d.name, Count: d.value }));
        if (forPDF) sections.push({ title: 'Gender Distribution', rows });
        else sections.push(...rows.map(r => ({ Section: 'Gender Distribution', ...r })));
    }

    // Age Segmentation
    if (data.age) {
        const rows = data.age.map(d => ({
            AgeGroup: d.range,
            Count: d.count
        }));
        if (forPDF) sections.push({ title: 'Age Segmentation', rows });
        else sections.push(...rows.map(r => ({ Section: 'Age Segmentation', ...r })));
    }

    // Geography
    if (data.geography) {
        const countryRows = Object.entries(data.geography.byCountry || {}).map(([key, val]) => ({
            Location: key,
            Count: val
        }));
        if (forPDF) sections.push({ title: 'Geographical Distribution (Country)', rows: countryRows });
        else sections.push(...countryRows.map(r => ({ Section: 'Geo (Country)', ...r })));
    }

    // Engagement
    if (data.engagement) {
        const regRows = (data.engagement.registrations || []).map(r => ({
            Date: r.label,
            Registrations: r.count
        }));
        const loginRows = (data.engagement.logins || []).map(r => ({
            Date: r.label,
            Logins: r.logins
        }));
        if (forPDF) {
            if (regRows.length) sections.push({ title: 'New Registrations', rows: regRows });
            if (loginRows.length) sections.push({ title: 'Login Activity', rows: loginRows });
        } else {
            sections.push(...regRows.map(r => ({ Section: 'Registrations', ...r })));
            sections.push(...loginRows.map(r => ({ Section: 'Logins', ...r })));
        }
    }

    // Performance
    if (data.performance) {
        const perfRows = [{
            'Avg Quiz Score': `${data.performance.averageQuizScore}%`,
            'Avg Completion Rate': `${data.performance.avgCompletionRate}%`,
            'Certificates Issued': data.performance.certificatesIssued,
            'Most Popular Course': data.performance.mostPopularCourse,
            'Most Completed Class': data.performance.mostCompletedClass,
            'Most Completed Quiz': data.performance.mostCompletedQuiz
        }];
        if (forPDF) sections.push({ title: 'Performance Metrics', rows: perfRows });
        else sections.push(...perfRows.map(r => ({ Section: 'Performance Metrics', ...r })));
    }

    // Cohort
    if (data.cohort) {
        const cohortRows = Object.entries(data.cohort).map(([key, val]) => ({
            Metric: key,
            Value: val
        }));
        if (forPDF) sections.push({ title: 'Cohort Insights', rows: cohortRows });
        else sections.push(...cohortRows.map(r => ({ Section: 'Cohort Insights', ...r })));
    }

    // Top Performers
    if (data.topPerformers) {
        const topScore = data.topPerformers.topByScore.map((u, i) => ({
            Rank: i + 1,
            Name: u.name,
            Email: u.email,
            AvgScore: u.avgScore,
            Cohort: u.cohort
        }));
        const topConsistent = data.topPerformers.topByConsistency.map((u, i) => ({
            Rank: i + 1,
            Name: u.name,
            Email: u.email,
            Consistency: `${u.consistency}%`,
            Cohort: u.cohort
        }));
        if (forPDF) {
            if (topScore.length) sections.push({ title: 'Top Performers by Score', rows: topScore });
            if (topConsistent.length) sections.push({ title: 'Top Performers by Consistency', rows: topConsistent });
        } else {
            sections.push(...topScore.map(r => ({ Section: 'Top Score', ...r })));
            sections.push(...topConsistent.map(r => ({ Section: 'Top Consistency', ...r })));
        }
    }

    // Drop-Off
    if (data.dropOff) {
        const rows = Object.entries(data.dropOff || {}).map(([stage, count]) => ({
            Stage: stage,
            DropOffs: count
        }));
        if (forPDF) sections.push({ title: 'Drop-Off Tracking', rows });
        else sections.push(...rows.map(r => ({ Section: 'Drop-Off', ...r })));
    }

    return forPDF ? sections : sections;
};
