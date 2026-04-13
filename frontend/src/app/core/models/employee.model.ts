export interface RawEmployee {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo?: {
    url?: string | null;
    public_id?: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  profilePicture?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeFormValue {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  profilePicture?: string | null;
}

export function mapEmployee(raw: RawEmployee): Employee {
  return {
    id: raw._id,
    firstName: raw.first_name,
    lastName: raw.last_name,
    email: raw.email,
    gender: raw.gender,
    position: raw.designation,
    department: raw.department,
    salary: raw.salary,
    hireDate: raw.date_of_joining,
    profilePicture: raw.employee_photo?.url ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function toEmployeeInput(formValue: EmployeeFormValue) {
  return {
    first_name: formValue.firstName.trim(),
    last_name: formValue.lastName.trim(),
    email: formValue.email.trim(),
    gender: formValue.gender,
    designation: formValue.position.trim(),
    salary: Number(formValue.salary),
    date_of_joining: formValue.hireDate,
    department: formValue.department.trim(),
  };
}
