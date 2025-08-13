// Course Image Generator Utility
// This utility generates course images automatically based on course name

export interface CourseImageGenerationOptions {
    courseName: string;
    category?: string;
    style?: 'modern' | 'classic' | 'minimal' | 'colorful';
    size?: '400x300' | '600x400' | '800x600';
}

// Default course images mapping based on common course types
const DEFAULT_COURSE_IMAGES: Record<string, string> = {
    // Programming & Technology
    'javascript': 'https://via.placeholder.com/400x300/FFD43B/000000?text=JavaScript+Course',
    'python': 'https://via.placeholder.com/400x300/3776ab/ffffff?text=Python+Course',
    'react': 'https://via.placeholder.com/400x300/61DAFB/000000?text=React+Course',
    'node': 'https://via.placeholder.com/400x300/339933/ffffff?text=Node.js+Course',
    'web development': 'https://via.placeholder.com/400x300/FF6B35/ffffff?text=Web+Development',
    'programming': 'https://via.placeholder.com/400x300/007ACC/ffffff?text=Programming+Course',

    // Design & Creative
    'design': 'https://via.placeholder.com/400x300/FF6B9D/ffffff?text=Design+Course',
    'ui/ux': 'https://via.placeholder.com/400x300/6C5CE7/ffffff?text=UI/UX+Design',
    'graphic design': 'https://via.placeholder.com/400x300/FD79A8/ffffff?text=Graphic+Design',
    'photoshop': 'https://via.placeholder.com/400x300/001E36/ffffff?text=Photoshop+Course',

    // Business & Management
    'business': 'https://via.placeholder.com/400x300/2D3436/ffffff?text=Business+Course',
    'management': 'https://via.placeholder.com/400x300/636E72/ffffff?text=Management+Course',
    'marketing': 'https://via.placeholder.com/400x300/00B894/ffffff?text=Marketing+Course',

    // Language & Communication
    'english': 'https://via.placeholder.com/400x300/0984E3/ffffff?text=English+Course',
    'hindi': 'https://via.placeholder.com/400x300/F39C12/ffffff?text=Hindi+Course',
    'communication': 'https://via.placeholder.com/400x300/A29BFE/ffffff?text=Communication',

    // Science & Technology
    'data science': 'https://via.placeholder.com/400x300/00CEC9/ffffff?text=Data+Science',
    'machine learning': 'https://via.placeholder.com/400x300/E17055/ffffff?text=Machine+Learning',
    'artificial intelligence': 'https://via.placeholder.com/400x300/6C5CE7/ffffff?text=AI+Course',

    // Default fallback
    'default': 'https://via.placeholder.com/400x300/74B9FF/ffffff?text=Course'
};

// Course category color themes
const CATEGORY_THEMES: Record<string, { bg: string; text: string }> = {
    'programming': { bg: '#007ACC', text: '#ffffff' },
    'design': { bg: '#FF6B9D', text: '#ffffff' },
    'business': { bg: '#2D3436', text: '#ffffff' },
    'science': { bg: '#00CEC9', text: '#ffffff' },
    'language': { bg: '#0984E3', text: '#ffffff' },
    'technology': { bg: '#00B894', text: '#ffffff' },
    'default': { bg: '#74B9FF', text: '#ffffff' }
};

/**
 * Generate course image URL based on course name and category
 */
export const generateCourseImageURL = (options: CourseImageGenerationOptions): string => {
    const { courseName, category = 'default', size = '400x300' } = options;

    // Clean course name for matching
    const cleanName = courseName.toLowerCase().trim();

    // Check if we have a predefined image for this course type
    const matchedImage = Object.keys(DEFAULT_COURSE_IMAGES).find(key =>
        cleanName.includes(key.toLowerCase())
    );

    if (matchedImage) {
        return DEFAULT_COURSE_IMAGES[matchedImage].replace('400x300', size);
    }

    // If no match found, generate based on category
    const theme = CATEGORY_THEMES[category.toLowerCase()] || CATEGORY_THEMES.default;
    const bgColor = theme.bg.replace('#', '');
    const textColor = theme.text.replace('#', '');

    // Create a clean course name for display
    const displayName = courseName.length > 20
        ? courseName.substring(0, 17) + '...'
        : courseName;

    const encodedName = encodeURIComponent(displayName);

    return `https://via.placeholder.com/${size}/${bgColor}/${textColor}?text=${encodedName}`;
};

