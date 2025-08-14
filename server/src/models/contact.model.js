import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    courseDescription: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'enrolled', 'not_interested'],
        default: 'new'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

// Index for better query performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ email: 1 });

export default mongoose.model("Contact", contactSchema);
