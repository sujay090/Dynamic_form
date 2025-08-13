import React, { useState, useEffect } from 'react';
import { publicService } from '../../API/services/publicService';
import type { PublicStatistics } from '../../API/services/publicService';

export const StatsDebug: React.FC = () => {
    const [statistics, setStatistics] = useState<PublicStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                console.log('Debug: Fetching statistics...');
                const data = await publicService.getPublicStatistics();
                console.log('Debug: Statistics received:', data);
                setStatistics(data);
            } catch (err: any) {
                console.error('Debug: Error fetching statistics:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8 bg-yellow-100 border border-yellow-300">Loading statistics...</div>;
    }

    if (error) {
        return <div className="p-8 bg-red-100 border border-red-300">Error: {error}</div>;
    }

    if (!statistics) {
        return <div className="p-8 bg-gray-100 border border-gray-300">No statistics data</div>;
    }

    return (
        <div className="p-8 bg-green-100 border border-green-300">
            <h3 className="text-lg font-bold mb-4">Statistics Debug</h3>
            <pre className="text-sm bg-white p-4 rounded overflow-auto">
                {JSON.stringify(statistics, null, 2)}
            </pre>

            <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="bg-blue-100 p-4 rounded">
                    <h4 className="font-bold">Total Students</h4>
                    <p className="text-2xl">{statistics.students.total}</p>
                </div>
                <div className="bg-purple-100 p-4 rounded">
                    <h4 className="font-bold">Active Courses</h4>
                    <p className="text-2xl">{statistics.courses.active}</p>
                </div>
                <div className="bg-orange-100 p-4 rounded">
                    <h4 className="font-bold">Active Branches</h4>
                    <p className="text-2xl">{statistics.branches.active}</p>
                </div>
                <div className="bg-green-100 p-4 rounded">
                    <h4 className="font-bold">Success Rate</h4>
                    <p className="text-2xl">{statistics.students.successRate}%</p>
                </div>
            </div>
        </div>
    );
};
