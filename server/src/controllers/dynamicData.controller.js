
import DynamicFormData from "../models/dynamicData.model.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";


const createFormData = async (req, res, next) => {
    try {
        const { formType } = req.body;
        console.log("REQ.BODY:", req.body);

        if (!formType) {
            throw new ApiError(400, "formType is required");
        }

        const bodyData = { ...req.body };

        // Parse booleans
        ['isActive', 'isRegistered', 'completedCourse'].forEach((field) => {
            if (bodyData[field] !== undefined) {
                bodyData[field] = bodyData[field] === 'true';
            }
        });

        // Check for duplicate entries based on formType
        if (formType === 'student' && (bodyData.studentEmail || bodyData.phoneNumber)) {
            const duplicateQuery = {
                formType,
                $or: []
            };

            if (bodyData.studentEmail) {
                duplicateQuery.$or.push({
                    "fieldsData": {
                        $elemMatch: {
                            name: "studentEmail",
                            value: bodyData.studentEmail
                        }
                    }
                });
            }

            if (bodyData.phoneNumber) {
                duplicateQuery.$or.push({
                    "fieldsData": {
                        $elemMatch: {
                            name: "phoneNumber",
                            value: bodyData.phoneNumber
                        }
                    }
                });
            }

            const existingStudent = await DynamicFormData.findOne(duplicateQuery);

            if (existingStudent) {
                throw new ApiError(400, "Student with this email or phone number already exists");
            }
        }

        // Check for duplicate branch entries
        if (formType === 'branch' && (bodyData.addBranch || bodyData.branchCode || bodyData.email)) {
            const duplicateQuery = {
                formType,
                $or: []
            };

            if (bodyData.addBranch) {
                duplicateQuery.$or.push({
                    "fieldsData": {
                        $elemMatch: {
                            name: "addBranch",
                            value: bodyData.addBranch
                        }
                    }
                });
            }

            if (bodyData.branchCode) {
                duplicateQuery.$or.push({
                    "fieldsData": {
                        $elemMatch: {
                            name: "branchCode",
                            value: bodyData.branchCode
                        }
                    }
                });
            }

            if (bodyData.email) {
                duplicateQuery.$or.push({
                    "fieldsData": {
                        $elemMatch: {
                            name: "email",
                            value: bodyData.email
                        }
                    }
                });
            }

            const existingBranch = await DynamicFormData.findOne(duplicateQuery);

            if (existingBranch) {
                throw new ApiError(400, "Branch with this name, code, or email already exists");
            }
        }

        // Check for duplicate course entries
        if (formType === 'course' && (bodyData.courseName || bodyData.courseCode)) {
            const duplicateQuery = {
                formType,
                $or: []
            };

            if (bodyData.courseName) {
                duplicateQuery.$or.push({
                    "fieldsData": {
                        $elemMatch: {
                            name: "courseName",
                            value: bodyData.courseName
                        }
                    }
                });
            }

            if (bodyData.courseCode) {
                duplicateQuery.$or.push({
                    "fieldsData": {
                        $elemMatch: {
                            name: "courseCode",
                            value: bodyData.courseCode
                        }
                    }
                });
            }

            const existingCourse = await DynamicFormData.findOne(duplicateQuery);

            if (existingCourse) {
                throw new ApiError(400, "Course with this name or code already exists");
            }
        }

        // Handle file uploads based on formType
        if (formType === 'student') {
            if (req.files?.studentPhoto?.[0]) {
                bodyData.studentPhoto = `/assets/${req.files.studentPhoto[0].filename}`;
            }
            if (req.files?.signature?.[0]) {
                bodyData.signature = `/assets/${req.files.signature[0].filename}`;
            }
            if (req.files?.documents?.[0]) {
                bodyData.documents = `/assets/${req.files.documents[0].filename}`;
            }
        }

        if (formType === 'course') {
            // Auto-generate course image based on course name
            if (bodyData.courseName) {
                const courseName = bodyData.courseName.toString().toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
                // Use Picsum API with course name as seed for consistent image generation
                bodyData.courseImage = `https://picsum.photos/seed/${courseName}/400/300`;
            }

            // If manual image upload is provided, override the auto-generated one
            if (req.files?.courseImage?.[0]) {
                bodyData.courseImage = `/assets/${req.files.courseImage[0].filename}`;
            }
        }

        if (formType === 'branch') {
            if (req.files?.branchDocument1?.[0]) {
                bodyData.branchDocument1 = `/assets/${req.files.branchDocument1[0].filename}`;
            }
            if (req.files?.branchDocument2?.[0]) {
                bodyData.branchDocument2 = `/assets/${req.files.branchDocument2[0].filename}`;
            }
        }

        // Convert bodyData to fieldsData array
        const fieldsData = Object.entries(bodyData)
            .filter(([key]) => key !== 'formType') // remove formType
            .map(([key, value]) => ({
                name: key,
                value: value,
            }));

        // Save to DB
        const saved = await DynamicFormData.create({
            formType,
            fieldsData,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, saved, "Form data submitted successfully"));
    } catch (error) {
        return next(error);
    }
};


