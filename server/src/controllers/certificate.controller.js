import DynamicFormData from "../models/student.model.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get field value
const getFieldValue = (fieldsData, fieldName) => {
    const field = fieldsData.find(f => f.name === fieldName);
    return field ? field.value : '';
};

// Generate Student ID Card
export const generateStudentIdCard = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            throw new ApiError(400, "Student ID is required");
        }

        // Fetch student data
        const student = await DynamicFormData.findById(studentId);

        if (!student || student.formType !== 'student') {
            throw new ApiError(404, "Student not found");
        }

        const fieldsData = student.fieldsData;

        // Create PDF document for ID Card (credit card size: 85.6mm x 53.98mm = 242.65pt x 153pt)
        const doc = new PDFDocument({
            size: [242.65, 153],
            margins: { top: 10, bottom: 10, left: 10, right: 10 }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=student-id-card-${getFieldValue(fieldsData, 'studentName')?.replace(/\s+/g, '-') || 'unknown'}.pdf`);

        // Pipe PDF to response
        doc.pipe(res);

        // ID Card Design
        // Background and border
        doc.rect(0, 0, 242.65, 153).fillAndStroke('#f8f9fa', '#007bff');

        // Header background
        doc.rect(0, 0, 242.65, 35).fill('#007bff');

        // Institute name
        doc.fontSize(12).fillColor('white').font('Helvetica-Bold')
            .text('INSTITUTE ID CARD', 10, 12, { align: 'center', width: 222.65 });

        // Student photo placeholder (if photo exists)
        const photoPath = getFieldValue(fieldsData, 'studentPhoto');
        if (photoPath) {
            try {
                // Add photo if exists (assuming it's stored in public folder)
                const fullPhotoPath = path.join(__dirname, '../../public', photoPath);
                if (fs.existsSync(fullPhotoPath)) {
                    doc.image(fullPhotoPath, 15, 45, { width: 40, height: 50 });
                }
            } catch (error) {
                console.log('Photo not found, using placeholder');
            }
        }

        // Photo placeholder if no photo
        if (!photoPath) {
            doc.rect(15, 45, 40, 50).stroke('#ccc');
            doc.fontSize(8).fillColor('#666')
                .text('PHOTO', 18, 67, { width: 34, align: 'center' });
        }

        // Student details
        doc.fontSize(10).fillColor('#333').font('Helvetica-Bold');

        let yPosition = 50;
        const leftMargin = 65;

        // Student Name
        const studentName = getFieldValue(fieldsData, 'studentName') || 'N/A';
        doc.text('Name:', leftMargin, yPosition);
        doc.font('Helvetica').text(studentName, leftMargin + 35, yPosition, { width: 140 });

        yPosition += 12;

        // Registration Number
        const regNo = getFieldValue(fieldsData, 'registrationNumber') || 'N/A';
        doc.font('Helvetica-Bold').text('Reg No:', leftMargin, yPosition);
        doc.font('Helvetica').text(regNo, leftMargin + 35, yPosition);

        yPosition += 12;

        // Course
        const course = getFieldValue(fieldsData, 'selectedCourse') || 'N/A';
        doc.font('Helvetica-Bold').text('Course:', leftMargin, yPosition);
        doc.font('Helvetica').text(course, leftMargin + 35, yPosition, { width: 140 });

        yPosition += 12;

        // Phone
        const phone = getFieldValue(fieldsData, 'phoneNumber') || 'N/A';
        doc.font('Helvetica-Bold').text('Phone:', leftMargin, yPosition);
        doc.font('Helvetica').text(phone, leftMargin + 35, yPosition);

        // Footer
        doc.fontSize(6).fillColor('#666')
            .text('Valid for Academic Session 2024-25', 10, 140, { align: 'center', width: 222.65 });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error("Error generating ID card:", error);
        if (!res.headersSent) {
            throw new ApiError(500, "Failed to generate ID card");
        }
    }
};

// Generate Course Completion Certificate
export const generateCourseCertificate = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            throw new ApiError(400, "Student ID is required");
        }

        // Fetch student data
        const student = await DynamicFormData.findById(studentId);

        if (!student || student.formType !== 'student') {
            throw new ApiError(404, "Student not found");
        }

        const fieldsData = student.fieldsData;

        // Check if course is completed
        const courseCompleted = getFieldValue(fieldsData, 'completedCourse');
        if (!courseCompleted) {
            throw new ApiError(400, "Certificate can only be generated for students who have completed their course");
        }

        // Create PDF document for Certificate (A4 landscape)
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Set response headers
        const studentName = getFieldValue(fieldsData, 'studentName')?.replace(/\s+/g, '-') || 'unknown';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=course-certificate-${studentName}.pdf`);

        // Pipe PDF to response
        doc.pipe(res);

        // Certificate Design
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Decorative border
        doc.rect(30, 30, pageWidth - 60, pageHeight - 60).lineWidth(3).stroke('#d4a574');
        doc.rect(40, 40, pageWidth - 80, pageHeight - 80).lineWidth(1).stroke('#d4a574');

        // Header
        doc.fontSize(24).fillColor('#d4a574').font('Helvetica-Bold')
            .text('CERTIFICATE OF COMPLETION', 0, 80, { align: 'center', width: pageWidth });

        // Decorative line
        doc.moveTo(200, 120).lineTo(pageWidth - 200, 120).lineWidth(2).stroke('#d4a574');

        // Main content
        doc.fontSize(16).fillColor('#333').font('Helvetica')
            .text('This is to certify that', 0, 160, { align: 'center', width: pageWidth });

        // Student name (highlighted)
        const fullStudentName = getFieldValue(fieldsData, 'studentName') || 'N/A';
        doc.fontSize(28).fillColor('#d4a574').font('Helvetica-Bold')
            .text(fullStudentName, 0, 200, { align: 'center', width: pageWidth });

        // Course details
        const courseName = getFieldValue(fieldsData, 'selectedCourse') || 'N/A';
        doc.fontSize(16).fillColor('#333').font('Helvetica')
            .text('has successfully completed the course', 0, 250, { align: 'center', width: pageWidth });

        doc.fontSize(20).fillColor('#d4a574').font('Helvetica-Bold')
            .text(courseName, 0, 280, { align: 'center', width: pageWidth });

        // Additional details
        const regNo = getFieldValue(fieldsData, 'registrationNumber') || 'N/A';
        const admissionDate = getFieldValue(fieldsData, 'admissionDate');

        doc.fontSize(14).fillColor('#666').font('Helvetica')
            .text(`Registration No: ${regNo}`, 0, 330, { align: 'center', width: pageWidth });

        if (admissionDate) {
            const formattedDate = new Date(admissionDate).toLocaleDateString('en-IN');
            doc.text(`Course Duration: ${formattedDate} to ${new Date().toLocaleDateString('en-IN')}`, 0, 350, { align: 'center', width: pageWidth });
        }

        // Date of issue
        const issueDate = new Date().toLocaleDateString('en-IN');
        doc.fontSize(12).fillColor('#333')
            .text(`Date of Issue: ${issueDate}`, 100, 420);

        // Signature area
        doc.text('Director Signature', pageWidth - 200, 420, { align: 'center', width: 150 });
        doc.moveTo(pageWidth - 200, 440).lineTo(pageWidth - 50, 440).stroke('#333');

        // Footer
        doc.fontSize(10).fillColor('#666')
            .text('This certificate is issued by the Institute Management System', 0, 460, { align: 'center', width: pageWidth });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error("Error generating certificate:", error);
        if (!res.headersSent) {
            throw new ApiError(500, "Failed to generate certificate");
        }
    }
};

