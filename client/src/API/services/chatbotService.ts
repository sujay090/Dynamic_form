import { publicApi } from '../axiosInstance';
import type { AxiosResponse } from 'axios';

export interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export interface ChatResponse {
    message: string;
    suggestions?: string[];
    timestamp: string;
}

class ChatbotService {
    private basePath = '/chatbot';

    // Send message to chatbot and get response
    async sendMessage(message: string): Promise<ChatResponse> {
        try {
            const response: AxiosResponse<{
                success: boolean;
                data: {
                    message: string;
                    suggestions?: string[];
                    timestamp: string;
                };
                message: string;
            }> = await publicApi.post(`${this.basePath}/chat`, {
                message: message.trim()
            });

            return {
                message: response.data.data.message,
                suggestions: response.data.data.suggestions || [],
                timestamp: response.data.data.timestamp
            };
        } catch (error: any) {
            console.error('Error sending message to chatbot:', error);

            // Enhanced fallback responses
            return this.getEnhancedLocalResponse(message);
        }
    }

    // Enhanced fallback local responses when API is not available
    private getEnhancedLocalResponse(message: string): ChatResponse {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('course') || lowerMessage.includes('program') || lowerMessage.includes('कोर्स')) {
            return {
                message: "Arre yaar, hamare paas bahut saare courses hain like technical, professional aur skill development programs. Har course industry-standard ke saath banaya gaya hai. Tum konse specific course ke baare mein jaanna chahte ho?",
                suggestions: ["Fees kitni lagegi?", "Admission kaise kare?", "Duration kitna hai?", "Placement kaisa hai?"],
                timestamp: new Date().toISOString()
            };
        }

        if (lowerMessage.includes('admission') || lowerMessage.includes('enroll') || lowerMessage.includes('join') || lowerMessage.includes('एडमिशन')) {
            return {
                message: "Dekho bhai, admission process bilkul simple hai! Tum online apply kar sakte ho ya seedha campus aa sakte ho. Humara admission team bohot helpful hai aur pura saal multiple intake sessions hote rehte hain.",
                suggestions: ["Documents kya chahiye?", "Form kaise bhare?", "Last date kya hai?", "Eligibility criteria?"],
                timestamp: new Date().toISOString()
            };
        }

        if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('फीस')) {
            return {
                message: "Boss, fees har course ke according different hoti hai. Humne flexible payment options aur scholarships bhi rakhi hai deserving students ke liye. Konse course ki fees jaanna hai tumhe?",
                suggestions: ["Payment options kya hain?", "Scholarship milegi?", "EMI facility hai?", "Course list dikhao"],
                timestamp: new Date().toISOString()
            };
        }

        if (lowerMessage.includes('contact') || lowerMessage.includes('address') || lowerMessage.includes('location') || lowerMessage.includes('संपर्क')) {
            return {
                message: "Bhai contact ke liye tum website ka contact form use kar sakte ho ya direct campus visit kar sakte ho. Humara counselors team tumhari full help karega, don't worry!",
                suggestions: ["Branch address do", "WhatsApp number hai?", "Timing kya hai?", "Campus visit kare?"],
                timestamp: new Date().toISOString()
            };
        }

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('नमस्ते') || lowerMessage.includes('helo')) {
            return {
                message: "Hey buddy! Main Max hun, tumhara friendly AI assistant. Main general questions bhi answer kar sakta hun (jaise math, science, facts) aur humara courses, admission process, fees aur jo bhi educational questions hain, sabmein help kar sakta hun. Kya jaanna chahte ho?",
                suggestions: ["2+2 kitna hai?", "Courses batao", "Admission info do", "Fees pata karo"],
                timestamp: new Date().toISOString()
            };
        }

        if (lowerMessage.includes('placement') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
            return {
                message: "Yaar placement ke liye humara record bohot solid hai! Industry connections strong hain aur students ko best companies mein jobs dilaane mein help karte hain. Career guidance bhi full provide karte hain.",
                suggestions: ["Placement stats dikhao", "Salary package kitna?", "Companies kaun si?", "Job guarantee hai?"],
                timestamp: new Date().toISOString()
            };
        }

        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('धन्यवाद') || lowerMessage.includes('thnx')) {
            return {
                message: "Arre no mention yaar! Koi aur doubt hai toh befikar se puchna - courses, admission, placement, kuch bhi. Main hun na tumhare saath!",
                suggestions: ["Aur courses batao", "Admission process", "Placement info", "Contact karo"],
                timestamp: new Date().toISOString()
            };
        }

        // Default enhanced response in Hinglish
        return {
            message: "Suno yaar, main tumhari in sab cheezom mein help kar sakta hun:\n\n• General questions (math, time, facts, etc.)\n• Courses aur programs ki complete info\n• Admission process aur documents\n• Fees structure aur payment options\n• Contact details aur branch locations\n• Placement assistance aur career guidance\n\nTum specifically kya jaanna chahte ho? Math ho ya institute info - kuch bhi puchte jao!",
            suggestions: ["2+2 = ?", "Popular courses", "Admission kaise kare?", "Fees kitni hai?", "Current time"],
            timestamp: new Date().toISOString()
        };
    }

    // Get initial welcome message with enhanced Hinglish support
    getWelcomeMessage(siteName: string = 'Institute'): ChatMessage {
        return {
            id: '1',
            text: `Hey there! Main Max hun, ${siteName} ka friendly AI assistant. Main general questions bhi answer kar sakta hun (math, science, facts) aur tumhe courses, admission, fees aur educational guidance mein bhi help kar sakta hun. Kya jaanna chahte ho buddy?`,
            isUser: false,
            timestamp: new Date()
        };
    }
}

export const chatbotService = new ChatbotService();
