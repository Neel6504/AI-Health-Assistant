# Testing & Debugging Guide - Nearby Hospitals Feature

## Quick Test to Verify Fix

Follow these steps to confirm the issue is resolved:

### Test 1: Verify Correct User Location

1. Open the app and navigate to "Nearby Hospitals"
2. When prompted, **allow location access**
3. Look for the debug info box (blue background):
   ```
   📍 Your Location: XX.XXXXXX, XX.XXXXXX (±XXm accuracy)
   ```
4. **Copy those coordinates**
5. Open [Google Maps](https://maps.google.com) in a new tab
6. **Paste the coordinates** in the search bar
7. **Verify**: Does it show YOUR actual location?
   - ✅ YES → Location is correct!
   - ❌ NO → See "Location Issues" below

### Test 2: Verify Hospitals Are Nearby

1. Check the first 3 hospitals in the list
2. Note their distance (should be in KM, e.g., "2.45 km")
3. Click "Directions" on each
4. Google Maps will open showing the route
5. **Verify**: Is the route reasonable?
   - ✅ YES → Hospitals are from correct location!
   - ❌ NO → See "Wrong Results" below

### Test 3: Verify No Hardcoded Locations

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these log messages:
   ```
   Getting user location...
   User location obtained: {lat: XX.XX, lng: XX.XX}
   Found N hospitals using google_places/openstreetmap
   ```
4. **Verify**: The coordinates match YOUR location?
   - ✅ YES → Using real-time location!
   - ❌ NO → See "Location Issues" below

---

## Common Issues & Solutions

### Issue: Still showing hospitals from China (or wrong country)

**Likely Causes:**

1. **VPN/Proxy Active**
   - Solution: Disable VPN and refresh the page
   - Why: VPN routes traffic through another country, affecting location

2. **Browser Location Cached**
   - Solution: Clear browser cache and site data
   - Chrome: Settings > Privacy > Clear browsing data
   - Select "Cached images and files" and "Cookies and site data"

3. **Using Mock Location (Developer Tools)**
   - Solution: Disable location mocking
   - Chrome: DevTools > Sensors > Location = "No override"

4. **Browser Has Wrong Default Location**
   - Solution: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear location permission and re-grant it

### Issue: "Location access is required" Error

**Solutions:**

1. **Grant Permission:**
   - Click the 🔒 or ℹ️ icon in address bar
   - Find "Location" permission
   - Set to "Allow"
   - Refresh page

2. **Permission Blocked by Browser:**
   - Chrome: Settings > Privacy > Site Settings > Location
   - Remove site from "Block" list
   - Add to "Allow" list

3. **HTTPS Required (in production):**
   - Geolocation requires HTTPS (except localhost)
   - Development: `localhost` is fine
   - Production: Use HTTPS

### Issue: No Hospitals Found (but they exist nearby)

**Possible Causes:**

1. **API Timeout/Failure:**
   - Check browser console for errors
   - Red errors = API issue
   - Try "Retry Location" button

2. **Rural Area:**
   - Hospitals may be > 5km away
   - Use "Google Maps" button to check manually

3. **OpenStreetMap Data Missing:**
   - OSM data may be incomplete in your area
   - Solution: Set up Google Places API (see LOCATION_SETUP.md)

### Issue: Duplicate Hospitals or Wrong Data

**If using OpenStreetMap:**
- OSM data is community-sourced and may have duplicates
- Solution: Use Google Places API for cleaner results

**If using Google Places API:**
- Check API key is valid
- Verify Places API is enabled in Google Cloud Console
- Check API quota hasn't been exceeded

---

## Debugging Console Commands

Open browser DevTools (F12) and run these commands:

### 1. Check Current Location

```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => console.log('Latitude:', pos.coords.latitude, 'Longitude:', pos.coords.longitude),
  (err) => console.error('Location error:', err)
)
```

**Expected Output:**
```
Latitude: 37.774929 Longitude: -122.419418
```

### 2. Test Distance Calculation

```javascript
// Example: Distance from San Francisco to Oakland
const R = 6371
const lat1 = 37.7749 // SF
const lon1 = -122.4194
const lat2 = 37.8044 // Oakland
const lon2 = -122.2712

const dLat = (lat2 - lat1) * Math.PI / 180
const dLon = (lon2 - lon1) * Math.PI / 180

const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2)

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
const distance = R * c

console.log('Distance:', distance.toFixed(2), 'km')
```

**Expected Output:** ~16.8 km (actual distance SF to Oakland)

### 3. Check API Response (if using Google Places)

Open Network tab in DevTools:
1. Filter by "nearbysearch" or "interpreter" (for OSM)
2. Click on the request
3. Go to "Response" tab
4. Verify results have your location's country

---

## Step-by-Step Debugging Process

### Step 1: Verify Browser Supports Geolocation

```javascript
if ('geolocation' in navigator) {
  console.log('✅ Geolocation supported')
} else {
  console.log('❌ Geolocation NOT supported')
}
```

### Step 2: Check Permission State

```javascript
navigator.permissions.query({ name: 'geolocation' }).then((result) => {
  console.log('Geolocation permission:', result.state)
  // Should be: 'granted', 'denied', or 'prompt'
})
```

### Step 3: Test Location Accuracy

After getting hospitals:
1. Note the accuracy value (in meters)
2. Lower is better
   - < 50m: Excellent (GPS)
   - 50-500m: Good (WiFi triangulation)
   - > 500m: Poor (IP geolocation)

### Step 4: Validate Hospital Coordinates

For each hospital, verify coordinates are reasonable:

```javascript
// All hospitals should be within ~5.1km (accounting for calculation variance)
hospitals.forEach(h => {
  if (h.distance > 5.1) {
    console.warn('⚠️ Hospital too far:', h.name, h.distance, 'km')
  }
})
```

---

## Network Request Debugging

### OpenStreetMap Overpass API

**Expected Request URL:**
```
https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node["amenity"="hospital"](around:5000,37.7749,-122.4194);way["amenity"="hospital"](around:5000,37.7749,-122.4194);relation["amenity"="hospital"](around:5000,37.7749,-122.4194));out center;
```

**Check:**
- The coordinates (37.7749,-122.4194) should be YOUR location
- Radius is 5000 meters
- Response should have `elements` array

### Google Places API

**Expected Request URL:**
```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.7749,-122.4194&radius=5000&type=hospital&key=YOUR_KEY
```

**Check:**
- Location matches your coordinates
- Radius is 5000
- Response status is "OK" or "ZERO_RESULTS"
- NOT "REQUEST_DENIED" (would mean API key issue)

---

## Performance & Rate Limiting

### OpenStreetMap Overpass API
- Rate limit: ~2 requests per second
- Timeout: 25 seconds max
- If rate limited, wait 1 minute and try again

### Google Places API
- Free tier: $200/month credit
- Cost: ~$0.032 per request (Nearby Search)
- Monthly quota: ~6,250 free requests
- After limit: Charged per request

**Monitor Usage:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Dashboard"
4. View "Places API" usage

---

## Testing on Different Devices

### Desktop Browser
- Use DevTools Sensors to mock different locations
- Chrome: F12 > Sensors > Custom location

### Mobile Device
1. Open app on your phone
2. Grant location permission
3. Should use GPS for highest accuracy
4. Compare results with Google Maps on same device

### Different Browsers
Test on:
- Chrome (best support)
- Firefox (good support)
- Safari (iOS location permissions are strict)
- Edge (Chromium-based, same as Chrome)

---

## Expected Behavior Checklist

When everything works correctly:

- [ ] Location permission prompt appears
- [ ] Debug info shows correct coordinates
- [ ] At least 1 hospital found (in urban areas)
- [ ] All hospitals show distance in KM
- [ ] Hospitals sorted nearest to farthest
- [ ] Distance #1 < Distance #2 < Distance #3...
- [ ] "Directions" opens route from YOUR location
- [ ] No hospitals from other countries
- [ ] Error handling works (test by denying permission)

---

## Still Having Issues?

### Create a Debug Report

1. Open browser DevTools (F12) > Console
2. Copy all logs (especially errors in red)
3. Take a screenshot of:
   - The debug info box (showing coordinates)
   - First 3 hospitals listed
   - Any error messages
4. Note:
   - Your actual location (city/country)
   - Browser name and version
   - Whether using VPN
   - API being used (Google or OSM)

### Quick Fixes to Try

1. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear Site Data**: DevTools > Application > Clear storage
3. **Incognito Mode**: Test in private/incognito window
4. **Different Browser**: Try Chrome if using another browser
5. **Disable Extensions**: Some extensions block location
6. **Check Firewall**: May block geolocation APIs

---

## Success Indicators

You'll know it's working when:

1. ✅ Your location coordinates match Google Maps
2. ✅ Hospital #1 is the closest to you
3. ✅ All hospitals are in your city/country
4. ✅ Distance increases as you scroll down
5. ✅ "Directions" shows accurate route from where you are
6. ✅ No errors in console (or just warnings)

---

## Need Help?

If none of these solutions work:
1. Check the LOCATION_SETUP.md guide
2. Review the code in locationService.js
3. Verify your .env file has correct format
4. Test with both Google and OSM to isolate the issue
