import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/acknowledge - fetch current user's acknowledgements
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('azure_oid', session.user.azure_oid)
    .single();

  if (!employee) return NextResponse.json([]);

  const { data: acks, error } = await supabase
    .from('acknowledgements')
    .select('*')
    .eq('employee_id', employee.id)
    .order('acknowledged_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(acks || []);
}

// POST /api/acknowledge - save a new acknowledgement
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { policy_id, policy_version } = await req.json();

  if (!policy_id || !policy_version) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Get employee record
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id')
    .eq('azure_oid', session.user.azure_oid)
    .single();

  if (empError || !employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  // Check if already acknowledged
  const { data: existing } = await supabase
    .from('acknowledgements')
    .select('id')
    .eq('employee_id', employee.id)
    .eq('policy_id', policy_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already acknowledged' }, { status: 409 });
  }

  // Get IP and user agent
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Insert acknowledgement
  const { data, error } = await supabase
    .from('acknowledgements')
    .insert({
      employee_id: employee.id,
      policy_id,
      policy_version,
      ip_address: ip,
      user_agent: userAgent,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
