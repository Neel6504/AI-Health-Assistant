# Nearby Hospitals Feature - Setup Guide

## Overview

The **Nearby Hospitals** feature finds and displays hospitals within a 5km radius of your current location. It uses real-time geolocation and supports two data sources:

1. **Google Places API** (Preferred) - More accurate, includes ratings and photos
2. **OpenStreetMap Overpass API** (Fallback) - Free, no API key required

---

## Features Implemented ✅

- ✅ Real-time user geolocation using `navigator.geolocation.getCurrentPosition()`
- ✅ Search radius: 5000 meters (5 km)
- ✅ Distance calculation using Haversine formula
- ✅ Hospitals sorted by nearest distance first
- ✅ Display: Name, Address, Distance (in KM), Open Status
- ✅ Google Maps directions with user location as origin
- ✅ Proper error handling for:
  - Geolocation not supported
  - Location permission denied
  - API failures
  - No hospitals found
- ✅ Clean modular code with async/await
- ✅ No hardcoded locations or country defaults

---

## How It Works

### 1. Getting User Location

```javascript
// Automatically requests location permission on page load
const location = await getUserLocation()
// Returns: { lat: number, lng: number, accuracy: number }
```

**Error Handling:**
- **Permission Denied**: Shows message "Location access is required to find nearby hospitals."
- **Not Supported**: Shows message "Geolocation is not supported by your browser"
- **Timeout**: Shows message "Location request timed out. Please try again."

### 2. Fetching Nearby Hospitals

The app tries Google Places API first (if API key is provided), then falls back to OpenStreetMap:

```javascript
const result = await findNearbyHospitals(location, GOOGLE_API_KEY)
// Returns: { hospitals: [], source: 'google_places' | 'openstreetmap' }
```

### 3. Distance Calculation

Uses the Haversine formula to calculate accurate distance:

```javascript
distance = calculateDistance(userLat, userLng, hospitalLat, hospitalLng)
// Returns distance in kilometers (e.g., 2.45)
```

### 4. Sorting & Display

- Hospitals are automatically sorted by distance (nearest first)
- Each hospital shows:
  - **Rank**: #1, #2, #3...
  - **Distance**: "2.45 km away"
  - **Status**: Open/Closed (if available)
  - **Address**
  - **Directions button** (opens Google Maps with route)

---

## Setup Instructions

### Option 1: Using OpenStreetMap (Default - No Setup Required)

The app works out of the box with OpenStreetMap. No API key needed!

**Pros:**
- Free
- No setup required
- Works globally

**Cons:**
- Less detailed data
- No ratings or reviews
- May miss some hospitals

### Option 2: Using Google Places API (Recommended)

For better results, set up Google Places API:

#### Step 1: Get a Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

#### Step 2: Restrict Your API Key (Recommended)

1. Click on your API key in the Credentials page
2. Under "API restrictions":
   - Select "Restrict key"
   - Enable only: **Places API**
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add your domain (e.g., `localhost:*`, `yourdomain.com/*`)
4. Save

#### Step 3: Add API Key to Your Project

Create a `.env` file in the `User` directory:

```env
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
```

**Important:** Add `.env` to your `.gitignore` file to keep your API key private!

#### Step 4: Restart Development Server

```bash
npm run dev
```

The app will now use Google Places API for better results!

---

## Debugging Tips

### Problem: Showing hospitals from wrong country (e.g., China)

**Possible Causes:**
1. **Browser location is wrong**: Check if your browser has correct location permissions
2. **VPN active**: Disable VPN to get accurate location
3. **Location mocking**: Some developer tools mock location - disable it

**How to Debug:**

1. Check the debug info shown on the page:
   ```
   📍 Your Location: 37.774929, -122.419418 (±20m accuracy)
   ```

2. Verify your coordinates are correct:
   - Copy the coordinates
   - Paste in Google Maps search
   - Confirm it shows your actual location

3. Check browser console:
   ```javascript
   console.log('User location obtained:', location)
   console.log('Found X hospitals using Y')
   ```

