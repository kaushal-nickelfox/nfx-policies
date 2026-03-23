import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { createServiceClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/graph/graphClient';
import type { UserRole } from '@/types/index';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      try {
        const supabase = createServiceClient();
        const accessToken = account.access_token as string;

        // Get Microsoft profile
        let profile = null;
        try {
          profile = await getUserProfile(accessToken);
        } catch (e) {
          console.error('Failed to fetch MS profile:', e);
        }

        const azureOid = account.providerAccountId;

        // Check if employee already exists
        const { data: existingEmployee } = await supabase
          .from('employees')
          .select('id, role')
          .eq('azure_oid', azureOid)
          .single();

        if (existingEmployee) {
          // Update existing employee
          await supabase
            .from('employees')
            .update({
              email: user.email,
              name: profile?.displayName || user.name || user.email,
              department: profile?.department || null,
              job_title: profile?.jobTitle || null,
              avatar_url: user.image || null,
              updated_at: new Date().toISOString(),
            })
            .eq('azure_oid', azureOid);
        } else {
          // Create new employee
          await supabase.from('employees').insert({
            azure_oid: azureOid,
            email: user.email,
            name: profile?.displayName || user.name || user.email,
            department: profile?.department || null,
            job_title: profile?.jobTitle || null,
            avatar_url: user.image || null,
            role: 'employee',
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },

    async jwt({ token, account, user }) {
      if (account && user) {
        token.azure_oid = account.providerAccountId;
        token.accessToken = account.access_token as string;
      }

      // Always re-fetch role from Supabase so DB changes take effect immediately
      if (token.azure_oid) {
        try {
          const supabase = createServiceClient();
          const { data: employee } = await supabase
            .from('employees')
            .select('role, department')
            .eq('azure_oid', token.azure_oid as string)
            .single();

          token.role = (employee?.role as UserRole) || 'employee';
          token.department = employee?.department || null;
        } catch {
          token.role = (token.role as UserRole) || 'employee';
          token.department = token.department || null;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;
        session.user.azure_oid = token.azure_oid as string;
        session.user.department = token.department as string | null;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
