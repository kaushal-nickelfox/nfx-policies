import { Client, ResponseType } from '@microsoft/microsoft-graph-client';

/** Build a Graph client using the signed-in user's delegated access token */
function getDelegatedClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
}

function getShareId(url: string): string {
  const encodedUrl = Buffer.from(url).toString('base64');
  return `u!${encodedUrl.replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-')}`;
}

// Module-level cache — avoids re-fetching folder info on every request within the same warm instance
let cachedDriveId: string | null = null;
let cachedFolderId: string | null = null;

async function getFolderInfo(client: Client): Promise<{ driveId: string; folderId: string }> {
  if (cachedDriveId && cachedFolderId) {
    return { driveId: cachedDriveId, folderId: cachedFolderId };
  }
  const shareId = getShareId(process.env.ONEDRIVE_LINK!);
  const folder = await client.api(`/shares/${shareId}/driveItem`).get();
  cachedDriveId = folder.parentReference.driveId as string;
  cachedFolderId = folder.id as string;
  return { driveId: cachedDriveId, folderId: cachedFolderId };
}

function extensionToDocType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx' || ext === 'doc') return 'docx';
  return ext || 'pdf';
}

export interface OneDrivePolicy {
  id: string;
  title: string;
  file_name: string;
  storage_path: string;
  document_type: string;
  is_active: boolean;
  requires_acknowledgement: boolean;
  assigned_to: string;
  assigned_departments: null;
  created_at: string;
  updated_at: string;
  description: string | null;
  category: string | null;
  version: string;
}

function itemToPolicy(item: Record<string, unknown>, driveId: string): OneDrivePolicy {
  const name = item.name as string;
  return {
    id: item.id as string,
    title: name.replace(/\.[^.]+$/, ''),
    file_name: name,
    storage_path: `${driveId}/${item.id}`,
    document_type: extensionToDocType(name),
    is_active: true,
    requires_acknowledgement: true,
    assigned_to: 'all',
    assigned_departments: null,
    created_at: item.createdDateTime as string,
    updated_at: item.lastModifiedDateTime as string,
    description: null,
    category: null,
    version: '1.0',
  };
}

/** List all policy files from the OneDrive folder. */
export async function listPoliciesFromOneDrive(accessToken: string): Promise<OneDrivePolicy[]> {
  const client = getDelegatedClient(accessToken);
  const { driveId, folderId } = await getFolderInfo(client);

  const result = await client
    .api(`/drives/${driveId}/items/${folderId}/children`)
    .select('id,name,createdDateTime,lastModifiedDateTime,file')
    .get();

  const items: Record<string, unknown>[] = (result.value ?? []).filter(
    (item: Record<string, unknown>) => item.file
  );

  return items.map((item) => itemToPolicy(item, driveId));
}

/** Get a single policy file by OneDrive item ID. */
export async function getPolicyFromOneDrive(
  itemId: string,
  accessToken: string
): Promise<OneDrivePolicy> {
  const client = getDelegatedClient(accessToken);
  const { driveId } = await getFolderInfo(client);

  const item = await client
    .api(`/drives/${driveId}/items/${itemId}`)
    .select('id,name,createdDateTime,lastModifiedDateTime,file')
    .get();

  return itemToPolicy(item as Record<string, unknown>, driveId);
}

/** Upload a policy document to the OneDrive folder. Returns "driveId/itemId" as storagePath. */
export async function uploadPolicyDocument(
  file: Buffer,
  fileName: string,
  contentType: string,
  accessToken: string
): Promise<{ storagePath: string; itemId: string }> {
  const client = getDelegatedClient(accessToken);
  const { driveId, folderId } = await getFolderInfo(client);

  const uniqueName = `${Date.now()}-${fileName}`;
  const uploadedItem = await client
    .api(`/drives/${driveId}/items/${folderId}:/${uniqueName}:/content`)
    .header('Content-Type', contentType)
    .put(file);

  return {
    storagePath: `${driveId}/${uploadedItem.id}`,
    itemId: uploadedItem.id as string,
  };
}

/** Get a temporary download URL for a OneDrive file. */
export async function getSignedDownloadUrl(
  storagePath: string,
  accessToken: string
): Promise<string> {
  const client = getDelegatedClient(accessToken);
  const slashIdx = storagePath.indexOf('/');
  const driveId = storagePath.slice(0, slashIdx);
  const itemId = storagePath.slice(slashIdx + 1);

  const item = await client
    .api(`/drives/${driveId}/items/${itemId}`)
    .select('@microsoft.graph.downloadUrl')
    .get();

  const downloadUrl = item['@microsoft.graph.downloadUrl'] as string | undefined;
  if (!downloadUrl) throw new Error('Could not get download URL from OneDrive');
  return downloadUrl;
}

/**
 * Download file bytes from a SharePoint/OneDrive sharing URL via Graph API.
 * Works for "Anyone with the link" sharing URLs stored in document_url.
 */
export async function downloadFromSharingUrl(
  sharingUrl: string,
  accessToken: string
): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  const client = getDelegatedClient(accessToken);
  const shareId = getShareId(sharingUrl);

  // Get the driveItem metadata to read the MIME type
  const item = await client.api(`/shares/${shareId}/driveItem`).select('name,file').get();

  const mimeType = (item?.file?.mimeType as string) || 'application/pdf';

  // Download the raw file bytes
  const buffer = await client
    .api(`/shares/${shareId}/driveItem/content`)
    .responseType(ResponseType.ARRAYBUFFER)
    .get();

  return { buffer, mimeType };
}

/** Delete a file from OneDrive. */
export async function deletePolicyDocument(
  storagePath: string,
  accessToken: string
): Promise<void> {
  const client = getDelegatedClient(accessToken);
  const slashIdx = storagePath.indexOf('/');
  const driveId = storagePath.slice(0, slashIdx);
  const itemId = storagePath.slice(slashIdx + 1);
  await client.api(`/drives/${driveId}/items/${itemId}`).delete();
}
