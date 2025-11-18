// Domain Events - Typed events for the referral & affiliate system

export interface DomainEvent {
  type: string;
  timestamp: Date;
  aggregateId: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

// Program Events
export interface ProgramCreatedEvent extends DomainEvent {
  type: 'program.created';
  payload: {
    programId: string;
    name: string;
    type: 'REFERRAL' | 'AFFILIATE';
    campaignId?: string;
  };
}

export interface ProgramUpdatedEvent extends DomainEvent {
  type: 'program.updated';
  payload: {
    programId: string;
    changes: Record<string, any>;
  };
}

export interface ProgramStatusChangedEvent extends DomainEvent {
  type: 'program.status_changed';
  payload: {
    programId: string;
    oldStatus: string;
    newStatus: string;
  };
}

// Partner Events
export interface PartnerCreatedEvent extends DomainEvent {
  type: 'partner.created';
  payload: {
    partnerId: string;
    programId: string;
    name: string;
    contactEmail: string;
  };
}

export interface PartnerTierChangedEvent extends DomainEvent {
  type: 'partner.tier_changed';
  payload: {
    partnerId: string;
    oldTierId?: string;
    newTierId: string;
    tierName: string;
  };
}

export interface PartnerStatusChangedEvent extends DomainEvent {
  type: 'partner.status_changed';
  payload: {
    partnerId: string;
    oldStatus: string;
    newStatus: string;
  };
}

// Conversion Events
export interface ConversionRecordedEvent extends DomainEvent {
  type: 'conversion.recorded';
  payload: {
    conversionId: string;
    programId: string;
    partnerId: string;
    amount: number;
    currency: string;
    referredUserId?: string;
  };
}

export interface ConversionStatusChangedEvent extends DomainEvent {
  type: 'conversion.status_changed';
  payload: {
    conversionId: string;
    oldStatus: string;
    newStatus: string;
  };
}

// Payout Events
export interface PayoutCalculatedEvent extends DomainEvent {
  type: 'payout.calculated';
  payload: {
    payoutId: string;
    partnerId: string;
    amount: number;
    currency: string;
    periodStart: Date;
    periodEnd: Date;
  };
}

export interface PayoutStatusChangedEvent extends DomainEvent {
  type: 'payout.status_changed';
  payload: {
    payoutId: string;
    oldStatus: string;
    newStatus: string;
    transactionId?: string;
  };
}

// Referral Link Events
export interface ReferralLinkClickedEvent extends DomainEvent {
  type: 'referral_link.clicked';
  payload: {
    referralLinkId: string;
    code: string;
    ipAddress?: string;
    userAgent?: string;
    utmParams?: Record<string, string>;
  };
}

// Webhook Events
export interface WebhookDeliveryFailedEvent extends DomainEvent {
  type: 'webhook.delivery_failed';
  payload: {
    webhookId: string;
    deliveryId: string;
    eventType: string;
    attempts: number;
    errorMessage: string;
  };
}

// Campaign Events
export interface CampaignCreatedEvent extends DomainEvent {
  type: 'campaign.created';
  payload: {
    campaignId: string;
    name: string;
  };
}

export type AllDomainEvents =
  | ProgramCreatedEvent
  | ProgramUpdatedEvent
  | ProgramStatusChangedEvent
  | PartnerCreatedEvent
  | PartnerTierChangedEvent
  | PartnerStatusChangedEvent
  | ConversionRecordedEvent
  | ConversionStatusChangedEvent
  | PayoutCalculatedEvent
  | PayoutStatusChangedEvent
  | ReferralLinkClickedEvent
  | WebhookDeliveryFailedEvent
  | CampaignCreatedEvent;
