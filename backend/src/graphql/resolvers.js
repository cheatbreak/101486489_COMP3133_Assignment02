const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Employee = require("../models/Employee");
const authGuard = require("../middleware/auth");
const {
  requireField,
  validateEmail,
  validatePassword,
  validateGender,
  validateSalary,
  validateDateISO,
} = require("../utils/validators");

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function toIsoString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

module.exports = {
  Employee: {
    date_of_joining: (employee) => toIsoString(employee.date_of_joining),
    created_at: (employee) => toIsoString(employee.created_at),
    updated_at: (employee) => toIsoString(employee.updated_at),
  },

  Query: {
    login: async (_, { input }) => {
      try {
        requireField(input.usernameOrEmail, "usernameOrEmail");
        requireField(input.password, "password");

        const user = await User.findOne({
          $or: [{ username: input.usernameOrEmail }, { email: input.usernameOrEmail }],
        });

        if (!user) return { success: false, message: "Invalid credentials", token: null, user: null };

        const ok = await bcrypt.compare(input.password, user.password);
        if (!ok) return { success: false, message: "Invalid credentials", token: null, user: null };

        const token = signToken(user);
        return { success: true, message: "Login successful", token, user };
      } catch (err) {
        return { success: false, message: err.message, token: null, user: null };
      }
    },

    getAllEmployees: async (_, __, context) => {
      try {
        authGuard(context);
        const employees = await Employee.find().sort({ created_at: -1 });
        return { success: true, message: "Employees fetched", employees };
      } catch (err) {
        return { success: false, message: err.message, employees: [] };
      }
    },

    getEmployeeById: async (_, { eid }, context) => {
      try {
        authGuard(context);
        const employee = await Employee.findById(eid);
        if (!employee) return { success: false, message: "Employee not found", employee: null };
        return { success: true, message: "Employee fetched", employee };
      } catch (err) {
        return { success: false, message: err.message, employee: null };
      }
    },

    searchEmployees: async (_, { designation, department }, context) => {
      try {
        authGuard(context);

        if (!designation && !department) {
          return { success: false, message: "Provide designation or department", employees: [] };
        }

        const filter = {};
        if (designation) filter.designation = designation;
        if (department) filter.department = department;

        const employees = await Employee.find(filter).sort({ created_at: -1 });
        return { success: true, message: "Search results", employees };
      } catch (err) {
        return { success: false, message: err.message, employees: [] };
      }
    },
  },

  Mutation: {
    signup: async (_, { input }) => {
      try {
        requireField(input.username, "username");
        requireField(input.email, "email");
        requireField(input.password, "password");

        validateEmail(input.email);
        validatePassword(input.password);

        const existing = await User.findOne({
          $or: [{ username: input.username }, { email: input.email }],
        });

        if (existing) {
          return { success: false, message: "Username or email already exists", token: null, user: null };
        }

        const hashed = await bcrypt.hash(input.password, 10);
        const user = await User.create({
          username: input.username,
          email: input.email,
          password: hashed,
        });

        const token = signToken(user);
        return { success: true, message: "Signup successful", token, user };
      } catch (err) {
        return { success: false, message: err.message, token: null, user: null };
      }
    },

    addEmployee: async (_, { input, photoUrl }, context) => {
      try {
        authGuard(context);

        requireField(input.first_name, "first_name");
        requireField(input.last_name, "last_name");
        requireField(input.email, "email");
        requireField(input.gender, "gender");
        requireField(input.designation, "designation");
        requireField(input.salary, "salary");
        requireField(input.date_of_joining, "date_of_joining");
        requireField(input.department, "department");

        validateEmail(input.email);
        validateGender(input.gender);
        validateSalary(input.salary);
        validateDateISO(input.date_of_joining);

        const existing = await Employee.findOne({ email: input.email });
        if (existing) return { success: false, message: "Employee email already exists", employee: null };

        const employee = await Employee.create({
          ...input,
          date_of_joining: new Date(input.date_of_joining),
          employee_photo: { url: photoUrl || "", public_id: "" },
        });

        return { success: true, message: "Employee created", employee };
      } catch (err) {
        return { success: false, message: err.message, employee: null };
      }
    },

    updateEmployeeById: async (_, { eid, input, photoUrl }, context) => {
      try {
        authGuard(context);

        if (input.email) validateEmail(input.email);
        if (input.gender) validateGender(input.gender);
        if (input.salary !== undefined) validateSalary(input.salary);
        if (input.date_of_joining) validateDateISO(input.date_of_joining);

        const employee = await Employee.findById(eid);
        if (!employee) return { success: false, message: "Employee not found", employee: null };

        if (input.email && input.email !== employee.email) {
          const exists = await Employee.findOne({ email: input.email });
          if (exists) return { success: false, message: "Email already in use", employee: null };
        }

        Object.keys(input).forEach((k) => {
          employee[k] = k === "date_of_joining" ? new Date(input[k]) : input[k];
        });

        if (photoUrl) {
          employee.employee_photo = { url: photoUrl, public_id: "" };
        }

        await employee.save();
        return { success: true, message: "Employee updated", employee };
      } catch (err) {
        return { success: false, message: err.message, employee: null };
      }
    },

    deleteEmployeeById: async (_, { eid }, context) => {
      try {
        authGuard(context);

        const employee = await Employee.findById(eid);
        if (!employee) return { success: false, message: "Employee not found" };

        await Employee.deleteOne({ _id: eid });
        return { success: true, message: "Employee deleted" };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
  },
};