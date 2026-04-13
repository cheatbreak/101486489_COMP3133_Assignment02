import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeFormValue, RawEmployee, mapEmployee, toEmployeeInput } from '../models/employee.model';

const GET_EMPLOYEES = `
  query GetEmployees {
    getAllEmployees {
      success
      message
      employees {
        _id
        first_name
        last_name
        email
        gender
        designation
        salary
        date_of_joining
        department
        employee_photo {
          url
          public_id
        }
        created_at
        updated_at
      }
    }
  }
`;

const GET_EMPLOYEE = `
  query GetEmployee($eid: ID!) {
    getEmployeeById(eid: $eid) {
      success
      message
      employee {
        _id
        first_name
        last_name
        email
        gender
        designation
        salary
        date_of_joining
        department
        employee_photo {
          url
          public_id
        }
        created_at
        updated_at
      }
    }
  }
`;

const SEARCH_EMPLOYEES = `
  query SearchEmployees($designation: String, $department: String) {
    searchEmployees(designation: $designation, department: $department) {
      success
      message
      employees {
        _id
        first_name
        last_name
        email
        gender
        designation
        salary
        date_of_joining
        department
        employee_photo {
          url
          public_id
        }
        created_at
        updated_at
      }
    }
  }
`;

const CREATE_EMPLOYEE = `
  mutation AddEmployee($input: EmployeeInput!, $photoUrl: String) {
    addEmployee(input: $input, photoUrl: $photoUrl) {
      success
      message
      employee {
        _id
        first_name
        last_name
        email
        gender
        designation
        salary
        date_of_joining
        department
        employee_photo {
          url
          public_id
        }
        created_at
        updated_at
      }
    }
  }
`;

const UPDATE_EMPLOYEE = `
  mutation UpdateEmployee($eid: ID!, $input: EmployeeUpdateInput!, $photoUrl: String) {
    updateEmployeeById(eid: $eid, input: $input, photoUrl: $photoUrl) {
      success
      message
      employee {
        _id
        first_name
        last_name
        email
        gender
        designation
        salary
        date_of_joining
        department
        employee_photo {
          url
          public_id
        }
        created_at
        updated_at
      }
    }
  }
`;

const DELETE_EMPLOYEE = `
  mutation DeleteEmployee($eid: ID!) {
    deleteEmployeeById(eid: $eid) {
      success
      message
    }
  }
`;

interface EmployeesEnvelope {
  success: boolean;
  message: string;
  employees: RawEmployee[];
}

interface EmployeeEnvelope {
  success: boolean;
  message: string;
  employee: RawEmployee | null;
}

interface GenericEnvelope {
  success: boolean;
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);

  getEmployees(): Observable<Employee[]> {
    return this.post<{ getAllEmployees: EmployeesEnvelope }>(GET_EMPLOYEES).pipe(
      map((response) => {
        this.throwGraphQLErrors(response, 'Unable to load employees');
        return this.unwrapEmployees(response.data?.getAllEmployees, 'Unable to load employees');
      }),
    );
  }

  getEmployee(id: string): Observable<Employee> {
    return this.post<{ getEmployeeById: EmployeeEnvelope }>(GET_EMPLOYEE, { eid: id }).pipe(
      map((response) => {
        this.throwGraphQLErrors(response, 'Employee not found');
        return this.unwrapEmployee(response.data?.getEmployeeById, 'Employee not found');
      }),
    );
  }

  searchEmployees(filters: { department?: string; position?: string }): Observable<Employee[]> {
    const department = filters.department?.trim() || null;
    const designation = filters.position?.trim() || null;

    if (!department && !designation) {
      return this.getEmployees();
    }

    return this.post<{ searchEmployees: EmployeesEnvelope }>(SEARCH_EMPLOYEES, { department, designation }).pipe(
      map((response) => {
        this.throwGraphQLErrors(response, 'Unable to search employees');
        return this.unwrapEmployees(response.data?.searchEmployees, 'Unable to search employees');
      }),
    );
  }

  createEmployee(formValue: EmployeeFormValue): Observable<Employee> {
    return this.post<{ addEmployee: EmployeeEnvelope }>(CREATE_EMPLOYEE, {
      input: toEmployeeInput(formValue),
      photoUrl: formValue.profilePicture || null,
    }).pipe(
      map((response) => {
        this.throwGraphQLErrors(response, 'Unable to create employee');
        return this.unwrapEmployee(response.data?.addEmployee, 'Unable to create employee');
      }),
    );
  }

  updateEmployee(id: string, formValue: Partial<EmployeeFormValue>): Observable<Employee> {
    const input = {
      ...(formValue.firstName !== undefined ? { first_name: formValue.firstName.trim() } : {}),
      ...(formValue.lastName !== undefined ? { last_name: formValue.lastName.trim() } : {}),
      ...(formValue.email !== undefined ? { email: formValue.email.trim() } : {}),
      ...(formValue.gender !== undefined ? { gender: formValue.gender } : {}),
      ...(formValue.position !== undefined ? { designation: formValue.position.trim() } : {}),
      ...(formValue.salary !== undefined ? { salary: Number(formValue.salary) } : {}),
      ...(formValue.hireDate !== undefined ? { date_of_joining: formValue.hireDate } : {}),
      ...(formValue.department !== undefined ? { department: formValue.department.trim() } : {}),
    };

    return this.post<{ updateEmployeeById: EmployeeEnvelope }>(UPDATE_EMPLOYEE, {
      eid: id,
      input,
      photoUrl: formValue.profilePicture || null,
    }).pipe(
      map((response) => {
        this.throwGraphQLErrors(response, 'Unable to update employee');
        return this.unwrapEmployee(response.data?.updateEmployeeById, 'Unable to update employee');
      }),
    );
  }

  deleteEmployee(id: string): Observable<string> {
    return this.post<{ deleteEmployeeById: GenericEnvelope }>(DELETE_EMPLOYEE, { eid: id }).pipe(
      map((response) => {
        this.throwGraphQLErrors(response, 'Unable to delete employee');
        const payload = response.data?.deleteEmployeeById;

        if (!payload?.success) {
          throw new Error(payload?.message || 'Unable to delete employee');
        }

        return id;
      }),
    );
  }

  private post<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Observable<GraphQLResponse<T>> {
    return this.http.post<GraphQLResponse<T>>(
      environment.graphqlUrl,
      { query, variables },
      { headers: this.buildHeaders() },
    );
  }

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private throwGraphQLErrors(response: GraphQLResponse<unknown>, fallbackMessage: string): void {
    if (response.errors?.length) {
      throw new Error(response.errors.map((error) => error.message).join(', '));
    }

    if (!response.data) {
      throw new Error(fallbackMessage);
    }
  }

  private unwrapEmployees(payload: EmployeesEnvelope | undefined, fallbackMessage: string): Employee[] {
    if (!payload) {
      throw new Error(fallbackMessage);
    }

    if (!payload.success) {
      throw new Error(payload.message || fallbackMessage);
    }

    return (payload.employees || []).map(mapEmployee);
  }

  private unwrapEmployee(payload: EmployeeEnvelope | undefined, fallbackMessage: string): Employee {
    if (!payload) {
      throw new Error(fallbackMessage);
    }

    if (!payload.success || !payload.employee) {
      throw new Error(payload.message || fallbackMessage);
    }

    return mapEmployee(payload.employee);
  }
}