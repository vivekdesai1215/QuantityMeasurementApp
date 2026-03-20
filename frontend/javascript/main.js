/*
UC-03 : API Layer

- Handles all fetch() calls to json-server
- Fetches units using: GET /units?type=Type
- Returns filtered unit data as JSON
- Handles HTTP and network errors
- No UI or business logic here
*/


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
 async function loadUnits(type) {
  try {
    const filtered = await getUnits(type); // ✅ from api.js
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
    showErrorBanner("Failed to load units");
  }
}

  // --- CONVERSION LOGIC ---
  function convert() {
    const value = parseFloat(fromInput.value);
    if (!value) return;

    const fromUnit = cachedUnits.find(u => u.symbol === state.fromUnit);
    const toUnit = cachedUnits.find(u => u.symbol === state.toUnit);

    if (!fromUnit || !toUnit) return;

    // convert to base first
    const base = value * fromUnit.factor;
    const result = base / toUnit.factor;

    toInput.value = result.toFixed(4);
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