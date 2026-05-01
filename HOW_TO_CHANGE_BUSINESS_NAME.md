# How to Change Business Name and All Landing Page Text

## Quick Start Guide

### 🎯 Goal
Change "Sampaguita & Saro" and all other text on your landing page to your own business name and content.

### ⚡ Quick Steps

1. **Start the servers** (if not already running)
   ```bash
   # Terminal 1 - Backend
   cd CATERING-SERVER
   npm start

   # Terminal 2 - Frontend
   cd catering-ui
   npm run dev
   ```

2. **Login to Admin Dashboard**
   - Open browser: `http://localhost:5173/admin/login`
   - Login with your admin credentials

3. **Go to Settings**
   - Click **Settings** in the left sidebar
   - You'll see multiple tabs at the top

4. **Update Your Business Information**

   **Business Tab:**
   - **Website Name**: This is what shows in the header (e.g., "Your Catering Co.")
   - **Business Name**: Your official business name
   - **Tagline**: Your business slogan
   - **Description**: About your business
   - **Logo**: Upload your logo (optional)

   **Branding Tab:**
   - **Hero Title**: Main headline on landing page
   - **Hero Subtitle**: Supporting text below headline
   - **Hero CTA Text**: Button text (e.g., "Book Now", "Get Started")
   - **About Title**: Title for about section
   - **About Content**: Your story/description
   - **Primary Color**: Main brand color
   - **Secondary Color**: Accent color

   **Contact Tab:**
   - **Email**: Your contact email
   - **Phone**: Your phone number
   - **WhatsApp**: WhatsApp number (optional)
   - **Address**: Your business address

   **Social Tab:**
   - Add your social media URLs (Facebook, Instagram, etc.)
   - Leave blank if you don't want to show them

   **SEO Tab:**
   - **Meta Title**: Browser tab title
   - **Meta Description**: Description for search engines
   - **Meta Keywords**: Keywords for SEO

5. **Save Changes**
   - Click the **Save Changes** button at the top
   - Wait for success message

6. **View Your Changes**
   - Go to landing page: `http://localhost:5173`
   - Hard refresh: Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Your new business name and content should appear!

## 📍 Where Your Business Name Appears

After changing the **Website Name** in settings, it will appear in:

1. **Navigation Header** (top of page)
2. **Browser Tab Title** (combined with meta title)
3. **Footer** (bottom of page)
4. **Hero Section Subtitle** (if you use the business name there)
5. **Copyright Text** (footer)

## 🎨 Example Customization

### Before (Default)
```
Website Name: Sampaguita & Saro
Hero Title: Authentic Filipino Catering
Hero Subtitle: Bringing the flavors of the Philippines...
```

### After (Your Business)
```
Website Name: Maria's Catering Services
Hero Title: Premium Event Catering
Hero Subtitle: Creating memorable dining experiences...
```

## 📝 Field Descriptions

### Required Fields
- **Business Name**: Your official business name (required)
- **Website Name**: Name shown in header (uses Business Name if not set)

### Optional But Recommended
- **Hero Title**: First thing visitors see
- **Hero Subtitle**: Explains what you do
- **Hero CTA Text**: Action button text
- **Email**: For contact
- **Phone**: For inquiries
- **Description**: About your business

### Optional
- Logo, social media, colors, policies, etc.

## 🔄 Real-Time Updates

Changes take effect immediately:
1. Save in dashboard
2. Refresh landing page
3. See your changes!

No need to:
- Restart servers
- Rebuild the app
- Edit code files
- Deploy anything

## 🎯 Common Scenarios

### Scenario 1: Just Change the Name
1. Go to Settings → Business tab
2. Change **Website Name** to your business name
3. Save
4. Done! Name appears everywhere

### Scenario 2: Complete Rebrand
1. Update Business tab (name, logo, description)
2. Update Branding tab (hero section, colors)
3. Update Contact tab (email, phone, address)
4. Update Social tab (your social media)
5. Update SEO tab (page title, description)
6. Save
7. Refresh landing page

### Scenario 3: Seasonal Updates
1. Go to Branding tab
2. Update Hero Title/Subtitle for season
3. Update Hero CTA Text (e.g., "Book Holiday Events")
4. Save
5. Revert later when season ends

## 🐛 Troubleshooting

### Changes Not Saving
**Problem**: Click save but nothing happens
**Solution**:
1. Check browser console (F12) for errors
2. Ensure you're logged in
3. Check all required fields are filled
4. Try logging out and back in

### Changes Not Showing
**Problem**: Saved but landing page still shows old text
**Solution**:
1. Hard refresh: `Ctrl+F5` or `Cmd+Shift+R`
2. Clear browser cache
3. Try incognito/private window
4. Check if save was successful in dashboard

### Logo Not Uploading
**Problem**: Logo upload fails
**Solution**:
1. Check file size (max 5MB)
2. Use PNG, JPG, or SVG format
3. Check server is running
4. Check server logs for errors

### Text Too Long
**Problem**: Text gets cut off or looks bad
**Solution**:
1. Keep Hero Title under 50 characters
2. Keep Hero Subtitle under 200 characters
3. Use line breaks in long descriptions
4. Preview on landing page after saving

## 💡 Best Practices

### Business Name
- Keep it short and memorable
- Use your actual business name
- Avoid special characters if possible

### Hero Section
- **Title**: Clear, concise, impactful (3-6 words)
- **Subtitle**: Explain what you do (1-2 sentences)
- **CTA**: Action-oriented (2-3 words)

### Contact Info
- Use real, working contact details
- Test email and phone links
- Keep address format consistent

### Colors
- Use your brand colors
- Ensure good contrast for readability
- Test on both light and dark sections

### SEO
- Meta Title: 50-60 characters
- Meta Description: 150-160 characters
- Include relevant keywords naturally

## 📚 Additional Resources

- **Full Documentation**: See `DYNAMIC_SETTINGS_GUIDE.md`
- **Technical Details**: See `SETTINGS_UPDATE_SUMMARY.md`
- **Database Schema**: Check Settings model in `CATERING-SERVER/src/Models/Settings.js`

## ✅ Checklist

Use this checklist when setting up your business:

- [ ] Update Website Name
- [ ] Update Business Name
- [ ] Upload Logo
- [ ] Set Hero Title
- [ ] Set Hero Subtitle
- [ ] Set Hero CTA Text
- [ ] Add Email Address
- [ ] Add Phone Number
- [ ] Add Business Address
- [ ] Add Social Media Links
- [ ] Set Brand Colors
- [ ] Update Meta Title
- [ ] Update Meta Description
- [ ] Test all changes on landing page
- [ ] Verify contact links work
- [ ] Check mobile responsiveness

## 🎉 You're Done!

Your landing page is now fully customized with your business information. All text is dynamic and can be changed anytime from the admin dashboard without touching any code!

**Need Help?**
- Check the troubleshooting section above
- Review the full documentation
- Check server logs in `CATERING-SERVER/logs/`
- Inspect browser console for errors (F12)
