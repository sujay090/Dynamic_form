# Settings API Response Data

## Complete Settings Data Structure

```json
{
  "statusCode": 200,
  "data": {
    "header": {
      "contactInfo": {
        "phone": "34535345",
        "email": "pradhansujay856@gmail.com"
      },
      "siteName": "sujay",
      "tagline": "sujay pradhan",
      "navigation": [
        {
          "title": "Home",
          "url": "/",
          "order": 1,
          "isActive": true,
          "_id": "6899f582dd16500515a7eaa3",
          "id": "6899f582dd16500515a7eaa3"
        },
        {
          "title": "About",
          "url": "/about",
          "order": 2,
          "isActive": true,
          "_id": "6899f582dd16500515a7eaa4",
          "id": "6899f582dd16500515a7eaa4"
        },
        {
          "title": "Courses",
          "url": "/courses",
          "order": 3,
          "isActive": true,
          "_id": "6899f582dd16500515a7eaa5",
          "id": "6899f582dd16500515a7eaa5"
        },
        {
          "title": "Contact",
          "url": "/contact",
          "order": 4,
          "isActive": true,
          "_id": "6899f582dd16500515a7eaa6",
          "id": "6899f582dd16500515a7eaa6"
        }
      ],
      "logo": "http://localhost:4070/assets/logo-1754920322713-897244611.jpg"
    },
    "body": {
      "hero": {
        "ctaButton": {
          "text": "",
          "url": "",
          "isVisible": true
        },
        "title": "wefsfsgdfgdfgdfg",
        "subtitle": "dfgdfgdfgdfgdfg",
        "backgroundImage": "http://localhost:4070/assets/heroBackground-1754920481723-284998667.png"
      },
      "about": {
        "title": "qdasdasdasdasd",
        "description": "asdasdasdasdasd",
        "image": "http://localhost:4070/assets/aboutImage-1754920481761-242446610.jpg",
        "features": []
      },
      "services": {
        "title": "asdadsasd",
        "subtitle": "adsadsasdsd",
        "servicesList": []
      },
      "cta": {
        "title": "asdasdadsads",
        "description": "adasdadrwrwe",
        "buttonText": "asdadsadsad",
        "buttonUrl": "/regester",
        "backgroundImage": "http://localhost:4070/assets/ctaBackground-1754920481763-475976951.jpg"
      }
    },
    "footer": {
      "companyInfo": {
        "name": "procodrr",
        "description": "dfsdfsdfsdf",
        "logo": "http://localhost:4070/assets/logo-1754920579350-870649528.jpg"
      },
      "contact": {
        "address": "sdffsdffwerwer",
        "phone": "+918101571141",
        "email": "pradhansujay856@gmail.com",
        "workingHours": ""
      },
      "socialMedia": {
        "facebook": "qwerwerwer",
        "twitter": "werwerwerwer",
        "instagram": "werwerwerw",
        "linkedin": "werwerwerwer",
        "youtube": "erwerwerwerewr"
      },
      "copyright": {
        "text": "dfsdfsdf",
        "year": 2025
      },
      "quickLinks": [
        {
          "title": "Privacy Policy",
          "url": "/privacy-policy",
          "order": 1,
          "_id": "6899f683dd16500515a7eac3",
          "id": "6899f683dd16500515a7eac3"
        },
        {
          "title": "Terms of Service",
          "url": "/terms-of-service",
          "order": 2,
          "_id": "6899f683dd16500515a7eac4",
          "id": "6899f683dd16500515a7eac4"
        },
        {
          "title": "Contact Us",
          "url": "/contact",
          "order": 3,
          "_id": "6899f683dd16500515a7eac5",
          "id": "6899f683dd16500515a7eac5"
        },
        {
          "title": "About Us",
          "url": "/about",
          "order": 4,
          "_id": "6899f683dd16500515a7eac6",
          "id": "6899f683dd16500515a7eac6"
        }
      ]
    },
    "theme": {
      "primaryColor": "#3b82f6",
      "secondaryColor": "#64748b",
      "accentColor": "#10b981",
      "fontFamily": "Inter"
    },
    "_id": "6899e65609c98084f2c1379f",
    "isActive": true,
    "updatedBy": "68939971d819f3f8ea841331",
    "createdAt": "2025-08-11T12:47:18.315Z",
    "updatedAt": "2025-08-11T14:01:41.989Z",
    "__v": 0,
    "id": "6899e65609c98084f2c1379f"
  },
  "message": "Theme settings updated successfully",
  "success": true
}
```

## Data Structure Breakdown

### 1. Header Settings
- **Site Information**: Name, tagline, logo
- **Navigation Menu**: Dynamic menu items with order and active status
- **Contact Information**: Phone and email

### 2. Body Settings
- **Hero Section**: Title, subtitle, CTA button, background image
- **About Section**: Title, description, image, features array
- **Services Section**: Title, subtitle, services list
- **CTA Section**: Call-to-action with background image

### 3. Footer Settings
- **Company Information**: Name, description, logo
- **Contact Details**: Address, phone, email, working hours
- **Social Media Links**: All major platforms
- **Quick Links**: Dynamic footer navigation
- **Copyright**: Text and year

### 4. Theme Settings
- **Colors**: Primary, secondary, and accent colors
- **Typography**: Font family selection

## API Response Status
- **Status Code**: 200 (Success)
- **Message**: "Theme settings updated successfully"
- **Success**: true

## Database Information
- **Document ID**: 6899e65609c98084f2c1379f
- **Active Status**: true
- **Last Updated**: 2025-08-11T14:01:41.989Z
- **Updated By**: 68939971d819f3f8ea841331