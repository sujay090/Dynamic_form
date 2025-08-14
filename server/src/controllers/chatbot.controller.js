import fetch from 'node-fetch';
import https from 'https';
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import DynamicFormData from "../models/student.model.js";

// LLM Integration - You can use OpenAI GPT or Google Gemini
const generateLLMResponse = async (userMessage, contextData) => {
    try {
        // Check if API key is properly configured
        if (!process.env.GEMINI_API_KEY || 
            process.env.GEMINI_API_KEY === 'your_api_key_here' || 
            process.env.GEMINI_API_KEY === 'YOUR_ACTUAL_GEMINI_API_KEY_HERE') {
            console.warn('Gemini API key not configured properly. Falling back to static responses.');
            return generateEnhancedStaticResponse(userMessage, contextData);
        }

        const isHinglish = /\b(yaar|bhai|dekho|dekha|arre|arrey|kya|hai|hain|ke|ka|ki|mein|main|mujhe|tumhe|se|aur|toh|matlab|kaise|kaha|kahan|kitna|kitni|batao|bataye|chahiye|chahie|karo|kare|karte|karta|karti|milega|milegi|lagega|lagegi|dikhao|dikhaye|pata|sakte|sakta|sakti|hoga|hogi|wala|wali|wale|bilkul|zyada|bahut|thoda|accha|acchi|bura|buri|paisa|paise|rupees|lakh|hazaar|nahi|nahin|haan|ji)\b/i.test(userMessage) ||
            /[\u0900-\u097F]/.test(userMessage); // Hindi characters

        // Check if this is a greeting/first interaction
        const isGreeting = /^(hello|hi|hey|namaste|helo|hola)\b/i.test(userMessage.trim());
        
        const systemPrompt = isHinglish ?
            `You are Max, a friendly AI assistant who works for an educational institute but can answer any question. Respond in Indian English and Hinglish (Hindi-English mix) style. Be casual, friendly and use words like "yaar", "bhai", "dekho", "arre" etc. ${isGreeting ? 'Introduce yourself as "Main Max hun" in this greeting response.' : 'Do not introduce yourself again - just answer the question directly.'}
            
            For institute-related questions, use this data: ${JSON.stringify(contextData)}.
            For general questions (like math, science, facts, etc.), answer them normally but keep your friendly Hinglish style.
            For institute queries, be enthusiastic about courses, admissions, fees, and contact details.
            Always encourage users to contact for more specific institute information. Keep responses conversational and relatable to Indian students.` :
            `You are Max, a friendly AI assistant who works for an educational institute but can answer any question. Respond in simple, clear English. ${isGreeting ? 'Introduce yourself as "I\'m Max" in this greeting response.' : 'Do not introduce yourself again - just answer the question directly.'}
            
            For institute-related questions, use this data: ${JSON.stringify(contextData)}.
            For general questions (like math, science, facts, etc.), answer them normally while maintaining your helpful personality.
            For institute queries, be professional and provide accurate information about courses, admissions, fees, and contact details.
            Always encourage users to contact for more specific institute information. Keep responses helpful and informative.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `${systemPrompt}
                                
                                User question: ${userMessage}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300,
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Gemini API Error: ${response.status} - ${response.statusText}`);
            console.error('Error details:', errorData);
            
            if (response.status === 400) {
                console.error('API Key might be invalid or missing. Check your GEMINI_API_KEY in .env file');
            }
            
            return generateEnhancedStaticResponse(userMessage, contextData);
        }

        const data = await response.json();

        // Check if response has the expected structure
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return generateEnhancedStaticResponse(userMessage, contextData);
        }

    } catch (error) {
        console.error("LLM API Error:", error.message);
        return generateEnhancedStaticResponse(userMessage, contextData);
    }
};

// Enhanced static response - adapts to user's language style and handles general questions
const generateEnhancedStaticResponse = (userMessage, contextData) => {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Detect if user is using Hinglish/Hindi
    const hinglishPattern = /\b(yaar|bhai|dekho|dekha|arre|arrey|kya|hai|hain|ke|ka|ki|mein|main|mujhe|tumhe|se|aur|toh|matlab|kaise|kaha|kahan|kitna|kitni|batao|bataye|chahiye|chahie|karo|kare|karte|karta|karti|milega|milegi|lagega|lagegi|dikhao|dikhaye|pata|sakte|sakta|sakti|hoga|hogi|wala|wali|wale|bilkul|zyada|bahut|thoda|accha|acchi|bura|buri|paisa|paise|rupees|lakh|hazaar|nahi|nahin|haan|ji)\b/i;
    const hasHindiChars = /[\u0900-\u097F]/.test(userMessage);
    const isHinglish = hinglishPattern.test(userMessage) || hasHindiChars;

    // Handle basic math questions
    if (lowerMessage.includes('2+2') || lowerMessage.includes('2 + 2')) {
        return isHinglish ?
            "Arre yaar, 2+2 = 4 hai! Kya aur puchna hai?" :
            "2+2 = 4! What else would you like to know?";
    }

    // Handle other basic math
    const mathMatch = lowerMessage.match(/(\d+)\s*[\+\-\*\/]\s*(\d+)/);
    if (mathMatch) {
        try {
            const result = eval(mathMatch[0].replace(/[^0-9+\-*/().]/g, ''));
            return isHinglish ?
                `Dekho yaar, ${mathMatch[0]} = ${result} hai! Aur kya jaanna hai?` :
                `${mathMatch[0]} = ${result}! What else would you like to know?`;
        } catch (e) {
            // If eval fails, continue to other responses
        }
    }

    // Handle general knowledge questions
    if (lowerMessage.includes('what is') || lowerMessage.includes('who is') || lowerMessage.includes('define')) {
        return isHinglish ?
            "Yaar, main general questions bhi answer kar sakta hun lekin LLM API se better response milega. Abhi main mainly humara institute ke baare mein detailed info de sakta hun. Courses, admission, fees - ye sab ke baare mein pucho!" :
            "I can answer general questions too, but you'll get better responses through the LLM API. Right now I can give you detailed information about our institute - courses, admissions, fees - ask me about these!";
    }

    // Handle time/date questions
    if (lowerMessage.includes('time') || lowerMessage.includes('date') || lowerMessage.includes('today')) {
        const now = new Date();
        return isHinglish ?
            `Abhi time hai ${now.toLocaleTimeString()} aur date hai ${now.toLocaleDateString()}. Kya aur jaanna chahte ho?` :
            `Current time is ${now.toLocaleTimeString()} and today's date is ${now.toLocaleDateString()}. What else would you like to know?`;
    }

    if (lowerMessage.includes('course') || lowerMessage.includes('program') || lowerMessage.includes('कोर्स')) {
        if (contextData.courses.length > 0) {
            const courseList = contextData.courses.slice(0, 3).map(c => c.name).join(', ');
            if (isHinglish) {
                return `Dekho yaar, hamare paas total ${contextData.courses.length} courses hain jaise ki ${courseList}. Sab courses industry standard ke saath banaye gaye hain. Tum konse specific course ke baare mein jaanna chahte ho? Fees, duration ya admission process ke baare mein puch sakte ho.`;
            } else {
                return `We offer ${contextData.courses.length} courses including ${courseList}. All courses are designed with industry-standard curriculum. Which specific course would you like to know about? You can ask about fees, duration, or admission process.`;
            }
        }
        return isHinglish ?
            "Bhai, hamare paas bahut saare technical aur professional courses hain. Details ke liye humse contact karo na!" :
            "We offer various technical and professional courses. Please contact us for detailed information.";
    }

    if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('फीस')) {
        return isHinglish ?
            `Dekho bhai, fees har course ke according different hoti hai. Humne flexible payment options aur scholarships bhi rakhi hai deserving students ke liye. Tum konse course ki fees jaanna chahte ho? Main tumhe exact amount bata dunga!` :
            `Our fees vary according to each course. We have flexible payment options and scholarships for deserving students. Which course fees would you like to know? I can provide you the exact amount.`;
    }

    if (lowerMessage.includes('admission') || lowerMessage.includes('enroll') || lowerMessage.includes('एडमिशन')) {
        return isHinglish ?
            `Arre yaar, admission process bilkul simple hai! Tum online apply kar sakte ho ya direct hamare campus aa sakte ho. Humara admission team bahut helpful hai. Pura saal mein multiple intake sessions hote rehte hain. Kya tumhe application process ya required documents ke baare mein jaanna hai?` :
            `Our admission process is quite simple! You can apply online or visit our campus directly. Our admission team is very helpful. We have multiple intake sessions throughout the year. Would you like to know about the application process or required documents?`;
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('address') || lowerMessage.includes('संपर्क')) {
        if (contextData.branches.length > 0) {
            const mainBranch = contextData.branches[0];
            let contactInfo = isHinglish ? "Yahan hamare contact details hain boss:\n" : "Here are our contact details:\n";
            if (mainBranch.phone) contactInfo += `📞 Phone: ${mainBranch.phone}\n`;
            if (mainBranch.email) contactInfo += `📧 Email: ${mainBranch.email}\n`;
            if (mainBranch.address) contactInfo += `📍 Address: ${mainBranch.address}\n`;
            contactInfo += isHinglish ?
                `\nHumara counselor team ready hai tumhari help ke liye!` :
                `\nOur counselor team is ready to help you!`;
            return contactInfo;
        }
        return isHinglish ?
            "Bhai tum hamare website pe contact form se message kar sakte ho ya seedha campus visit kar sakte ho. Humara team tumhari full help karega!" :
            "You can message us through our website's contact form or visit our campus directly. Our team will provide full assistance!";
    }

    if (lowerMessage.includes('branch') || lowerMessage.includes('location') || lowerMessage.includes('शाखा')) {
        if (contextData.branches.length > 0) {
            const branchList = contextData.branches.map(b => b.city ? `${b.name} (${b.city})` : b.name).join(', ');
            return isHinglish ?
                `Dekho yaar, humara ${contextData.branches.length} branch${contextData.branches.length > 1 ? 'es' : ''} hai - ${branchList}. Har branch mein same quality education aur facilities milti hai. Tumhare paas konsa branch closest hai?` :
                `We have ${contextData.branches.length} branch${contextData.branches.length > 1 ? 'es' : ''} - ${branchList}. Each branch offers the same quality education and facilities. Which branch is closest to you?`;
        }
        return isHinglish ?
            "Bhai humara multiple locations mein branches hain. Specific branch info ke liye humse contact karo!" :
            "We have branches in multiple locations. Please contact us for specific branch information.";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('नमस्ते') || lowerMessage.includes('helo')) {
        return isHinglish ?
            `Namaste yaar! Main Max hun, tumhara friendly AI assistant. Main general questions bhi answer kar sakta hun (jaise math, science, facts) aur humara institute ke baare mein bhi complete help kar sakta hun - courses, admission, fees sabkuch! Kya jaanna chahte ho bolo?` :
            `Hello! I'm Max, your friendly AI assistant. I can answer general questions (like math, science, facts) as well as provide complete information about our institute - courses, admission process, fees and everything else. What would you like to know?`;
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('धन्यवाद') || lowerMessage.includes('thnx')) {
        return isHinglish ?
            `Arre no problem yaar! Koi aur question hai toh befikar se puchna - courses, admission, kuch bhi. Main yahan hun tumhari help ke liye!` :
            `You're welcome! If you have any other questions about courses, admission, or anything else, feel free to ask. I'm here to help you!`;
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('मदद')) {
        return isHinglish ?
            `Bilkul bhai, main Max hun aur yahan hun tumhari help ke liye! Main in sab cheezom mein help kar sakta hun:
        
        • General questions (math, science, facts, time, etc.)
        • Humara courses aur programs ki poori jankari
        • Admission process aur requirements
        • Fees structure aur payment options  
        • Contact details aur branch locations
        • Aur jo bhi tumhara question ho - kuch bhi pucho!
        
        Kya jaanna chahte ho, bolo yaar!` :
            `Of course! I'm Max and I'm here to help you. I can assist you with:
        
        • General questions (math, science, facts, time, etc.)
        • Complete information about our courses and programs
        • Admission process and requirements
        • Fee structure and payment options
        • Contact details and branch locations
        • Any other questions you might have - ask me anything!
        
        What would you like to know?`;
    }

    if (lowerMessage.includes('placement') || lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('प्लेसमेंट')) {
        return isHinglish ?
            `Arre haan yaar, placement ke liye toh humara track record bohot accha hai! Humara placement cell students ko best companies mein jobs dilaane mein help karta hai. Industry connections bhi strong hain. Kya tumhe specific course ke placement stats jaanne hain?` :
            `Yes, we have an excellent track record for placements! Our placement cell helps students get jobs in the best companies. We also have strong industry connections. Would you like to know placement statistics for any specific course?`;
    }

    if (lowerMessage.includes('scholarship') || lowerMessage.includes('छात्रवृत्ति')) {
        return isHinglish ?
            `Haan bilkul! Humara scholarship programs hain meritorious aur needy students ke liye. Academic performance aur financial background dono basis pe scholarships dete hain. Application process simple hai, details ke liye humse baat karo!` :
            `Yes absolutely! We have scholarship programs for meritorious and needy students. We provide scholarships based on both academic performance and financial background. The application process is simple - contact us for details!`;
    }

    // Default enhanced response
    return isHinglish ?
        `Suno yaar, main Max hun aur tumhari in sab cheezom mein help kar sakta hun:

    • General questions (2+2, current time, facts, etc.)
    • Humara courses aur programs ki complete details
    • Admission process aur kya documents chahiye
    • Fees structure aur payment ke options
    • Contact info aur branch locations
    • Placement assistance aur career guidance
    
    Tum specifically kya jaanna chahte ho? Math ho ya institute info - kuch bhi puchte jao, main hun na tumhare saath!` :
        `Hi! I'm Max and I can help you with the following:

    • General questions (2+2, current time, facts, etc.)
    • Complete details about our courses and programs
    • Admission process and required documents
    • Fee structure and payment options
    • Contact information and branch locations
    • Placement assistance and career guidance
    
    What specifically would you like to know? Whether it's math or institute information - feel free to ask anything!`;
};

