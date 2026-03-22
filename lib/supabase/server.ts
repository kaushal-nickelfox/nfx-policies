import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-side client using service role key (bypasses RLS)
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

const BUCKET = 'policy-documents';

/** Upload a policy document to Supabase Storage. Returns the storage path. */
export async function uploadPolicyDocument(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ storagePath: string }> {
  const supabase = createServiceClient();
  const storagePath = `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return { storagePath };
}

/** Generate a 1-hour signed URL for an uploaded policy document. */
export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error || !data?.signedUrl) throw new Error(`Signed URL failed: ${error?.message}`);
  return data.signedUrl;
}

/** Delete a document from Supabase Storage. */
export async function deletePolicyDocument(storagePath: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
