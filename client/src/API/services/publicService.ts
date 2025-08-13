import { publicApi } from '../axiosInstance';
import type { AxiosResponse } from 'axios';

export interface PublicStatistics {
    students: {
        total: number;
        active: number;
        completed: number;
        successRate: number;
    };
    courses: {
        total: number;
        active: number;
        details: Array<{
            _id: string;
            name: string;
            code: string;
            duration: string;
            level: string;
            category: string;
            description: string;
            isActive: boolean;
            createdAt: string;
        }>;
    };
    branches: {
        total: number;
        active: number;
        details: Array<{
            _id: string;
            name: string;
            code: string;
            city: string;
            state: string;
            address: string;
            phone: string;
            email: string;
            isActive: boolean;
            createdAt: string;
        }>;
    };
    summary: {
        totalEnrollments: number;
        coursesOffered: number;
        branchNetwork: number;
        graduationRate: number;
    };
}

class PublicService {
    private basePath = '/public';

    // Get public statistics for home page
    async getPublicStatistics(): Promise<PublicStatistics> {
        try {
            const response: AxiosResponse<{
                success: boolean;
                data: PublicStatistics;
                message: string;
            }> = await publicApi.get(`${this.basePath}/statistics`);

            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching public statistics:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
        }
    }
}

export const publicService = new PublicService();
