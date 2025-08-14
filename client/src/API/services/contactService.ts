import { publicApi } from '../axiosInstance';
import api from '../axiosInstance';

export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    courseDescription: string;
}

export interface ContactResponse {
    success: boolean;
    data: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        courseDescription: string;
        createdAt: string;
        updatedAt: string;
    };
    message: string;
}

class ContactService {
    private basePath = '/contact';

    // Submit contact form
    async submitContactForm(formData: ContactFormData): Promise<ContactResponse> {
        try {
            const response = await publicApi.post(`${this.basePath}/submit`, formData);
            return response.data;
        } catch (error: any) {
            console.error('Error submitting contact form:', error);
            throw error;
        }
    }

    // Get all contact submissions (for admin)
    async getAllContacts(): Promise<any> {
        try {
            console.log('Fetching contacts with token:', localStorage.getItem("adminToken") || localStorage.getItem("token"));
            const response = await api.get(`${this.basePath}/all`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching contacts:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    }

    // Delete contact submission (for admin)
    async deleteContact(contactId: string): Promise<void> {
        try {
            await api.delete(`${this.basePath}/${contactId}`);
        } catch (error: any) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    }
}

export const contactService = new ContactService();
