import React from 'react';
import { Users, BookOpen, MapPin, TrendingUp } from 'lucide-react';
import type { PublicStatistics } from '../../API/services/publicService';

interface StatisticsSectionProps {
    statistics: PublicStatistics | null;
    loading: boolean;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ statistics, loading }) => {
    // Show loading state if loading is true
    if (loading) {
        return (
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block mb-4">
                            <div className="w-20 h-0.5 mx-auto rounded-full bg-blue-600"></div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Our Achievements
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Loading our amazing statistics...
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                                <div className="w-12 h-12 bg-gray-300 rounded-xl mb-4"></div>
                                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // If not loading but no statistics, don't render the section
    if (!statistics) {
        return null;
    }

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <div className="w-20 h-0.5 mx-auto rounded-full bg-blue-600"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Our Achievements
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Discover our impact through numbers - students, courses, and nationwide presence
                    </p>
                </div>

                {/* Main Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    {/* Total Students */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-4xl font-bold text-blue-700 mb-2">{statistics.students.total.toLocaleString()}</div>
                        <div className="text-sm text-blue-600 font-medium">Total Students</div>
                    </div>

                    {/* Total Courses */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                        <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-4xl font-bold text-purple-700 mb-2">{statistics.courses.total}</div>
                        <div className="text-sm text-purple-600 font-medium">Total Courses</div>
                    </div>

                    {/* Active Branches */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                            <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-4xl font-bold text-orange-700 mb-2">{statistics.branches.active}</div>
                        <div className="text-sm text-orange-600 font-medium">Active Branches</div>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-4xl font-bold text-green-700 mb-2">{statistics.students.successRate}%</div>
                        <div className="text-sm text-green-600 font-medium">Success Rate</div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-10 text-white shadow-2xl overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10"></div>
                            <div className="absolute top-10 right-10 w-16 h-16 bg-white rounded-full"></div>
                            <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white rounded-full translate-y-12"></div>
                            <div className="absolute bottom-10 right-0 w-12 h-12 bg-white rounded-full translate-x-6"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="mb-8">
                                <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                    Ready to Join Our Success Story?
                                </h3>
                                <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                                    Become part of our growing community of <span className="font-bold text-white">{statistics.students.total.toLocaleString()} students</span> across <span className="font-bold text-white">{statistics.branches.active} branches</span> nationwide.
                                </p>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                                    <div className="text-2xl font-bold text-white">{statistics.students.total}</div>
                                    <div className="text-blue-100 text-sm">Students</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                                    <div className="text-2xl font-bold text-white">{statistics.courses.total}</div>
                                    <div className="text-blue-100 text-sm">Courses</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                                    <div className="text-2xl font-bold text-white">{statistics.branches.active}</div>
                                    <div className="text-blue-100 text-sm">Branches</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                                    <div className="text-2xl font-bold text-white">{statistics.students.successRate}%</div>
                                    <div className="text-blue-100 text-sm">Success</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    className="bg-white text-blue-600 font-bold px-10 py-4 rounded-2xl"
                                    onClick={() => {
                                        const element = document.getElementById('services');
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        📚 Explore Courses
                                        <span>→</span>
                                    </span>
                                </button>
                                <button
                                    className="border-2 border-white text-white font-bold px-10 py-4 rounded-2xl"
                                    onClick={() => {
                                        const element = document.getElementById('contact');
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        📞 Contact Us
                                        <span>→</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
