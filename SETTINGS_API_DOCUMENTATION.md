# 🚀 Settings API Documentation

Complete API documentation for the Settings endpoints with Postman testing examples.

---

## 🔧 **Base Configuration**

- **Base URL**: `http://localhost:4070`
- **Authentication**: Required for all endpoints
- **Authorization Header**: `Bearer YOUR_JWT_TOKEN`

---

## 📋 **1. GET Settings**

Retrieve global website settings.

### **Endpoint**
```
GET /api/v1/settings
```

### **Headers**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### **Response Example**
```json
{
  "statusCode": 200,
  "message": "Settings retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "header": {
      "siteName": "Your Website",
      "tagline": "Your Tagline",
      "logo": "",
      "navigation": [],
      "contactInfo": {
        "phone": "",
        "email": ""
      }
    },
    "body": {
      "hero": {
        "title": "",
        "subtitle": "",
        "backgroundImage": "",
        "ctaButton": {
          "text": "",
          "url": "",
          "isVisible": true
        }
      },
      "about": {
        "title": "",
        "description": "",
        "image": "",
        "features": []
      },
      "services": {
        "title": "",
        "subtitle": "",
        "servicesList": []
      },
      "cta": {
        "title": "",
        "description": "",
        "buttonText": "",
        "buttonUrl": "",
        "backgroundImage": ""
      }
    },
    "footer": {
      "companyInfo": {
        "name": "Your Company",
        "description": "",
        "logo": ""
      },
      "contact": {
        "address": "",
        "phone": "",
        "email": "",
        "workingHours": ""
      },
      "quickLinks": [],
      "socialMedia": {
        "facebook": "",
        "twitter": "",
        "instagram": "",
        "linkedin": "",
        "youtube": ""
      },
      "copyright": {
        "text": "All rights reserved.",
        "year": 2024
      }
    },
    "theme": {
      "primaryColor": "#3B82F6",
      "secondaryColor": "#1F2937",
      "accentColor": "#F59E0B",
      "fontFamily": "Inter"
    },
    "isActive": true,
    "updatedBy": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 📋 **2. UPDATE Header Settings**

Update website header configuration.

### **Endpoint**
```
PATCH /api/v1/settings/header
```

### **Headers**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### **Request Body (JSON)**
```json
{
  "siteName": "TechCorp Solutions",
  "tagline": "Innovation at Its Best",
  "logo": "https://example.com/logo.png",
  "navigation": [
    {
      "title": "Home",
      "url": "/",
      "order": 1,
      "isActive": true
    },
    {
      "title": "About Us",
      "url": "/about",
      "order": 2,
      "isActive": true
    },
    {
      "title": "Services",
      "url": "/services",
      "order": 3,
      "isActive": true
    },
    {
      "title": "Portfolio",
      "url": "/portfolio",
      "order": 4,
      "isActive": true
    },
    {
      "title": "Contact",
      "url": "/contact",
      "order": 5,
      "isActive": true
    }
  ],
  "contactInfo": {
    "phone": "+91 98765 43210",
    "email": "info@techcorp.com"
  }
}
```

### **With File Upload (Form Data)**
If you want to upload a logo file:

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```
*Note: Don't set Content-Type for form-data*

**Form Data:**
- **logo** (File): Select image file
- **siteName** (Text): "TechCorp Solutions"
- **tagline** (Text): "Innovation at Its Best"
- **navigation** (Text): `[{"title":"Home","url":"/","order":1,"isActive":true}]`
- **contactInfo** (Text): `{"phone":"+91 98765 43210","email":"info@techcorp.com"}`

---

## 📋 **3. UPDATE Body Settings**

Update main content sections.

### **Endpoint**
```
PATCH /api/v1/settings/body
```

