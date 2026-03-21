/*
UC-JS-07 : Apply Conversion

- Applies conversion using factor or formula
- Handles both multiplication and expression evaluation
- Ensures precision up to 6 decimal places
- Validates input and throws meaningful errors
- Safe eval usage (only trusted DB formulas)
*/

// @author Vivek
// @version 7.0


console.log("Main Js is loaded")
const state = {
  type: "length",
  action: "conversion",
  fromVal: null,
  fromUnit: "",
  toVal: null,
  toUnit: "",
  operator: "+"
};

// const API_BASE_URL = "http://localhost:3000"; 

let cachedUnits = [];


document.addEventListener("DOMContentLoaded", async () => {
   document.addEventListener("submit", (e) => e.preventDefault());

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
    btn.addEventListener("click", async (e) => {
        e.preventDefault(); 
      typeBtns.forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      const type = typeButtons[btn.id];
      state.type = type;

      try {
        await loadUnits(type);
        await loadHistoryUI();
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


  // --- LOAD UNITS INTO DROPDOWN --
// UI/populate dropdowns function
// --- LOAD UNITS INTO DROPDOWN ---
async function loadUnits(type) {
  try {
    const filtered = await getUnits(type); 
    cachedUnits = filtered;
    console.log("Entered loadUnits function");

    dropdownMenus.forEach((menu, index) => {
      menu.innerHTML = "";

      filtered.forEach(unit => {
        // create button instead of <a>
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = "dropdown-item";
        btn.type = "button"; // prevents page refresh
        btn.textContent = unit.label;

        btn.addEventListener("click", () => {
          dropdownButtons[index].textContent = unit.label;
          if (index === 0) state.fromUnit = unit.symbol;
          else state.toUnit = unit.symbol;

          convert(); // trigger conversion on selection
        });

        li.appendChild(btn);
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
    showError("Failed to load units"); 
  }
}


  // --- CONVERSION LOGIC ---
  async function convert() {
    console.log("convert triggered");
  const value = parseFloat(fromInput.value);
  console.log("value:", value);
  console.log("from:", state.fromUnit, "to:", state.toUnit);
  if (isNaN(value)) return;

  try {
    const result = await convertValue(
      value,
      state.fromUnit,
      state.toUnit
    );
    console.log("result:", result);

    toInput.value = result.toFixed(4);

    // Prepare history record
    // const record = {
    //   type: state.type,
    //   action: state.action,
    //   expression: `${value} ${state.fromUnit} → ${state.toUnit}`,
    //   result: result,
    //   timestamp: new Date().toISOString()
    // };


  } catch (error) {
    showErrorBanner("Conversion not available for this pair");
  }
}

fromInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") e.preventDefault(); // stops page refresh
});

let debounceTimer;
  // --- INPUT LISTENER ---
//   fromInput.addEventListener("input", async (e) => {
//   try {
//     await convert();
//   } catch (err) {
//     console.error(err);
//   }
// });


fromInput.addEventListener("input", async (e) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async ()=>{
   await convert();

   const value = parseFloat(fromInput.value)
   if(isNaN(value)) return;

  const record = {
      type: state.type,
      action: state.action,
      expression: `${value} ${state.fromUnit} → ${state.toUnit}`,
      result: result,
      timestamp: new Date().toISOString()
    };

    saveHistory(record);


  },500);
});



  // --- ERROR ---
  function showError(msg) {
    alert(msg);
  }

  // --- INIT ---
  await loadUnits("length");
  await loadHistoryUI();
});


// --- Save calculation record to history ---
async function saveHistory(record) {
  try {
    // POST the record to /history
    const res = await fetch(`${API_BASE_URL}/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const savedRecord = await res.json(); // object with auto-assigned id
    console.log("History saved:", savedRecord);
    return savedRecord;

  } catch (error) {
    // Non-critical: just log, don't block user
    console.error("Failed to save history:", error);
    return null;
  }
}


// --- LOAD HISTORY INTO UI ---
async function loadHistoryUI() {
  const history = await getHistory();

  const container = document.getElementById("history-container");

  // Clear previous
  container.innerHTML = "";

  if (!history.length) {
    container.innerHTML = "<p>No history yet</p>";
    return;
  }

  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <strong>${item.expression}</strong> = ${item.result}
      <br/>
      <small>${new Date(item.timestamp).toLocaleString()}</small>
    `;

    container.appendChild(div);
  });
}