// Get students eligible for certificates
export const getCertificateEligibleStudents = async (req, res) => {
    try {
        const { type } = req.query; // 'all', 'completed', or 'active'

        let query = { formType: 'student' };

        if (type === 'completed') {
            query['fieldsData'] = {
                $elemMatch: {
                    name: 'completedCourse',
                    value: true
                }
            };
        } else if (type === 'active') {
            query['fieldsData'] = {
                $elemMatch: {
                    name: 'isActive',
                    value: true
                }
            };
        }

        const students = await DynamicFormData.find(query)
            .sort({ createdAt: -1 })
            .select('_id fieldsData createdAt updatedAt');

        const formattedStudents = students.map(student => {
            const fieldsData = student.fieldsData;
            return {
                _id: student._id,
                name: getFieldValue(fieldsData, 'studentName') || 'N/A',
                registrationNumber: getFieldValue(fieldsData, 'registrationNumber') || 'N/A',
                course: getFieldValue(fieldsData, 'selectedCourse') || 'N/A',
                email: getFieldValue(fieldsData, 'studentEmail') || 'N/A',
                phone: getFieldValue(fieldsData, 'phoneNumber') || 'N/A',
                isActive: getFieldValue(fieldsData, 'isActive') || false,
                isRegistered: getFieldValue(fieldsData, 'isRegistered') || false,
                completedCourse: getFieldValue(fieldsData, 'completedCourse') || false,
                createdAt: student.createdAt,
                canGenerateIdCard: true, // All students can get ID cards
                canGenerateCertificate: getFieldValue(fieldsData, 'completedCourse') || false
            };
        });

        return res.status(200).json(
            new ApiResponse(200, {
                students: formattedStudents,
                total: formattedStudents.length
            }, "Students retrieved successfully")
        );

    } catch (error) {
        console.error("Error fetching students:", error);
        throw new ApiError(500, "Failed to fetch students");
    }
};
