# Settings Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                          │
│                     (http://localhost:5173/admin)               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Admin edits settings
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SETTINGS PAGE                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │ Business │ Branding │ Contact  │  Social  │   SEO    │      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
│                                                                  │
│  [Save Changes Button] ──────────────────────────────────┐      │
└──────────────────────────────────────────────────────────┼──────┘
                                                           │
                                                           │ PUT /api/settings
                                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                           │
│                  (http://localhost:5000)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  settingsController.updateSettings()               │         │
│  │  - Receives all settings fields                    │         │
│  │  - Updates database                                │         │
│  │  - Returns success response                        │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Saves to database
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (SQLite)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  settings table                                    │         │
│  │  - businessName                                    │         │
│  │  - websiteName                                     │         │
│  │  - heroTitle, heroSubtitle, heroCtaText           │         │
│  │  - email, phone, address                          │         │
│  │  - social media URLs                              │         │
│  │  - colors, SEO, etc.                              │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Fetched by landing page
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LANDING PAGE                               │
│                   (http://localhost:5173)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Nav Component                                     │         │
│  │  - Fetches settings on mount                       │         │
│  │  - Displays websiteName in header                  │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Hero Component                                    │         │
│  │  - Fetches settings on mount                       │         │
│  │  - Displays heroTitle, heroSubtitle, heroCtaText   │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Footer Component                                  │         │
│  │  - Fetches settings on mount                       │         │
│  │  - Displays contact info, social links             │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Index Page                                        │         │
│  │  - Fetches settings on mount                       │         │
│  │  - Updates page title and meta tags                │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Admin Updates Settings

```
Admin Dashboard
    │
    ├─ Opens Settings Page
    │
    ├─ Edits fields in tabs:
    │   ├─ Business (name, logo, description)
    │   ├─ Branding (hero section, colors)
    │   ├─ Contact (email, phone, address)
    │   ├─ Social (social media URLs)
    │   └─ SEO (meta tags)
    │
    ├─ Clicks "Save Changes"
    │
    └─ Sends PUT request to /api/settings
        │
        └─ Backend updates database
            │
            └─ Returns success response
```

### 2. Landing Page Loads Settings

```
Landing Page Loads
    │
    ├─ Nav Component
    │   └─ useEffect() → GET /api/settings
    │       └─ Sets websiteName in state
    │           └─ Renders in header
    │
    ├─ Hero Component
    │   └─ useEffect() → GET /api/settings
    │       └─ Sets heroTitle, heroSubtitle, heroCtaText
    │           └─ Renders in hero section
    │
    ├─ Footer Component
    │   └─ useEffect() → GET /api/settings
    │       └─ Sets contact info, social links
    │           └─ Renders in footer
    │
    └─ Index Page
        └─ useEffect() → GET /api/settings
            └─ Updates document.title and meta tags
```

## Component Hierarchy

```
Index.tsx (Landing Page)
│
├─ BookingProvider
│   │
│   ├─ Nav.tsx
│   │   └─ Fetches & displays: websiteName
│   │
│   ├─ Hero.tsx
│   │   └─ Fetches & displays: heroTitle, heroSubtitle, heroCtaText
│   │
│   ├─ Menus.tsx
│   │
│   ├─ Process.tsx
│   │
│   ├─ Gallery.tsx
│   │
│   ├─ Testimonials.tsx
│   │
│   └─ Footer.tsx
│       └─ Fetches & displays: businessName, email, phone, address, social links
│
└─ Updates: document.title, meta description
```

## Settings Tabs Structure

```
Settings Page
│
├─ Account Tab
│   ├─ Profile Information
│   │   ├─ Name
│   │   └─ Email
│   └─ Change Password
│       ├─ Current Password
│       ├─ New Password
│       └─ Confirm Password
│
├─ Business Tab
│   ├─ Website Name ⭐ (shows in header)
│   ├─ Business Name ⭐ (official name)
│   ├─ Tagline
│   ├─ Description
│   └─ Logo Upload
│
├─ Branding Tab
│   ├─ Hero Section
│   │   ├─ Hero Title ⭐
│   │   ├─ Hero Subtitle ⭐
│   │   └─ Hero CTA Text ⭐
│   ├─ About Section
│   │   ├─ About Title
│   │   └─ About Content
│   └─ Brand Colors
│       ├─ Primary Color
│       └─ Secondary Color
│
├─ Contact Tab
│   ├─ Email Address ⭐
│   ├─ Notification Email
│   ├─ Phone Number ⭐
│   ├─ WhatsApp Number
│   ├─ Business Address ⭐
│   └─ Email Notifications Toggle
│
├─ Social Tab
│   ├─ Facebook URL
│   ├─ Instagram URL
│   ├─ Twitter/X URL
│   ├─ TikTok URL
│   ├─ YouTube URL
│   └─ LinkedIn URL
│
├─ Hours Tab
│   └─ Business Hours (Monday-Sunday)
│
├─ Website Tab
│   ├─ Maintenance Mode Toggle
│   ├─ Allow Bookings Toggle
│   ├─ Currency Settings
│   └─ Timezone
│
├─ Booking Tab
│   ├─ Default Guest Counts
│   ├─ Booking Lead Time
│   ├─ Cancellation Policy
│   ├─ Terms & Conditions
│   └─ Privacy Policy
│
└─ SEO Tab
    ├─ Meta Title ⭐
    ├─ Meta Description ⭐
    └─ Meta Keywords

⭐ = Most important for basic setup
```

## API Endpoints

```
GET /api/settings
├─ Public endpoint (no auth required)
├─ Returns all settings
└─ Used by landing page components

PUT /api/settings
├─ Admin only (requires authentication)
├─ Accepts all settings fields
├─ Updates database
└─ Returns updated settings
```

## Database Schema (Simplified)

```
settings table
├─ id (PRIMARY KEY)
│
├─ Business Info
│   ├─ businessName
│   ├─ websiteName
│   ├─ tagline
│   ├─ description
│   └─ logo
│
├─ Hero Section
│   ├─ heroTitle
│   ├─ heroSubtitle
│   └─ heroCtaText
│
├─ Contact
│   ├─ email
│   ├─ phone
│   ├─ whatsapp
│   └─ address
│
├─ Social Media
│   ├─ facebookUrl
│   ├─ instagramUrl
│   ├─ twitterUrl
│   ├─ tiktokUrl
│   ├─ youtubeUrl
│   └─ linkedinUrl
│
├─ Branding
│   ├─ primaryColor
│   └─ secondaryColor
│
├─ SEO
│   ├─ metaTitle
│   ├─ metaDescription
│   └─ metaKeywords
│
└─ Other Settings
    ├─ businessHours (JSON)
    ├─ maintenanceMode
    ├─ allowBookings
    ├─ currency
    └─ timezone
```

## Update Flow Example

```
User Action: Change business name from "Sampaguita & Saro" to "Maria's Catering"

1. Admin Dashboard
   └─ Settings → Business Tab
       └─ Website Name: "Maria's Catering"
           └─ Click "Save Changes"

2. Frontend (SettingsPage.tsx)
   └─ handleSave()
       └─ settingsService.update({ websiteName: "Maria's Catering" })

3. API Request
   └─ PUT /api/settings
       └─ Body: { websiteName: "Maria's Catering" }

4. Backend (settingsController.js)
   └─ updateSettings()
       └─ settings.update({ websiteName: "Maria's Catering" })

5. Database
   └─ UPDATE settings SET websiteName = "Maria's Catering"

6. Response
   └─ { success: true, data: { ...updatedSettings } }

7. Landing Page (on next load/refresh)
   ├─ Nav.tsx
   │   └─ GET /api/settings
   │       └─ Displays "Maria's Catering" in header
   │
   ├─ Footer.tsx
   │   └─ GET /api/settings
   │       └─ Displays "Maria's Catering" in footer
   │
   └─ Index.tsx
       └─ GET /api/settings
           └─ Updates page title to include "Maria's Catering"
```

## File Structure

```
Project Root
│
├─ CATERING-SERVER/
│   ├─ src/
│   │   ├─ Controller/
│   │   │   └─ settingsController.js ⭐ (handles updates)
│   │   ├─ Models/
│   │   │   └─ Settings.js ⭐ (database schema)
│   │   └─ Routes/
│   │       └─ settingsRoutes.js (API endpoints)
│   └─ scripts/
│       └─ initializeSettings.js (creates defaults)
│
└─ catering-ui/
    ├─ src/
    │   ├─ components/
    │   │   └─ catering/
    │   │       ├─ Nav.tsx ⭐ (uses websiteName)
    │   │       ├─ Hero.tsx ⭐ (uses hero settings)
    │   │       └─ Footer.tsx ⭐ (uses contact/social)
    │   ├─ pages/
    │   │   ├─ Index.tsx ⭐ (updates meta tags)
    │   │   └─ admin/
    │   │       └─ SettingsPage.tsx ⭐ (admin UI)
    │   └─ lib/
    │       └─ api.ts (API service layer)
    │
    └─ Documentation/
        ├─ HOW_TO_CHANGE_BUSINESS_NAME.md
        ├─ DYNAMIC_SETTINGS_GUIDE.md
        └─ SETTINGS_UPDATE_SUMMARY.md

⭐ = Key files for settings functionality
```

This diagram shows the complete flow of how settings work in your application!