4. Verify each hospital's coordinates:
   - Open browser DevTools > Console
   - Check that hospital lat/lng are near your location
   - If they're far away, the API returned wrong data

### Problem: No hospitals found

**Solutions:**
1. Check internet connection
2. Try the "Retry Location" button
3. Open Google Maps fallback button to verify hospitals exist nearby
4. Check browser console for API errors

### Problem: "Location access is required" error

**Solutions:**
1. Click the location icon in the browser address bar
2. Set location permission to "Allow"
3. Refresh the page
4. Click "Retry Location"

### Problem: Google Places API not working

**Check:**
1. Is API key in `.env` file?
2. Is Places API enabled in Google Cloud Console?
3. Are you within the free tier limit? (Google provides $200/month credit)
4. Check browser console for API errors
5. Verify API key restrictions allow your domain

---

## API Comparison

| Feature | Google Places API | OpenStreetMap |
|---------|-------------------|---------------|
| Setup | Requires API key | No setup |
| Cost | Free tier: $200/month | Always free |
| Accuracy | High | Good |
| Ratings | ✅ Yes | ❌ No |
| Photos | ✅ Yes | ❌ No |
| Phone Numbers | ✅ Often available | Sometimes |
| Opening Hours | ✅ Detailed | ✅ Basic |
| Global Coverage | ✅ Excellent | ✅ Good (varies) |

---

## Code Structure

```
User/src/
├── services/
│   └── locationService.js          # All location logic
├── pages/
│   ├── NearbyHospitals.jsx         # Main component
│   └── NearbyHospitals.css         # Styling
└── components/
    └── Loader.jsx                   # Loading indicator
```

### locationService.js Functions

- `getUserLocation()` - Gets user's current coordinates
- `calculateDistance()` - Calculates distance between two points
- `findHospitalsWithGooglePlaces()` - Google Places API search
- `findHospitalsWithOverpass()` - OpenStreetMap search
- `findNearbyHospitals()` - Main function (tries Google, falls back to OSM)

---

## Example Hospital Object

```javascript
{
  id: "ChIJ...",
  name: "City General Hospital",
  address: "123 Medical Drive, San Francisco, CA 94102",
  lat: 37.774929,
  lng: -122.419418,
  distance: 2.45,              // kilometers
  rating: 4.5,                 // Google rating (or 'N/A')
  userRatingsTotal: 423,
  isOpen: true,                // true/false/null
  phone: "+1-555-0123",
  website: "https://...",
  facilities: ["Emergency Services", "ICU", "Pharmacy"]
}
```

---

## Testing Checklist

- [ ] Location permission prompt appears
- [ ] User coordinates are accurate (check debug info)
- [ ] Hospitals are within 5km radius
- [ ] Hospitals sorted by distance (nearest first)
- [ ] Distance shows in kilometers
- [ ] "Directions" button opens correct Google Maps route
- [ ] Error messages show when appropriate
- [ ] Works on mobile devices
- [ ] Works in different browsers

---

## Troubleshooting

### Edge Cases Handled

1. **User denies location**: Shows error with retry option
2. **No hospitals nearby**: Shows helpful message + Google Maps link
3. **API timeout**: Falls back gracefully
4. **Invalid coordinates**: Filtered out before display
5. **Browser doesn't support geolocation**: Clear error message

### Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (Not supported - requires geolocation API)

---

## Privacy & Security

- ✅ Location is only used for current search
- ✅ Not stored or sent to any server
- ✅ API key restricted to specific domains
- ✅ CORS handled by proxy (if needed)
- ✅ No user tracking

---

## Future Enhancements (Optional)

- [ ] Filter by hospital type (emergency, clinic, etc.)
- [ ] Adjust search radius (1km, 5km, 10km)
- [ ] Save favorite hospitals
- [ ] Show hospital on map view
- [ ] Real-time traffic for directions
- [ ] Walk/Drive time estimates

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify location permissions
3. Test with Google Maps to confirm hospitals exist nearby
4. Check API key configuration (if using Google Places)

---

## License

This feature is part of the AI Health Assistant project.