// Update Form Data
const updateFormData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fieldsData } = req.body;
        console.log(`PUT /form-data/${id} body:`, req.body);

        if (!fieldsData || !Array.isArray(fieldsData)) {
            throw new ApiError(400, "Valid fieldsData is required");
        }

        const formData = await DynamicFormData.findById(id);
        if (!formData) {
            throw new ApiError(404, "Form data not found");
        }

        // Check for duplicate entries when updating based on formType
        if (formData.formType === 'student') {
            const emailField = fieldsData.find(field => field.name === 'studentEmail');
            const phoneField = fieldsData.find(field => field.name === 'phoneNumber');

            if (emailField || phoneField) {
                const duplicateQuery = {
                    formType: formData.formType,
                    _id: { $ne: id }, // exclude current record
                    $or: []
                };

                if (emailField) {
                    duplicateQuery.$or.push({
                        "fieldsData": {
                            $elemMatch: {
                                name: "studentEmail",
                                value: emailField.value
                            }
                        }
                    });
                }

                if (phoneField) {
                    duplicateQuery.$or.push({
                        "fieldsData": {
                            $elemMatch: {
                                name: "phoneNumber",
                                value: phoneField.value
                            }
                        }
                    });
                }

                const existingStudent = await DynamicFormData.findOne(duplicateQuery);

                if (existingStudent) {
                    throw new ApiError(400, "Another student with this email or phone number already exists");
                }
            }
        }

        // Check for duplicate branch entries when updating
        if (formData.formType === 'branch') {
            const branchNameField = fieldsData.find(field => field.name === 'addBranch');
            const branchCodeField = fieldsData.find(field => field.name === 'branchCode');
            const emailField = fieldsData.find(field => field.name === 'email');

            if (branchNameField || branchCodeField || emailField) {
                const duplicateQuery = {
                    formType: formData.formType,
                    _id: { $ne: id }, // exclude current record
                    $or: []
                };

                if (branchNameField) {
                    duplicateQuery.$or.push({
                        "fieldsData": {
                            $elemMatch: {
                                name: "addBranch",
                                value: branchNameField.value
                            }
                        }
                    });
                }

                if (branchCodeField) {
                    duplicateQuery.$or.push({
                        "fieldsData": {
                            $elemMatch: {
                                name: "branchCode",
                                value: branchCodeField.value
                            }
                        }
                    });
                }

                if (emailField) {
                    duplicateQuery.$or.push({
                        "fieldsData": {
                            $elemMatch: {
                                name: "email",
                                value: emailField.value
                            }
                        }
                    });
                }

                const existingBranch = await DynamicFormData.findOne(duplicateQuery);

                if (existingBranch) {
                    throw new ApiError(400, "Another branch with this name, code, or email already exists");
                }
            }
        }

        // Check for duplicate course entries when updating
        if (formData.formType === 'course') {
            const courseNameField = fieldsData.find(field => field.name === 'courseName');
            const courseCodeField = fieldsData.find(field => field.name === 'courseCode');

            if (courseNameField || courseCodeField) {
                const duplicateQuery = {
                    formType: formData.formType,
                    _id: { $ne: id }, // exclude current record
                    $or: []
                };

                if (courseNameField) {
                    duplicateQuery.$or.push({
                        "fieldsData": {
                            $elemMatch: {
                                name: "courseName",
                                value: courseNameField.value
                            }
                        }
                    });
                }

                if (courseCodeField) {
                    duplicateQuery.$or.push({
                        "fieldsData": {
                            $elemMatch: {
                                name: "courseCode",
                                value: courseCodeField.value
                            }
                        }
                    });
                }

                const existingCourse = await DynamicFormData.findOne(duplicateQuery);

                if (existingCourse) {
                    throw new ApiError(400, "Another course with this name or code already exists");
                }
            }
        }

        formData.fieldsData = fieldsData;
        await formData.save();

        return res
            .status(200)
            .json(new ApiResponse(200, formData, "Form data updated successfully"));
    } catch (error) {
        return next(error);
    }
};

// Get All Form Data (Optional: Filter by formType)
const getAllFormData = async (req, res) => {
    try {
        const { formType } = req.params;

        if (!formType) {
            return res.status(400).json({
                success: false,
                message: "formType is required",
            });
        }

        const data = await DynamicFormData.find({ formType });

        return res.status(200).json({
            success: true,
            message: "Form data list fetched successfully",
            data,
        });
    } catch (error) {
        console.error("Error in getAllFormData:", error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching form data",
            error: error.message,
        });
    }
};
// Delete Form Data
const deleteFormData = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("DELETE /form-data/:id with id:", id);

        const formData = await DynamicFormData.findById(id);
        if (!formData) {
            throw new ApiError(404, "Form data not found");
        }

        await formData.deleteOne();

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Form data deleted successfully"));
    } catch (error) {
        return next(error);
    }
};

export {
    createFormData,
    updateFormData,
    getAllFormData,
    deleteFormData,
};
