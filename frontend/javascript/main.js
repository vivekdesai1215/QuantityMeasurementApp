/**
 * UC-JS-09: Perform Arithmetic Between Two Measurements
 * -----------------------------------------------------
 * Applies +, -, ×, ÷ after normalising TO value to FROM unit.
 * Preconditions: v2 already converted to FROM unit.
 * Postconditions: Returns numeric result in FROM unit.
 * Handles division by zero with descriptive error.
 */

// @author Vivek
// @version 9.0

console.log("Main Js is loaded");

const state = {
  type: "length",
  action: "conversion",
  fromVal: null,
  fromUnit: "",
  toVal: null,
  toUnit: "",
  operator: "+"
};

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

  // --- CONVERSION ELEMENTS ---
  const fromInput = document.querySelectorAll("input")[0];
  const toInput = document.querySelectorAll("input")[1];
  const dropdownMenus = document.querySelectorAll(".dropdown-menu");
  const dropdownButtons = document.querySelectorAll(".dropdown-toggle");

  // --- ARITHMETIC ELEMENTS ---
  const arithContainer = document.getElementById("arithmetic-container");
  const arithValue1 = document.getElementById("arith-value1");
  const arithValue2 = document.getElementById("arith-value2");
  const arithResult = document.getElementById("arithmetic-result");
  const arithFromUnitBtn = document.getElementById("arith-from-unit-btn");
  const arithFromUnitMenu = document.getElementById("arith-from-unit-menu");
  const arithToUnitBtn = document.getElementById("arith-to-unit-btn");
  const arithToUnitMenu = document.getElementById("arith-to-unit-menu");
  const operatorBtn = document.getElementById("operator-btn");
  const operatorMenu = document.getElementById("operator-menu");

  // --- TYPE BUTTONS ---
  typeBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      typeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const type = typeButtons[btn.id];
      state.type = type;

      try {
        await loadUnits(type); // conversion dropdowns
        loadArithmeticUnits(type); // arithmetic dropdowns
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

      // Toggle UI
      if (state.action === "arithmetic") {
        arithContainer.style.display = "block";
        document.querySelector(".converter-container").style.display = "none";
      } else {
        arithContainer.style.display = "none";
        document.querySelector(".converter-container").style.display = "flex";
      }
    });
  });

  // --- LOAD UNITS INTO DROPDOWN ---
  async function loadUnits(type) {
    try {
      const filtered = await getUnits(type);
      cachedUnits = filtered;

      dropdownMenus.forEach((menu, index) => {
        menu.innerHTML = "";
        filtered.forEach(unit => {
          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.className = "dropdown-item";
          btn.type = "button";
          btn.textContent = unit.label;

          btn.addEventListener("click", () => {
            dropdownButtons[index].textContent = unit.label;
            if (index === 0) state.fromUnit = unit.symbol;
            else state.toUnit = unit.symbol;
            convert();
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
    const rawValue = fromInput.value.trim();
    const value = parseFloat(rawValue);
    if (isNaN(value)) {
      toInput.value = "";
      return;
    }
    try {
      const result = await convertValue(value, state.fromUnit, state.toUnit);
      toInput.value = isNaN(result) ? "" : result.toFixed(4);
    } catch (err) {
      console.error("Conversion failed:", err);
      toInput.value = "";
    }
  }

  fromInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") e.preventDefault();
  });

  let debounceTimer;
  fromInput.addEventListener("input", async (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      await convert();
    }, 300);
  });

  // --- ARITHMETIC LOGIC ---
 function loadArithmeticUnits(type) {
    // Populate both value unit dropdowns
    arithFromUnitMenu.innerHTML = "";
    arithToUnitMenu.innerHTML = "";

    cachedUnits.forEach(unit => {
      const btn1 = document.createElement("button");
      btn1.className = "dropdown-item";
      btn1.type = "button";
      btn1.textContent = unit.label;
      btn1.addEventListener("click", () => {
        arithFromUnitBtn.textContent = unit.label;
        state.fromUnit = unit.symbol;
        calculateArithmetic();
      });
      arithFromUnitMenu.appendChild(btn1);

      const btn2 = document.createElement("button");
      btn2.className = "dropdown-item";
      btn2.type = "button";
      btn2.textContent = unit.label;
      btn2.addEventListener("click", () => {
        arithToUnitBtn.textContent = unit.label;
        state.toUnit = unit.symbol;
        calculateArithmetic();
      });
      arithToUnitMenu.appendChild(btn2);
    });

    // default selection
    if (cachedUnits.length > 0) {
      state.fromUnit = cachedUnits[0].symbol;
      state.toUnit = cachedUnits[1]?.symbol || cachedUnits[0].symbol;
      arithFromUnitBtn.textContent = cachedUnits[0].label;
      arithToUnitBtn.textContent = cachedUnits[1]?.label || cachedUnits[0].label;
    }

    // Populate operator dropdown with the correct operators
    const operatorMenu = document.getElementById("operator-menu");
    operatorMenu.innerHTML = "";  // Clear any previous entries
    const operators = ["+", "-", "×", "÷"];  // Mathematical operators

    operators.forEach(operator => {
      const operatorItem = document.createElement("li");
      const operatorButton = document.createElement("button");
      operatorButton.className = "dropdown-item";
      operatorButton.type = "button";
      operatorButton.textContent = operator;
      operatorButton.addEventListener("click", () => {
        state.operator = operator;
        operatorBtn.textContent = operator;
        calculateArithmetic();
      });
      operatorItem.appendChild(operatorButton);
      operatorMenu.appendChild(operatorItem);
    });

    // Default operator
    state.operator = operators[0];  // Default to "+"
    operatorBtn.textContent = operators[0];  // Set button to "+"
}

  // Operator dropdown
  operatorMenu.querySelectorAll(".dropdown-item").forEach(btn => {
    btn.addEventListener("click", () => {
      state.operator = btn.textContent;
      operatorBtn.textContent = state.operator;
      calculateArithmetic();
    });
  });

  function calculateArithmetic() {
    const v1 = parseFloat(arithValue1.value);
    const v2 = parseFloat(arithValue2.value);

    if (isNaN(v1) || isNaN(v2)) {
      arithResult.value = "";
      return;
    }

    // Convert Value2 to Value1's unit
    convertValue(v2, state.toUnit, state.fromUnit).then(convertedV2 => {
      let result;
      switch (state.operator) {
        case '+': result = v1 + convertedV2; break;
        case '-': result = v1 - convertedV2; break;
        case '×': result = v1 * convertedV2; break;
        case '÷': result = convertedV2 !== 0 ? v1 / convertedV2 : "Error"; break;
        default: result = "";
      }
      arithResult.value = typeof result === "number" ? result.toFixed(4) : result;
    }).catch(err => {
      console.error(err);
      arithResult.value = "Error";
    });
  }

  // Trigger arithmetic calculation on input
  [arithValue1, arithValue2].forEach(input => {
    input.addEventListener("input", calculateArithmetic);
  });

  // --- ERROR ---
  function showError(msg) {
    alert(msg);
  }

  // --- INIT ---
  await loadUnits("length");
  loadArithmeticUnits("length");
});