

import mongoose from "mongoose";

// For each field's data (key-value pair)
const formFieldDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // must match one of the field names from config
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // can be string, number, boolean, etc.
    required: true,
  },
}, { _id: false });

// Main form data schema
const dynamicFormDataSchema = new mongoose.Schema({
  formType: {
    type: String,
    required: true, // e.g., "student", "course", "branch", "exam"
  },
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DynamicForm", // optional, if you want to link to the form structure
  },
  fieldsData: {
    type: [formFieldDataSchema],
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("DynamicFormData", dynamicFormDataSchema);

// Example of storing data in DB
// {
//   "formType": "student",
//   "formId": "66d2aeb31234abcd56789ef0", // optional reference
//   "fieldsData": [
//     { "name": "Name", "value": "Rahul Sharma" },
//     { "name": "Email", "value": "rahul@example.com" },
//     { "name": "Course", "value": "BCA" },
//     { "name": "dob", "value": "2002-05-17" }
//   ]
// }