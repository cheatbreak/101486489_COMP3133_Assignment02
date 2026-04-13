import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthPayload, RawUser, User, mapUser } from '../models/user.model';

const LOGIN_QUERY = `
  query Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

const SIGNUP_MUTATION = `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      success
      message
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

interface RawAuthPayload {
  success: boolean;
  message: string;
  token: string | null;
  user: RawUser | null;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(this.getStoredUser());

  login(usernameOrEmail: string, password: string): Observable<AuthPayload> {
    return this.post<{ login: RawAuthPayload }>(
      LOGIN_QUERY,
      {
        input: { usernameOrEmail, password },
      },
      false,
    ).pipe(
      map((response) => {
        this.throwGraphQLErrors(response, 'Login failed');
        return this.normalizePayload(response.data?.login, 'Login failed');
      }),
      tap((payload) => this.setSession(payload)),
    );
  }

  signup(username: string, email: string, password: string): Observable<AuthPayload> {
    return this.post<{ signup: RawAuthPayload }>(
      SIGNUP_MUTATION,
      {
        input: { username, email, password },
      },
      false,
    ).pipe(
      map((response) => {
        this.throwGraphQLErrors(response, 'Signup failed');
        return this.normalizePayload(response.data?.signup, 'Signup failed');
      }),
      tap((payload) => this.setSession(payload)),
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    void this.router.navigate(['/login']);
  }

  private post<T>(
    query: string,
    variables?: Record<string, unknown>,
    withAuth = true,
  ): Observable<GraphQLResponse<T>> {
    return this.http.post<GraphQLResponse<T>>(
      environment.graphqlUrl,
      { query, variables },
      { headers: this.buildHeaders(withAuth) },
    );
  }

  private buildHeaders(withAuth: boolean): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (withAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
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

  private normalizePayload(raw: RawAuthPayload | undefined, fallbackMessage: string): AuthPayload {
    if (!raw) {
      throw new Error(fallbackMessage);
    }

    const payload: AuthPayload = {
      success: raw.success,
      message: raw.message,
      token: raw.token,
      user: mapUser(raw.user),
    };

    if (!payload.success || !payload.token || !payload.user) {
      throw new Error(payload.message || fallbackMessage);
    }

    return payload;
  }

  private setSession(payload: AuthPayload): void {
    if (!payload.token || !payload.user) return;

    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    this.currentUser.set(payload.user);
  }

  private getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? (JSON.parse(user) as User) : null;
  }
}