/**
 * Generate multiple image variations for a course
 */
export const generateCourseImageVariations = (options: CourseImageGenerationOptions) => {
    const variations = [
        generateCourseImageURL({ ...options, style: 'modern' }),
        generateCourseImageURL({ ...options, style: 'minimal' }),
        generateCourseImageURL({ ...options, style: 'colorful' })
    ];

    return variations;
};

/**
 * Get suggested course image based on course name analysis
 */
export const getSuggestedCourseImage = (courseName: string, category?: string): string => {
    // Analyze course name to determine best image
    const name = courseName.toLowerCase();

    // Programming related keywords
    if (name.includes('javascript') || name.includes('js')) {
        return generateCourseImageURL({ courseName: 'JavaScript Course', category: 'programming' });
    }

    if (name.includes('python') || name.includes('py')) {
        return generateCourseImageURL({ courseName: 'Python Course', category: 'programming' });
    }

    if (name.includes('react') || name.includes('reactjs')) {
        return generateCourseImageURL({ courseName: 'React Course', category: 'programming' });
    }

    if (name.includes('web') && name.includes('development')) {
        return generateCourseImageURL({ courseName: 'Web Development', category: 'programming' });
    }

    if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
        return generateCourseImageURL({ courseName: 'Design Course', category: 'design' });
    }

    if (name.includes('business') || name.includes('management')) {
        return generateCourseImageURL({ courseName: 'Business Course', category: 'business' });
    }

    if (name.includes('data') && name.includes('science')) {
        return generateCourseImageURL({ courseName: 'Data Science', category: 'science' });
    }

    // If no specific match, use course name and category
    return generateCourseImageURL({ courseName, category: category || 'default' });
};

/**
 * Simple course image generation using multiple free APIs
 * This provides random beautiful images that work great for courses
 */
export const generateCourseImageFile = async (courseName: string, category?: string): Promise<File | null> => {
    try {
        // Generate a seed based on course name for consistent images
        const seed = courseName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);

        // Array of free image APIs to try
        const imageAPIs = [
            `https://picsum.photos/seed/${seed}/400/300`, // Lorem Picsum
            `https://source.unsplash.com/400x300/?education,${category || 'course'}`, // Unsplash
            `https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`, // Pexels fallback
        ];

        let imageBlob: Blob | null = null;

        // Try each API until one works
        for (const imageUrl of imageAPIs) {
            try {
                console.log(`🖼️ Trying image API: ${imageUrl}`);
                const response = await fetch(imageUrl);

                if (response.ok) {
                    imageBlob = await response.blob();
                    console.log('✅ Successfully fetched image');
                    break;
                }
            } catch (error) {
                console.log(`❌ API failed: ${imageUrl}`, error);
                continue;
            }
        }

        if (!imageBlob) {
            throw new Error('All image APIs failed');
        }

        // Create File object
        const fileName = `${courseName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_course_image.jpg`;
        const file = new File([imageBlob], fileName, { type: 'image/jpeg' });

        return file;
    } catch (error) {
        console.error('Error generating course image file:', error);
        return null;
    }
};

/**
 * Create a simple course image using Picsum API (no canvas needed)
 * This is much simpler and doesn't require canvas manipulation
 */
export const createCustomCourseImage = async (options: CourseImageGenerationOptions): Promise<File | null> => {
    return await generateCourseImageFile(options.courseName, options.category);
};

export default {
    generateCourseImageURL,
    generateCourseImageVariations,
    getSuggestedCourseImage,
    generateCourseImageFile,
    createCustomCourseImage
};
