import { z } from 'zod';

export const policySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  category: z.enum(['Attendance', 'Behavior', 'Remote Work', 'Security', 'General']),
  description: z.string().optional(),
  document_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  document_type: z.enum(['pdf', 'docx']),
  version: z.string().min(1, 'Version is required').default('1.0'),
  is_active: z.boolean().default(true),
  requires_acknowledgement: z.boolean().default(true),
  effective_date: z.string().optional(),
  expiry_date: z.string().optional(),
  assigned_to: z.enum(['all', 'department']).default('all'),
  assigned_departments: z.array(z.string()).optional(),
});

export type PolicyFormData = z.infer<typeof policySchema>;
