import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Program {
  id: string;
  name: string;
  type: 'REFERRAL' | 'AFFILIATE';
  configJson: any;
  createdAt: string;
  updatedAt: string;
  _count?: {
    partners: number;
    conversionEvents: number;
  };
}

export interface Partner {
  id: string;
  programId: string;
  name: string;
  contactEmail: string;
  payoutMethodJson: any;
  createdAt: string;
  updatedAt: string;
  program?: Program;
  _count?: {
    referralLinks: number;
    conversionEvents: number;
    payouts: number;
  };
}

export interface ReferralLink {
  id: string;
  partnerId: string;
  code: string;
  urlSlug: string;
  createdAt: string;
  partner?: Partner;
}

export interface Payout {
  id: string;
  partnerId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  partner?: Partner;
}

export const programsApi = {
  getAll: () => api.get<Program[]>('/programs'),
  getOne: (id: string) => api.get<Program>(`/programs/${id}`),
  create: (data: any) => api.post<Program>('/programs', data),
  update: (id: string, data: any) => api.patch<Program>(`/programs/${id}`, data),
  delete: (id: string) => api.delete(`/programs/${id}`),
};

export const partnersApi = {
  getAll: (programId?: string) =>
    api.get<Partner[]>('/partners', { params: { programId } }),
  getOne: (id: string) => api.get<Partner>(`/partners/${id}`),
  create: (data: any) => api.post<Partner>('/partners', data),
  update: (id: string, data: any) => api.patch<Partner>(`/partners/${id}`, data),
  delete: (id: string) => api.delete(`/partners/${id}`),
};

export const referralLinksApi = {
  getAll: (partnerId?: string) =>
    api.get<ReferralLink[]>('/referral-links', { params: { partnerId } }),
  create: (data: any) => api.post<ReferralLink>('/referral-links', data),
  delete: (id: string) => api.delete(`/referral-links/${id}`),
};

export const payoutsApi = {
  getAll: (partnerId?: string, status?: string) =>
    api.get<Payout[]>('/payouts', { params: { partnerId, status } }),
  getOne: (id: string) => api.get<Payout>(`/payouts/${id}`),
  calculate: (data: any) => api.post<Payout>('/payouts/calculate', data),
  update: (id: string, data: any) => api.patch<Payout>(`/payouts/${id}`, data),
};

export default api;
