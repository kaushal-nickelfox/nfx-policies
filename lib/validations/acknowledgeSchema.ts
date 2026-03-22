import { z } from 'zod';

export const acknowledgeSchema = z.object({
  policy_id: z.string().uuid('Invalid policy ID'),
  policy_version: z.string().min(1, 'Version is required'),
  confirmed: z.literal(true, 'You must confirm you have read the policy'),
});

export type AcknowledgeFormData = z.infer<typeof acknowledgeSchema>;
