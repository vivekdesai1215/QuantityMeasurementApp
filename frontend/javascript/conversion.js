async function convertValue(value, from, to) {

  // ✅ same unit shortcut
  if (from === to) {
    return parseFloat(value.toFixed(6));
  }

  // ✅ fetch conversion object
  const conversion = await getConversion(from, to);

  // ✅ apply conversion logic
  return applyConversion(value, conversion);
}



function applyConversion(value, convObj) {

  // ❌ invalid number check
  if (isNaN(value)) {
    throw new Error("Invalid number");
  }

  // ✅ same unit case (handled before calling ideally)
  if (!convObj) {
    return value;
  }

  // ✅ factor-based conversion
  if (convObj.factor !== null) {
    return parseFloat((value * convObj.factor).toFixed(6));
  }

  // ✅ formula-based conversion
  if (convObj.formula) {
    try {
      const expr = convObj.formula.replace("x", value);
      const result = eval(expr);

      return parseFloat(result.toFixed(6));
    } catch (err) {
      throw new Error("Bad formula");
    }
  }

  throw new Error("Invalid conversion data");
}