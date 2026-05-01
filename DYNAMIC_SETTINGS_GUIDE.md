# Dynamic Settings Guide

## Overview
The catering application now supports fully dynamic settings that allow you to customize all text content, branding, and business information from the admin dashboard without touching code.

## What's Dynamic Now

### 1. **Business Information**
- Business Name
- Website Name (shown in header/nav and browser tab)
- Tagline
- Description
- Logo

### 2. **Hero Section (Landing Page)**
- Hero Title
- Hero Subtitle
- Call-to-Action Button Text

### 3. **About Section**
- About Title
- About Content

### 4. **Contact Information**
- Email Address
- Phone Number
- WhatsApp Number
- Business Address

### 5. **Social Media Links**
- Facebook URL
- Instagram URL
- Twitter/X URL
- TikTok URL
- YouTube URL
- LinkedIn URL

### 6. **Business Hours**
- Operating hours for each day of the week

### 7. **Website Settings**
- Maintenance Mode
- Allow Bookings Toggle
- Currency & Symbol
- Timezone
- Default Guest Counts

### 8. **Booking Settings**
- Minimum/Maximum Guests
- Booking Lead Time
- Cancellation Policy
- Terms & Conditions
- Privacy Policy

### 9. **SEO Settings**
- Meta Title (browser tab title)
- Meta Description
- Meta Keywords

### 10. **Branding/Theme**
- Primary Color
- Secondary Color
- Font Family

## How to Use

### Accessing Settings
1. Log in to the admin dashboard at `/admin/login`
2. Navigate to **Settings** from the sidebar
3. Use the tabs to navigate different setting categories:
   - **Account** - Your profile and password
   - **Business** - Business name, logo, description
   - **Branding** - Hero section, about section, colors
   - **Contact** - Email, phone, address
   - **Social** - Social media links
   - **Hours** - Business operating hours
   - **Website** - General website settings
   - **Booking** - Booking rules and policies
   - **SEO** - Search engine optimization

### Updating Settings
1. Navigate to the appropriate tab
2. Edit the fields you want to change
3. Click **Save Changes** button at the top
4. Changes will be reflected immediately on the landing page

### Important Notes

#### Business Name vs Website Name
- **Business Name**: Your official business name (e.g., "Filipino Catering Co.")
- **Website Name**: The name shown in the header/navigation (e.g., "Sampaguita & Saro")
- If Website Name is not set, Business Name will be used everywhere

#### Hero Section
The hero section is the first thing visitors see. Customize:
- **Hero Title**: Main headline (e.g., "Authentic Filipino Catering")
- **Hero Subtitle**: Supporting text that describes your service
- **Hero CTA Text**: Button text (e.g., "Book Your Event")

#### Logo Upload
- Supported formats: PNG, JPG, SVG
- Recommended: PNG or SVG for best quality
- Maximum file size: 5MB
- To remove logo: Click the X button on the preview

#### Colors
- Use the color picker or enter hex codes
- Primary color is used for accents and buttons
- Secondary color is used for highlights
- Changes apply site-wide

## Where Settings Appear

### Landing Page Components

1. **Navigation Bar**
   - Website Name (from `websiteName` or `businessName`)

2. **Hero Section**
   - Hero Title
   - Hero Subtitle
   - CTA Button Text

3. **Footer**
   - Business Name
   - Description
   - Contact Information (phone, email, address)
   - Social Media Links

4. **Browser Tab**
   - Meta Title (from SEO settings)
   - Meta Description (for search engines)

## Troubleshooting

### Settings Not Saving
1. Check browser console for errors (F12)
2. Ensure you're logged in as admin
3. Verify all required fields are filled
4. Try refreshing the page and saving again

### Changes Not Appearing
1. Hard refresh the landing page (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Check if settings were actually saved in the dashboard

### Cannot Delete/Clear Text
- Some fields are required and cannot be empty
- To "clear" a field, enter a space or default text
- Logo can be removed by clicking the X button

## Database Schema

Settings are stored in the `settings` table with the following structure:

```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  -- Business Info
  businessName VARCHAR(255) NOT NULL,
  websiteName VARCHAR(255),
  tagline VARCHAR(255),
  description TEXT,
  logo VARCHAR(255),
  
  -- Hero Section
  heroTitle VARCHAR(255),
  heroSubtitle TEXT,
  heroCtaText VARCHAR(255),
  
  -- About Section
  aboutTitle VARCHAR(255),
  aboutContent TEXT,
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(255),
  whatsapp VARCHAR(255),
  address TEXT,
  
  -- Social Media
  facebookUrl VARCHAR(255),
  instagramUrl VARCHAR(255),
  twitterUrl VARCHAR(255),
  tiktokUrl VARCHAR(255),
  youtubeUrl VARCHAR(255),
  linkedinUrl VARCHAR(255),
  
  -- Business Hours (JSON)
  businessHours JSON,
  
  -- Website Settings
  maintenanceMode BOOLEAN DEFAULT false,
  allowBookings BOOLEAN DEFAULT true,
  minGuestsDefault INTEGER DEFAULT 20,
  maxGuestsDefault INTEGER DEFAULT 500,
  bookingLeadTimeDays INTEGER DEFAULT 7,
  
  -- Policies
  cancellationPolicy TEXT,
  termsAndConditions TEXT,
  privacyPolicy TEXT,
  
  -- SEO
  metaTitle VARCHAR(255),
  metaDescription TEXT,
  metaKeywords TEXT,
  
  -- Branding
  primaryColor VARCHAR(7) DEFAULT '#D97706',
  secondaryColor VARCHAR(7) DEFAULT '#059669',
  fontFamily VARCHAR(255) DEFAULT 'Inter',
  
  -- System
  currency VARCHAR(3) DEFAULT 'PHP',
  currencySymbol VARCHAR(5) DEFAULT '₱',
  timezone VARCHAR(50) DEFAULT 'Asia/Manila',
  notificationEmail VARCHAR(255),
  emailNotificationsEnabled BOOLEAN DEFAULT true,
  
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

## API Endpoints

### Get Settings (Public)
```
GET /api/settings
```
Returns all settings (no authentication required)

### Update Settings (Admin Only)
```
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessName": "New Business Name",
  "heroTitle": "New Hero Title",
  ...
}
```

## Future Enhancements

Potential additions for future versions:
- Multiple language support
- Custom CSS injection
- Advanced theme customization
- Gallery image management
- Menu section customization
- Process steps customization
- Testimonial section settings
- Email template customization

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database connection
3. Ensure settings table exists and is properly migrated
4. Check server logs in `CATERING-SERVER/logs/`

For development:
- Frontend: `catering-ui/src/components/catering/`
- Backend: `CATERING-SERVER/src/Controller/settingsController.js`
- Model: `CATERING-SERVER/src/Models/Settings.js`
- API: `catering-ui/src/lib/api.ts`
