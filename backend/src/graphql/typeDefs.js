const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    created_at: String
    updated_at: String
  }

  type EmployeePhoto {
    url: String
    public_id: String
  }

  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: EmployeePhoto
    created_at: String
    updated_at: String
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  type GenericResponse {
    success: Boolean!
    message: String!
  }

  type EmployeeResponse {
    success: Boolean!
    message: String!
    employee: Employee
  }

  type EmployeesResponse {
    success: Boolean!
    message: String!
    employees: [Employee!]!
  }

  input SignupInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    usernameOrEmail: String!
    password: String!
  }

  input EmployeeInput {
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
  }

  input EmployeeUpdateInput {
    first_name: String
    last_name: String
    email: String
    gender: String
    designation: String
    salary: Float
    date_of_joining: String
    department: String
  }

  type Query {
    login(input: LoginInput!): AuthPayload!
    getAllEmployees: EmployeesResponse!
    getEmployeeById(eid: ID!): EmployeeResponse!
    searchEmployees(designation: String, department: String): EmployeesResponse!
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!

    addEmployee(input: EmployeeInput!, photoUrl: String): EmployeeResponse!
    updateEmployeeById(eid: ID!, input: EmployeeUpdateInput!, photoUrl: String): EmployeeResponse!

    deleteEmployeeById(eid: ID!): GenericResponse!
  }
`;