// Handle chat messages with LLM integration
const handleChatMessage = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return next(new ApiError(400, "Message is required and must be a string"));
        }

        // Fetch dynamic context data from database
        const courses = await DynamicFormData.find({ formType: 'course' });
        const branches = await DynamicFormData.find({ formType: 'branch' });
        const students = await DynamicFormData.find({ formType: 'student' });

        // Filter active courses and branches
        const activeCourses = courses.filter(course => {
            const activeField = course.fieldsData.find(f => f.name === 'isActive');
            return activeField?.value === true || activeField?.value === 'true';
        }).map(course => {
            const nameField = course.fieldsData.find(f => f.name === 'courseName');
            const feeField = course.fieldsData.find(f => f.name === 'fees');
            const durationField = course.fieldsData.find(f => f.name === 'duration');
            const descriptionField = course.fieldsData.find(f => f.name === 'description');

            return {
                name: nameField?.value || 'Course',
                fees: feeField?.value || 'Contact for fees',
                duration: durationField?.value || 'Contact for duration',
                description: descriptionField?.value || 'Quality education program'
            };
        });

        const activeBranches = branches.filter(branch => {
            const activeField = branch.fieldsData.find(f => f.name === 'isActive');
            return activeField?.value === true || activeField?.value === 'true';
        }).map(branch => {
            const nameField = branch.fieldsData.find(f => f.name === 'addBranch') ||
                branch.fieldsData.find(f => f.name === 'branchName');
            const phoneField = branch.fieldsData.find(f => f.name === 'phone');
            const emailField = branch.fieldsData.find(f => f.name === 'email');
            const addressField = branch.fieldsData.find(f => f.name === 'address');
            const cityField = branch.fieldsData.find(f => f.name === 'city');

            return {
                name: nameField?.value || 'Branch',
                phone: phoneField?.value || '',
                email: emailField?.value || '',
                address: addressField?.value || '',
                city: cityField?.value || ''
            };
        });

        // Prepare context data for LLM
        const contextData = {
            courses: activeCourses,
            branches: activeBranches,
            totalStudents: students.length,
            instituteInfo: {
                totalCourses: activeCourses.length,
                totalBranches: activeBranches.length,
                totalStudents: students.length
            }
        };

        // Generate response using LLM or enhanced static response
        const response = await generateLLMResponse(message, contextData);

        // Generate smart suggestions based on message content
        let suggestions = generateSmartSuggestions(message, contextData);

        const responseData = {
            message: response,
            suggestions: suggestions,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(
            new ApiResponse(200, responseData, "Chat response generated successfully")
        );
    } catch (error) {
        console.error("Error in chatbot:", error);
        next(new ApiError(500, error.message || "Error processing chat message"));
    }
};

