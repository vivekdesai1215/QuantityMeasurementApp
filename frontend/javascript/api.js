/*
UC-04 : Fetch Conversion Record

- Fetches conversion data for a unit pair
- Uses: GET /conversions?from=X&to=Y
- Returns a single object { from, to, factor, formula }
*/
// API fetch function

async function getUnits(type) {
  try {
    const res = await fetch(`${API_BASE_URL}/units?type=${type}`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("getUnits error:", error);
    throw error;
  }
}

async function getConversion(from, to) {
  try {
    const res = await fetch(`${API_BASE_URL}/conversions?from=${from}&to=${to}`);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json(); // always array

    if (!data.length) {
      throw new Error("No conversion found");
    }

    return data[0]; // ✅ important

  } catch (error) {
    console.error("Conversion fetch error:", error);
    throw error;
  }
}