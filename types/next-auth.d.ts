import { DefaultSession } from 'next-auth';
import { UserRole } from './index';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      azure_oid: string;
      department: string | null;
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User {
    id: string;
    role: UserRole;
    azure_oid: string;
    department: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    azure_oid: string;
    department: string | null;
    accessToken: string;
  }
}
