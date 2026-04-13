const validator = require("validator");

function requireField(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`${fieldName} is required`);
  }
}

function validateEmail(email) {
  if (!validator.isEmail(email || "")) throw new Error("Invalid email format");
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
}

function validateGender(gender) {
  const allowed = ["Male", "Female", "Other"];
  if (!allowed.includes(gender)) throw new Error("Gender must be Male/Female/Other");
}

function validateSalary(salary) {
  if (salary < 1000) throw new Error("Salary must be >= 1000");
}

function validateDateISO(dateStr) {
  if (!validator.isISO8601(dateStr || "")) {
    throw new Error("date_of_joining must be ISO8601 string (e.g. 2026-02-01)");
  }
}

module.exports = {
  requireField,
  validateEmail,
  validatePassword,
  validateGender,
  validateSalary,
  validateDateISO,
};