### **Headers**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### **Request Body (JSON)**
```json
{
  "hero": {
    "title": "Welcome to TechCorp Solutions",
    "subtitle": "We build innovative digital solutions that transform businesses",
    "backgroundImage": "https://example.com/hero-background.jpg",
    "ctaButton": {
      "text": "Get Started Today",
      "url": "/get-started",
      "isVisible": true
    }
  },
  "about": {
    "title": "About Our Company",
    "description": "With over 10 years of experience, we are a leading technology company providing cutting-edge solutions to businesses worldwide.",
    "image": "https://example.com/about-image.jpg",
    "features": [
      {
        "title": "Expert Team",
        "description": "Our team consists of highly skilled professionals with years of industry experience.",
        "icon": "team-icon"
      },
      {
        "title": "Quality Assurance",
        "description": "We maintain the highest standards of quality in all our projects and deliverables.",
        "icon": "quality-icon"
      },
      {
        "title": "24/7 Support",
        "description": "Round-the-clock customer support to ensure your business never stops running.",
        "icon": "support-icon"
      }
    ]
  },
  "services": {
    "title": "Our Services",
    "subtitle": "Comprehensive solutions tailored to your business needs",
    "servicesList": [
      {
        "title": "Web Development",
        "description": "Custom web applications built with modern technologies and best practices.",
        "image": "https://example.com/web-dev-service.jpg",
        "price": "₹50,000 - ₹2,00,000"
      },
      {
        "title": "Mobile App Development",
        "description": "Native and cross-platform mobile applications for iOS and Android.",
        "image": "https://example.com/mobile-dev-service.jpg",
        "price": "₹75,000 - ₹3,00,000"
      },
      {
        "title": "Digital Marketing",
        "description": "Complete digital marketing solutions to grow your online presence.",
        "image": "https://example.com/digital-marketing-service.jpg",
        "price": "₹25,000 - ₹1,00,000"
      }
    ]
  },
  "cta": {
    "title": "Ready to Transform Your Business?",
    "description": "Let's discuss how we can help you achieve your digital transformation goals.",
    "buttonText": "Schedule a Consultation",
    "buttonUrl": "/contact",
    "backgroundImage": "https://example.com/cta-background.jpg"
  }
}
```

### **With File Upload (Form Data)**
**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Form Data:**
- **heroBackground** (File): Hero section background image
- **aboutImage** (File): About section image
- **ctaBackground** (File): CTA section background image
- **hero** (Text): `{"title":"Welcome to TechCorp","subtitle":"Innovation at its best"}`
- **about** (Text): `{"title":"About Us","description":"We are leading..."}`
- **services** (Text): `{"title":"Our Services","subtitle":"What we offer"}`
- **cta** (Text): `{"title":"Get Started","description":"Contact us today"}`

---

## 📋 **4. UPDATE Footer Settings**

Update website footer configuration.

### **Endpoint**
```
PATCH /api/v1/settings/footer
```

### **Headers**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### **Request Body (JSON)**
```json
{
  "companyInfo": {
    "name": "TechCorp Solutions Pvt Ltd",
    "description": "Leading provider of innovative digital solutions helping businesses transform and grow in the digital age.",
    "logo": "https://example.com/footer-logo.png"
  },
  "contact": {
    "address": "123 Tech Park, Innovation Drive, Bangalore, Karnataka 560001",
    "phone": "+91 98765 43210",
    "email": "contact@techcorp.com",
    "workingHours": "Monday - Friday: 9:00 AM - 6:00 PM"
  },
  "quickLinks": [
    {
      "title": "Privacy Policy",
      "url": "/privacy-policy",
      "order": 1
    },
    {
      "title": "Terms of Service",
      "url": "/terms-of-service",
      "order": 2
    },
    {
      "title": "Careers",
      "url": "/careers",
      "order": 3
    },
    {
      "title": "Support",
      "url": "/support",
      "order": 4
    },
    {
      "title": "Blog",
      "url": "/blog",
      "order": 5
    }
  ],
  "socialMedia": {
    "facebook": "https://facebook.com/techcorpsolutions",
    "twitter": "https://twitter.com/techcorp",
    "instagram": "https://instagram.com/techcorpsolutions",
    "linkedin": "https://linkedin.com/company/techcorp-solutions",
    "youtube": "https://youtube.com/c/techcorpsolutions"
  },
  "copyright": {
    "text": "All rights reserved. No part of this website may be reproduced without permission.",
    "year": 2024
  }
}
```

