import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Contact from "../models/contact.model.js";

// Submit contact form
const submitContactForm = async (req, res, next) => {
    try {
        const { name, email, phone, courseDescription } = req.body;

        // Validation
        if (!name || !email || !phone) {
            return next(new ApiError(400, "Name, email, and phone are required"));
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(new ApiError(400, "Please provide a valid email address"));
        }

        // Check if contact already exists with same email
        const existingContact = await Contact.findOne({ email });
        if (existingContact) {
            return next(new ApiError(400, "A contact with this email already exists"));
        }

        // Create new contact
        const contact = await Contact.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            courseDescription: courseDescription ? courseDescription.trim() : ''
        });

        res.status(201).json(
            new ApiResponse(201, contact, "Contact form submitted successfully")
        );
    } catch (error) {
        console.error("Error submitting contact form:", error);
        next(new ApiError(500, error.message || "Error submitting contact form"));
    }
};

// Get all contacts (for admin)
const getAllContacts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        // Build query
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { courseDescription: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get contacts with pagination
        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Contact.countDocuments(query);

        res.status(200).json(
            new ApiResponse(200, {
                contacts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalContacts: total,
                    hasNextPage: skip + contacts.length < total,
                    hasPrevPage: parseInt(page) > 1
                }
            }, "Contacts retrieved successfully")
        );
    } catch (error) {
        console.error("Error fetching contacts:", error);
        next(new ApiError(500, error.message || "Error fetching contacts"));
    }
};

// Get single contact
const getContactById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id);
        if (!contact) {
            return next(new ApiError(404, "Contact not found"));
        }

        res.status(200).json(
            new ApiResponse(200, contact, "Contact retrieved successfully")
        );
    } catch (error) {
        console.error("Error fetching contact:", error);
        next(new ApiError(500, error.message || "Error fetching contact"));
    }
};

// Update contact status
const updateContactStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const contact = await Contact.findById(id);
        if (!contact) {
            return next(new ApiError(404, "Contact not found"));
        }

        // Update fields
        if (status) {
            contact.status = status;
        }
        if (notes !== undefined) {
            contact.notes = notes;
        }

        await contact.save();

        res.status(200).json(
            new ApiResponse(200, contact, "Contact updated successfully")
        );
    } catch (error) {
        console.error("Error updating contact:", error);
        next(new ApiError(500, error.message || "Error updating contact"));
    }
};

// Delete contact
const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) {
            return next(new ApiError(404, "Contact not found"));
        }

        res.status(200).json(
            new ApiResponse(200, {}, "Contact deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting contact:", error);
        next(new ApiError(500, error.message || "Error deleting contact"));
    }
};

// Get contact statistics
const getContactStats = async (req, res, next) => {
    try {
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalContacts = await Contact.countDocuments();
        const recentContacts = await Contact.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        });

        const statsObject = {
            total: totalContacts,
            recent: recentContacts,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        };

        res.status(200).json(
            new ApiResponse(200, statsObject, "Contact statistics retrieved successfully")
        );
    } catch (error) {
        console.error("Error fetching contact stats:", error);
        next(new ApiError(500, error.message || "Error fetching contact statistics"));
    }
};

export {
    submitContactForm,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
};
