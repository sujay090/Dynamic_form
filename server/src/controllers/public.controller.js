import DynamicFormData from "../models/dynamicData.model.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Get public statistics for home page
const getPublicStatistics = async (req, res, next) => {
    try {
        // Fetch students data
        const allStudents = await DynamicFormData.find({ formType: 'student' });

        // Calculate student statistics
        const totalStudents = allStudents.length;
        const completedStudents = allStudents.filter(student => {
            const completedField = student.fieldsData.find(f => f.name === 'completedCourse');
            return completedField?.value === true ||
                completedField?.value === 'true' ||
                completedField?.value === 'on';
        }).length;
        const activeStudents = totalStudents - completedStudents;

        // Fetch courses data
        const allCourses = await DynamicFormData.find({ formType: 'course' });
        const totalCourses = allCourses.length;
        const activeCourses = allCourses.filter(course => {
            const activeField = course.fieldsData.find(f => f.name === 'isActive');
            return activeField?.value === true || activeField?.value === 'true';
        }).length;

        // Fetch branches data
        const allBranches = await DynamicFormData.find({ formType: 'branch' });
        const totalBranches = allBranches.length;
        const activeBranches = allBranches.filter(branch => {
            const activeField = branch.fieldsData.find(f => f.name === 'isActive');
            return activeField?.value === true || activeField?.value === 'true';
        }).length;

        // Get course details with names
        const courseDetails = allCourses.map(course => {
            const getFieldValue = (fieldName, defaultValue = 'N/A') => {
                const field = course.fieldsData.find(f => f.name === fieldName);
                return field ? field.value : defaultValue;
            };

            const isActive = getFieldValue('isActive');

            return {
                _id: course._id,
                name: getFieldValue('courseName'),
                code: getFieldValue('courseCode'),
                duration: getFieldValue('duration'),
                level: getFieldValue('level'),
                category: getFieldValue('category'),
                description: getFieldValue('description'),
                isActive: isActive === true || isActive === 'true',
                createdAt: course.createdAt
            };
        }).filter(course => course.isActive); // Only return active courses

        // Get branch details
        const branchDetails = allBranches.map(branch => {
            const getFieldValue = (fieldName, defaultValue = 'N/A') => {
                const field = branch.fieldsData.find(f => f.name === fieldName);
                return field ? field.value : defaultValue;
            };

            const isActive = getFieldValue('isActive');

            return {
                _id: branch._id,
                name: getFieldValue('addBranch') || getFieldValue('branchName'),
                code: getFieldValue('branchCode'),
                city: getFieldValue('city'),
                state: getFieldValue('state'),
                address: getFieldValue('address'),
                phone: getFieldValue('phone'),
                email: getFieldValue('email'),
                isActive: isActive === true || isActive === 'true',
                createdAt: branch.createdAt
            };
        }).filter(branch => branch.isActive); // Only return active branches

        const statistics = {
            students: {
                total: totalStudents,
                active: activeStudents,
                completed: completedStudents,
                successRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0
            },
            courses: {
                total: totalCourses,
                active: activeCourses,
                details: courseDetails
            },
            branches: {
                total: totalBranches,
                active: activeBranches,
                details: branchDetails
            },
            summary: {
                totalEnrollments: totalStudents,
                coursesOffered: activeCourses,
                branchNetwork: activeBranches,
                graduationRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0
            }
        };

        res.status(200).json(
            new ApiResponse(200, statistics, "Public statistics fetched successfully")
        );
    } catch (error) {
        next(new ApiError(500, error.message || "Error fetching public statistics"));
    }
};

export {
    getPublicStatistics
};
