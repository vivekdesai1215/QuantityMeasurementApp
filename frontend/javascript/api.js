/*
UC-03 : App Integration

- Uses getUnits(type) instead of direct fetch()
- Removes manual filtering from app.js
- Stores units in state (cachedUnits)
- Updates dropdown UI based on API response
- Handles API errors and shows messages
*/


// Base URL
const API_BASE_URL = "http://localhost:3000";

// --- GET UNITS BY TYPE ---
async function getUnits(type) {
  try {
    const res = await fetch(`${API_BASE_URL}/units?type=${type}`);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
}