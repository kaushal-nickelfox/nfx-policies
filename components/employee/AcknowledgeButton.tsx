'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { acknowledgeSchema, type AcknowledgeFormData } from '@/lib/validations/acknowledgeSchema';
import { CheckCircle } from 'lucide-react';

interface AcknowledgeButtonProps {
  policyId: string;
  policyVersion: string;
  policyTitle: string;
  onAcknowledged: () => void;
}

export default function AcknowledgeButton({
  policyId,
  policyVersion,
  policyTitle,
  onAcknowledged,
}: AcknowledgeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AcknowledgeFormData>({
    resolver: zodResolver(acknowledgeSchema),
    defaultValues: {
      policy_id: policyId,
      policy_version: policyVersion,
    },
  });

  const onSubmit = async (_data: AcknowledgeFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy_id: policyId, policy_version: policyVersion }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to acknowledge');
      }

      reset();
      setIsOpen(false);
      onAcknowledged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)}>
        <CheckCircle className="h-3.5 w-3.5" />
        Acknowledge
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Acknowledge Policy">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-slate-600">
            You are about to acknowledge that you have read and understood:
          </p>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="font-medium text-blue-900">{policyTitle}</p>
            <p className="text-sm text-blue-700">Version {policyVersion}</p>
          </div>

          <input type="hidden" {...register('policy_id')} />
          <input type="hidden" {...register('policy_version')} />

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('confirmed')}
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
            />
            <span className="text-sm text-slate-700">
              I confirm that I have read and understood the above policy in full.
            </span>
          </label>
          {errors.confirmed && (
            <p className="text-sm text-red-600">{errors.confirmed.message}</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Confirm Acknowledgement
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
