# 101486489 COMP3133 Assignment 2 Frontend

This frontend is already wired to your uploaded Assignment 1 backend schema.

## Backend schema it expects
- `login(input: LoginInput!)`
- `signup(input: SignupInput!)`
- `getAllEmployees`
- `getEmployeeById(eid: ID!)`
- `searchEmployees(designation: String, department: String)`
- `addEmployee(input: EmployeeInput!, photoUrl: String)`
- `updateEmployeeById(eid: ID!, input: EmployeeUpdateInput!, photoUrl: String)`
- `deleteEmployeeById(eid: ID!)`

## Important mapping
The UI uses friendly labels, but the backend fields are:
- first name -> `first_name`
- last name -> `last_name`
- position -> `designation`
- hire date -> `date_of_joining`
- profile picture -> `employee_photo.url`

## Image upload
The form converts the selected image into a Base64 data URL and sends it as `photoUrl`.
That means this works with your current backend without adding multipart upload support.

## Local API URL
`src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  graphqlUrl: 'http://localhost:4000/graphql',
};
```
