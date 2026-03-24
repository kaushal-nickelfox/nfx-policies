export type UserRole = 'employee' | 'admin';
export type DocumentType = 'pdf' | 'docx';
export type PolicyCategory = 'Attendance' | 'Behavior' | 'Remote Work' | 'Security' | 'General';

export interface Employee {
  id: string;
  azure_oid: string;
  email: string;
  name: string;
  department: string | null;
  job_title: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Policy {
  id: string;
  title: string;
  category: PolicyCategory;
  description: string | null;
  document_url: string | null;
  document_type: DocumentType;
  version: string;
  is_active: boolean;
  requires_acknowledgement: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Acknowledgement {
  id: string;
  employee_id: string;
  policy_id: string;
  policy_version: string;
  acknowledged_at: string;
}

export interface PolicyWithStatus extends Policy {
  is_acknowledged: boolean;
  acknowledged_at: string | null;
}

export interface EmployeeWithStats extends Employee {
  acks_count: number;
  total_policies: number;
  completion_percent: number;
  acknowledgements: Acknowledgement[];
}

// NextAuth session extension
export interface ExtendedSession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: UserRole;
    azure_oid: string;
    department: string | null;
  };
  accessToken: string;
}

export interface MicrosoftProfile {
  id: string;
  displayName: string;
  mail: string;
  department: string | null;
  jobTitle: string | null;
}

export interface AdminStats {
  total_employees: number;
  total_policies: number;
  total_acknowledgements: number;
  overall_completion_percent: number;
  policy_completion: PolicyCompletion[];
  dept_completion: DeptCompletion[];
}

export interface PolicyCompletion {
  policy_id: string;
  policy_title: string;
  ack_count: number;
  total_employees: number;
  completion_percent: number;
}

export interface DeptCompletion {
  department: string;
  ack_count: number;
  total_policies: number;
  completion_percent: number;
}

export interface RecentActivity {
  employee_name: string;
  employee_email: string;
  policy_title: string;
  acknowledged_at: string;
}
