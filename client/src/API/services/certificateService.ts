import api from '../axiosInstance';
import type { AxiosResponse } from 'axios';

export interface CertificateEligibleStudent {
    _id: string;
    name: string;
    registrationNumber: string;
    course: string;
    email: string;
    phone: string;
    isActive: boolean;
    isRegistered: boolean;
    completedCourse: boolean;
    createdAt: string;
    canGenerateIdCard: boolean;
    canGenerateCertificate: boolean;
}

export interface CertificateStudentsResponse {
    students: CertificateEligibleStudent[];
    total: number;
}

class CertificateService {
    private basePath = '/certificates';

    // Get students eligible for certificates/ID cards
    async getCertificateEligibleStudents(type?: 'all' | 'completed' | 'active'): Promise<CertificateStudentsResponse> {
        try {
            const params = type ? { type } : {};
            const response: AxiosResponse<{
                success: boolean;
                data: CertificateStudentsResponse;
                message: string;
            }> = await api.get(`${this.basePath}/students`, { params });

            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching certificate eligible students:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch students');
        }
    }

    // Generate and download student ID card
    async generateStudentIdCard(studentId: string): Promise<void> {
        try {
            const response = await api.get(`${this.basePath}/id-card/${studentId}`, {
                responseType: 'blob'
            });

            // Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Get filename from response headers or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'student-id-card.pdf';
            if (contentDisposition) {
                const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
                if (matches) {
                    filename = matches[1];
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Error generating ID card:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate ID card');
        }
    }

    // Generate and download course completion certificate
    async generateCourseCertificate(studentId: string): Promise<void> {
        try {
            const response = await api.get(`${this.basePath}/certificate/${studentId}`, {
                responseType: 'blob'
            });

            // Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Get filename from response headers or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'course-certificate.pdf';
            if (contentDisposition) {
                const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
                if (matches) {
                    filename = matches[1];
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Error generating certificate:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate certificate');
        }
    }
}

export const certificateService = new CertificateService();
