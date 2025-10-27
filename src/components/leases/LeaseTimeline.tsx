/**
 * Timeline visuelle de progression d'un bail
 * Affiche les étapes : Créé → Signé → Payé → Actif
 */

import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaseTimelineProps {
  status: 'draft' | 'awaiting_signature' | 'signed' | 'paid' | 'active' | 'cancelled';
  createdAt: string;
  signedAt?: string | null;
  paidAt?: string | null;
  activeAt?: string | null;
  cancelledAt?: string | null;
}

interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'cancelled';
  date?: string | null;
}

export function LeaseTimeline({
  status,
  createdAt,
  signedAt,
  paidAt,
  activeAt,
  cancelledAt,
}: LeaseTimelineProps) {
  const steps: TimelineStep[] = [
    {
      id: 'created',
      label: 'Bail créé',
      status: 'completed',
      date: createdAt,
    },
    {
      id: 'signed',
      label: 'Signé électroniquement',
      status:
        status === 'cancelled'
          ? 'cancelled'
          : signedAt
          ? 'completed'
          : status === 'awaiting_signature'
          ? 'current'
          : 'pending',
      date: signedAt,
    },
    {
      id: 'paid',
      label: 'Paiement effectué',
      status:
        status === 'cancelled'
          ? 'cancelled'
          : paidAt
          ? 'completed'
          : status === 'paid' || status === 'active'
          ? 'current'
          : 'pending',
      date: paidAt,
    },
    {
      id: 'active',
      label: 'Bail actif',
      status:
        status === 'cancelled'
          ? 'cancelled'
          : activeAt
          ? 'completed'
          : status === 'active'
          ? 'current'
          : 'pending',
      date: activeAt,
    },
  ];

  const getIcon = (stepStatus: TimelineStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'current':
        return <Clock className="h-6 w-6 text-blue-600 animate-pulse" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  const getLineColor = (stepStatus: TimelineStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-600';
      case 'current':
        return 'bg-blue-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-300';
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Line connector */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'absolute left-3 top-10 h-12 w-0.5',
                getLineColor(step.status)
              )}
            />
          )}

          {/* Step */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">{getIcon(step.status)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-semibold',
                  step.status === 'completed' && 'text-green-700',
                  step.status === 'current' && 'text-blue-700',
                  step.status === 'cancelled' && 'text-red-700',
                  step.status === 'pending' && 'text-gray-500'
                )}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(step.date)}
                </p>
              )}
              {step.status === 'current' && (
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  En cours...
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Cancelled status */}
      {status === 'cancelled' && cancelledAt && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Bail annulé</p>
              <p className="text-sm text-red-700 mt-1">
                {formatDate(cancelledAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