### **With File Upload (Form Data)**
**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Form Data:**
- **logo** (File): Footer logo image
- **companyInfo** (Text): `{"name":"TechCorp Solutions Pvt Ltd","description":"Leading provider..."}`
- **contact** (Text): `{"address":"123 Tech Park...","phone":"+91 98765 43210"}`
- **quickLinks** (Text): `[{"title":"Privacy Policy","url":"/privacy","order":1}]`
- **socialMedia** (Text): `{"facebook":"https://facebook.com/techcorp"}`
- **copyright** (Text): `{"text":"All rights reserved.","year":2024}`

---

## 📋 **5. UPDATE Theme Settings**

Update website color scheme and typography.

### **Endpoint**
```
PATCH /api/v1/settings/theme
```

### **Headers**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### **Request Body (JSON)**
```json
{
  "primaryColor": "#2563EB",
  "secondaryColor": "#64748B",
  "accentColor": "#F97316",
  "fontFamily": "Roboto"
}
```

### **Alternative Theme Examples**

**Dark Theme:**
```json
{
  "primaryColor": "#1F2937",
  "secondaryColor": "#374151",
  "accentColor": "#10B981",
  "fontFamily": "Inter"
}
```

**Purple Theme:**
```json
{
  "primaryColor": "#7C3AED",
  "secondaryColor": "#6B7280",
  "accentColor": "#F59E0B",
  "fontFamily": "Poppins"
}
```

---

## 📋 **6. GET All Settings (Admin)**

Retrieve all settings for admin overview.

### **Endpoint**
```
GET /api/v1/settings/all
```

### **Headers**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

---

## 📋 **7. DELETE Settings**

Soft delete settings (marks as inactive).

### **Endpoint**
```
DELETE /api/v1/settings
```

### **Headers**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

---

## 🔐 **Authentication Setup**

### **Step 1: Login to get JWT Token**
```
POST /api/v1/users/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "name": "Admin User"
    }
  }
}
```

### **Step 2: Use Token in Headers**
Copy the `token` from login response and use it in all subsequent requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 **Testing Sequence**

1. **Login first** to get JWT token
2. **GET Settings** to see current state
3. **PATCH Header** with sample data
4. **PATCH Body** with sample data  
5. **PATCH Footer** with sample data
6. **PATCH Theme** with sample data
7. **GET Settings** again to verify changes

---

## 📝 **Common Testing Scenarios**

### **Scenario 1: Basic Setup**
1. Update header with site name and navigation
2. Update theme with brand colors
3. Update footer with company info

### **Scenario 2: Full Content Update**
1. Update all sections with complete data
2. Upload images for hero, about, and CTA sections
3. Verify all changes with GET request

### **Scenario 3: File Upload Testing**
1. Test logo upload in header
2. Test multiple image uploads in body
3. Test footer logo upload

---

## ⚠️ **Important Notes**

- All routes require authentication
- Use **PATCH** method, not POST, for updates
- For file uploads, use **form-data** instead of JSON
- Complex objects in form-data should be JSON strings
- Images are uploaded to `/assets/` directory
- Settings are global (no branch-specific)

---

## 🚀 **Quick Start Postman Collection**

Import this collection structure in Postman:

```
Settings API
├── Authentication
│   └── Login
├── Settings Management  
│   ├── Get Settings
│   ├── Update Header (JSON)
│   ├── Update Header (with File)
│   ├── Update Body (JSON)
│   ├── Update Body (with Files)
│   ├── Update Footer (JSON)
│   ├── Update Footer (with File)
│   └── Update Theme
└── Admin
    ├── Get All Settings
    └── Delete Settings
```

**Happy Testing! 🎉**
