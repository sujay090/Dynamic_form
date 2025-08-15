import { BookOpen, Clock, ChevronRight, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect, useRef } from 'react';
import { getDynamicFormDataAPI } from '../../API/services/studentService';
import type { BranchSettings } from '../../API/services/settingsService';

interface ServicesSectionProps {
    settings: BranchSettings;
}

interface Course {
    _id: string;
    formType: string;
    fieldsData: Array<{
        name: string;
        value: any;
    }>;
    createdAt: string;
    updatedAt: string;
}

export const ServicesSection = ({ settings }: ServicesSectionProps) => {
    // Drag-to-scroll logic
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const slider = scrollRef.current;
        if (!slider) return;
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        const handleMouseDown = (e: MouseEvent) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };
        const handleMouseLeave = () => {
            isDown = false;
            slider.classList.remove('active');
        };
        const handleMouseUp = () => {
            isDown = false;
            slider.classList.remove('active');
        };
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        };
        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mouseleave', handleMouseLeave);
        slider.addEventListener('mouseup', handleMouseUp);
        slider.addEventListener('mousemove', handleMouseMove);
        return () => {
            slider.removeEventListener('mousedown', handleMouseDown);
            slider.removeEventListener('mouseleave', handleMouseLeave);
            slider.removeEventListener('mouseup', handleMouseUp);
            slider.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper function to get field value from fieldsData (handles nested structure)
    const getFieldValue = (fieldsData: Array<{ name: string; value: any }>, fieldName: string) => {
        // Check if fieldsData has the nested structure
        const fieldsDataField = fieldsData.find(f => f.name === 'fieldsData');

        if (fieldsDataField && Array.isArray(fieldsDataField.value)) {
            // If it's the nested structure, look in the value array
            const field = fieldsDataField.value.find((f: any) => f.name === fieldName);
            return field ? field.value : null;
        } else {
            // If it's the direct structure, look directly
            const field = fieldsData.find(f => f.name === fieldName);
            return field ? field.value : null;
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await getDynamicFormDataAPI("course");
            console.log('Courses API response:', response);

            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // Filter only active courses using the helper function
                const activeCourses = response.data.data.filter((course: Course) => {
                    // Use helper function to get isActive field from nested structure
                    const isActive = getFieldValue(course.fieldsData, 'isActive');
                    return isActive === true || isActive === 'true';
                });
                setCourses(activeCourses);
                console.log('Active courses loaded:', activeCourses);
            } else {
                console.warn('Unexpected API response structure:', response.data);
                setCourses([]);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }; return (
        <section id="services" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <div
                            className="w-20 h-0.5 mx-auto rounded-full"
                            style={{ backgroundColor: settings.theme?.primaryColor || '#059669' }}
                        ></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Our Courses
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Explore our comprehensive course offerings designed to help you succeed
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading courses...</p>
                    </div>
                ) : courses && courses.length > 0 ? (
                    <>
                        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                            {courses.map((course, index) => {
                                const courseName = getFieldValue(course.fieldsData, 'courseName') || 'Course';
                                const description = getFieldValue(course.fieldsData, 'description') || 'No description available';
                                const price = getFieldValue(course.fieldsData, 'fees') || getFieldValue(course.fieldsData, 'price') || 0;
                                const duration = getFieldValue(course.fieldsData, 'duration') || 0;
                                const category = getFieldValue(course.fieldsData, 'category') || 'General';
                                const courseImage = getFieldValue(course.fieldsData, 'courseImage');
                                const fullImageUrl = courseImage ?
                                    (courseImage.startsWith('http') ? courseImage : `http://localhost:4070${courseImage}`) :
                                    null;
                                const gradients = [
                                    'from-blue-500 to-purple-600',
                                    'from-green-500 to-teal-600',
                                    'from-orange-500 to-red-600',
                                    'from-purple-500 to-pink-600',
                                    'from-indigo-500 to-blue-600',
                                    'from-teal-500 to-green-600'
                                ];
                                const gradientClass = gradients[index % gradients.length];

                                return (
                                    <div
                                        key={course._id}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex-shrink-0"
                                        style={{ width: 250 }}
                                    >
                                        <div className={`relative h-40 ${!fullImageUrl ? `bg-gradient-to-br ${gradientClass}` : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                                            {fullImageUrl ? (
                                                <img
                                                    src={fullImageUrl}
                                                    alt={courseName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        const container = target.parentElement;
                                                        if (container) {
                                                            target.style.display = 'none';
                                                            container.className = `relative h-40 bg-gradient-to-br ${gradientClass} flex items-center justify-center overflow-hidden`;
                                                            container.innerHTML = `
                                                                <div class=\"text-white text-center p-6\">
                                                                    <svg class=\"w-12 h-12 mx-auto mb-3\" fill=\"currentColor\" viewBox=\"0 0 24 24\">
                                                                        <path d=\"M12 6.042A8.967 8.967 0 006 3c-1.334 0-2.577.302-3.691.846-.37.18-.609.552-.609.984v15.34c0 .708.707 1.198 1.37.832C4.188 20.542 5.089 20.25 6 20.25c1.334 0 2.577.302 3.691.846.37.18.609.552.609.984v-.84c0-.432-.24-.805-.609-.985C8.577 19.802 7.334 19.5 6 19.5c-.91 0-1.81.292-2.93.832V5.17A6.967 6.967 0 016 4.5c1.334 0 2.577-.302 3.691-.846.37-.18.609-.552.609-.984V2.83c0 .432.24.805.609.985C11.423 4.198 12.666 4.5 14 4.5c.91 0 1.81-.292 2.93-.832v14.662c-1.12-.54-2.02-.832-2.93-.832-1.334 0-2.577.302-3.691.846-.37.18-.609.552-.609.984v.84c0-.432.24-.804.609-.984C10.423 19.698 11.666 20 13 20c.91 0 1.81.292 2.93.832.663.366 1.37-.124 1.37-.832V4.83c0-.432-.24-.805-.609-.985C15.577 3.302 14.334 3 13 3c-1.334 0-2.577.302-3.691.846-.37.18-.609.552-.609.984v1.212z\" />
                                                                    </svg>
                                                                    <h4 class=\"text-lg font-bold text-center leading-tight\">${courseName}</h4>
                                                                </div>
                                                            `;
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-white text-center p-6">
                                                    <BookOpen size={48} className="mx-auto mb-3" />
                                                    <h4 className="text-lg font-bold text-center leading-tight">
                                                        {courseName}
                                                    </h4>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                        </div>
                                        <div className="p-4">
                                            <span
                                                className="inline-block px-2 py-1 rounded-full text-xs font-medium mb-2"
                                                style={{
                                                    backgroundColor: `${settings.theme?.primaryColor || '#059669'}20`,
                                                    color: settings.theme?.primaryColor || '#059669'
                                                }}
                                            >
                                                Course
                                            </span>
                                            <h3 className="text-base font-bold text-gray-900 mb-1">
                                                {courseName}
                                            </h3>
                                            <p className="text-gray-600 mb-2 text-xs leading-relaxed line-clamp-2">
                                                {description}
                                            </p>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex gap-2 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        <span>{duration} months</span>
                                                    </div>
                                                </div>
                                                <div
                                                    className="text-white px-2 py-1 rounded-full font-bold text-xs"
                                                    style={{
                                                        backgroundColor: settings.theme?.primaryColor || '#059669'
                                                    }}
                                                >
                                                    ₹{Number(price).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Contact CTA */}
                        <div className="text-center mt-16">
                            <p className="text-gray-600 mb-6 text-lg">
                                Need more information about our courses?
                            </p>
                            <Button
                                size="lg"
                                className="text-white font-semibold px-8 py-3 rounded-xl"
                                style={{
                                    backgroundColor: settings.theme?.primaryColor || '#059669'
                                }}
                            >
                                <Phone className="mr-2" size={18} />
                                Contact Us
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                        <h3 className="text-2xl font-bold text-gray-600 mb-2">No Courses Available</h3>
                        <p className="text-gray-500">Courses will appear here once added through Course Management</p>
                    </div>
                )}
            </div>
        </section>
    );
};
