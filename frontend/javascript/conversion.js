async function convertValue(value, from, to) {

 if(from===to){
  return parseFloat(value.toFixed(6))
 }
 console.log("Trying conversion:", from, "->", to);
 const conversion = await getConversion(from,to);

 if(!conversion) throw new Error(`Conversion missing: ${from} -> ${to}`);

 return applyConversion(value,conversion);
}



function applyConversion(value, convObj) {
  // ❌ Invalid number check
  if (isNaN(value)) {
    throw new Error("Invalid number");
  }

  // ✅ Same unit case (if convObj is missing)
  if (!convObj) {
    return value;
  }

  let result;

  // ✅ Factor-based conversion (only if factor is a number)
  if (typeof convObj.factor === "number") {
    result = value * convObj.factor;
  } 
  // ✅ Formula-based conversion
  else if (convObj.formula) {
    try {
      // Replace all instances of "x" with the input value
      const expr = convObj.formula.replaceAll("x", value);
      result = eval(expr);
    } catch (err) {
      throw new Error("Bad formula");
    }
  } 
  // ❌ Neither factor nor formula available
  else {
    throw new Error("Invalid conversion data");
  }

  // ❌ Final check: ensure result is a valid number
  if (isNaN(result)) {
    throw new Error("Conversion resulted in NaN");
  }

  // ✅ Round to 6 decimal places
  return parseFloat(result.toFixed(6));
}