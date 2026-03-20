/*
UC-JS-04 : Conversion Integration

- Uses getConversion(from, to) from api.js
- Fetches factor/formula dynamically from API
- Handles same unit case (returns value directly)
- Supports both factor and formula-based conversions
- Displays error if conversion pair not found
*/

// @author Vivek
// @version 4.0

const state = {
  type: "length",
  action: "conversion",
  fromVal: null,
  fromUnit: "",
  toVal: null,
  toUnit: "",
  operator: "+"
};

const API_BASE_URL = "http://localhost:3000";

let cachedUnits = [];


document.addEventListener("DOMContentLoaded", async () => {

 const typeButtons = {
  type01: "length",
  type02: "weight",
  type03: "temperature",
  type04: "volume"
};

  const typeBtns = document.querySelectorAll(".type-container button");
  const actionBtns = document.querySelectorAll(".action button");

  const fromInput = document.querySelectorAll("input")[0];
  const toInput = document.querySelectorAll("input")[1];

  const dropdownMenus = document.querySelectorAll(".dropdown-menu");
  const dropdownButtons = document.querySelectorAll(".dropdown-toggle");

  // --- TYPE BUTTONS ---
  typeBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {

      typeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const type = typeButtons[btn.id];
      state.type = type;

      try {
        await loadUnits(type);
      } catch (err) {
        showError("Failed to load units");
      }
    });
  });

  // --- ACTION BUTTONS ---
  actionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {

      actionBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      state.action = btn.textContent.trim().toLowerCase();
    });
  });

  // --- LOAD UNITS INTO DROPDOWN ---
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

// UI/populate dropdowns function
async function loadUnits(type) {
  try {
    const filtered = await getUnits(type); // now works
    cachedUnits = filtered;

    dropdownMenus.forEach((menu, index) => {
      menu.innerHTML = "";
      filtered.forEach(unit => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "dropdown-item";
        a.href = "#";
        a.textContent = unit.label;

        a.addEventListener("click", () => {
          dropdownButtons[index].textContent = unit.label;
          if (index === 0) state.fromUnit = unit.symbol;
          else state.toUnit = unit.symbol;
          convert();
        });

        li.appendChild(a);
        menu.appendChild(li);
      });
    });

    // default selection
    if (filtered.length > 0) {
      state.fromUnit = filtered[0].symbol;
      state.toUnit = filtered[1]?.symbol || filtered[0].symbol;
      dropdownButtons[0].textContent = filtered[0].label;
      dropdownButtons[1].textContent = filtered[1]?.label || filtered[0].label;
    }

  } catch (error) {
    showError("Failed to load units"); // or banner
  }
}

  // --- CONVERSION LOGIC ---
  async function convert() {
  const value = parseFloat(fromInput.value);
  if (!value) return;

  try {
    const result = await convertValue(
      value,
      state.fromUnit,
      state.toUnit
    );

    toInput.value = result.toFixed(4);

  } catch (error) {
    showErrorBanner("Conversion not available for this pair");
  }
}

  // --- INPUT LISTENER ---
  fromInput.addEventListener("input", convert);

  // --- ERROR ---
  function showError(msg) {
    alert(msg);
  }

  // --- INIT ---
  await loadUnits("length");
});