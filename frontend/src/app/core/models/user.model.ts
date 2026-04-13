export interface RawUser {
  _id: string;
  username: string;
  email: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthPayload {
  success: boolean;
  message: string;
  token: string | null;
  user: User | null;
}

export function mapUser(raw: RawUser | null | undefined): User | null {
  if (!raw) return null;

  return {
    id: raw._id,
    username: raw.username,
    email: raw.email,
  };
}