// Generate smart suggestions based on context - adapts to user's language
const generateSmartSuggestions = (message, contextData) => {
    const lowerMessage = message.toLowerCase();

    // Detect if user is using Hinglish/Hindi
    const isHinglish = /\b(yaar|bhai|dekho|dekha|arre|arrey|kya|hai|hain|ke|ka|ki|mein|main|mujhe|tumhe|se|aur|toh|matlab|kaise|kaha|kahan|kitna|kitni|batao|bataye|chahiye|chahie|karo|kare|karte|karta|karti|milega|milegi|lagega|lagegi|dikhao|dikhaye|pata|sakte|sakta|sakti|hoga|hogi|wala|wali|wale|bilkul|zyada|bahut|thoda|accha|acchi|bura|buri|paisa|paise|rupees|lakh|hazaar|nahi|nahin|haan|ji)\b/.test(lowerMessage) ||
        /[\u0900-\u097F]/.test(message); // Hindi characters

    // Handle math/general questions suggestions
    if (lowerMessage.includes('2+2') || lowerMessage.includes('math') || lowerMessage.includes('time') || lowerMessage.includes('date')) {
        return isHinglish ?
            ["5+3 kitna hai?", "Current date kya hai?", "Courses batao", "Admission info do"] :
            ["What is 5+3?", "Current date?", "Show courses", "Admission info"];
    }

    if (lowerMessage.includes('course') || lowerMessage.includes('program') || lowerMessage.includes('कोर्स')) {
        return isHinglish ?
            ["Fees kitni lagegi?", "Admission kaise kare?", "Duration kitna hai?", "Placement kaisa hai?"] :
            ["What are the fees?", "How to apply?", "Course duration?", "Placement assistance?"];
    }

    if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('फीस')) {
        return isHinglish ?
            ["Payment options kya hain?", "Scholarship milegi?", "Course list dikhao", "EMI facility hai?"] :
            ["Payment options?", "Scholarships available?", "Show course list", "EMI facility?"];
    }

    if (lowerMessage.includes('admission') || lowerMessage.includes('एडमिशन')) {
        return isHinglish ?
            ["Documents kya chahiye?", "Last date kya hai?", "Form kaise bhare?", "Eligibility criteria?"] :
            ["Required documents?", "Application deadline?", "How to fill form?", "Eligibility criteria?"];
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('संपर्क')) {
        return isHinglish ?
            ["Branch address do", "Timing kya hai?", "WhatsApp number hai?", "Campus visit kare?"] :
            ["Branch address", "Office timings?", "WhatsApp number?", "Campus visit?"];
    }

    if (lowerMessage.includes('placement') || lowerMessage.includes('job')) {
        return isHinglish ?
            ["Placement record dikhao", "Salary package kitna?", "Companies kaun si aati?", "Job guarantee hai?"] :
            ["Placement records", "Salary packages?", "Recruiting companies?", "Job guarantee?"];
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('नमस्ते')) {
        return isHinglish ?
            ["2+2 = ?", "Courses batao", "Admission info do", "Fees pata karo"] :
            ["What is 2+2?", "Show courses", "Admission info", "Fee details"];
    }

    if (lowerMessage.includes('branch') || lowerMessage.includes('location')) {
        return isHinglish ?
            ["Nearest branch batao", "Address chahiye", "Contact kaise kare?", "Facilities kya hain?"] :
            ["Nearest branch", "Address needed", "How to contact?", "Available facilities?"];
    }

    // Default suggestions
    return isHinglish ? [
        "2+2 kitna hai?",
        contextData.courses.length > 0 ? `${contextData.courses[0].name} ke baare mein batao` : "Popular courses batao",
        "Admission process kya hai?",
        "Fees structure dikhao",
        "Current time batao"
    ] : [
        "What is 2+2?",
        contextData.courses.length > 0 ? `Tell me about ${contextData.courses[0].name}` : "Show popular courses",
        "Admission process?",
        "Fee structure",
        "Current time?"
    ];
};

export {
    handleChatMessage
};