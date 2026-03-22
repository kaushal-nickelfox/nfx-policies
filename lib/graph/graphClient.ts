import { Client } from '@microsoft/microsoft-graph-client';
import type { MicrosoftProfile } from '@/types/index';

function getAppOnlyClient(): Client {
  return Client.init({
    authProvider: async (done) => {
      try {
        const tokenEndpoint = `https://login.microsoftonline.com/${process.env.MICROSOFT_GRAPH_TENANT_ID}/oauth2/v2.0/token`;

        const params = new URLSearchParams({
          client_id: process.env.MICROSOFT_GRAPH_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_GRAPH_CLIENT_SECRET!,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        });

        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        const data = await response.json();
        done(null, data.access_token);
      } catch (error) {
        done(error as Error, null);
      }
    },
  });
}

function getDelegatedClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

export async function getDocumentStream(fileUrl: string): Promise<Buffer> {
  // Convert SharePoint/OneDrive sharing URL to Graph API download URL
  const client = getAppOnlyClient();

  // Encode the sharing URL
  const encodedUrl = Buffer.from(fileUrl).toString('base64');
  const shareId = `u!${encodedUrl.replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-')}`;

  try {
    const response = await client.api(`/shares/${shareId}/driveItem/content`).getStream();

    const chunks: Buffer[] = [];
    for await (const chunk of response) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch (error) {
    // Fallback: try direct download
    const downloadResponse = await fetch(fileUrl);
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download document: ${downloadResponse.statusText}`);
    }
    const arrayBuffer = await downloadResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export async function getUserProfile(accessToken: string): Promise<MicrosoftProfile> {
  const client = getDelegatedClient(accessToken);

  const profile = await client
    .api('/me')
    .select('id,displayName,mail,department,jobTitle')
    .get();

  return {
    id: profile.id,
    displayName: profile.displayName,
    mail: profile.mail,
    department: profile.department || null,
    jobTitle: profile.jobTitle || null,
  };
}

export async function getUserPhoto(accessToken: string): Promise<string | null> {
  try {
    const client = getDelegatedClient(accessToken);
    const photoBuffer = await client.api('/me/photo/$value').get();

    if (!photoBuffer) return null;

    const base64 = Buffer.from(photoBuffer).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}
