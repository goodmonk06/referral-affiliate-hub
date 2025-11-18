'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { partnersApi, payoutsApi, referralLinksApi, Partner, Payout, ReferralLink } from '@/lib/api';

export default function PartnerDetailPage() {
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutFormData, setPayoutFormData] = useState({
    periodStart: '',
    periodEnd: '',
  });

  useEffect(() => {
    loadData();
  }, [partnerId]);

  const loadData = async () => {
    try {
      const [partnerRes, payoutsRes, linksRes] = await Promise.all([
        partnersApi.getOne(partnerId),
        payoutsApi.getAll(partnerId),
        referralLinksApi.getAll(partnerId),
      ]);
      setPartner(partnerRes.data);
      setPayouts(payoutsRes.data);
      setReferralLinks(linksRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payoutsApi.calculate({
        partnerId,
        periodStart: payoutFormData.periodStart,
        periodEnd: payoutFormData.periodEnd,
      });
      setShowPayoutForm(false);
      setPayoutFormData({ periodStart: '', periodEnd: '' });
      loadData();
    } catch (error: any) {
      console.error('Error calculating payout:', error);
      alert(error.response?.data?.message || 'Error calculating payout');
    }
  };

  const handleUpdateStatus = async (payoutId: string, status: string) => {
    try {
      await payoutsApi.update(payoutId, { status });
      loadData();
    } catch (error) {
      console.error('Error updating payout:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Partner not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link
          href={`/programs/${partner.programId}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Program
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{partner.name}</h1>
        <p className="text-gray-600 mb-4">{partner.contactEmail}</p>
        {partner.program && (
          <p className="text-sm text-gray-500 mb-4">
            Program: <span className="font-medium">{partner.program.name}</span>
          </p>
        )}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-2xl font-bold text-gray-900">
              {partner._count?.referralLinks || 0}
            </p>
            <p className="text-sm text-gray-600">Referral Links</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-2xl font-bold text-gray-900">
              {partner._count?.conversionEvents || 0}
            </p>
            <p className="text-sm text-gray-600">Conversions</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-2xl font-bold text-gray-900">
              {partner._count?.payouts || 0}
            </p>
            <p className="text-sm text-gray-600">Payouts</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Referral Links</h2>
        {referralLinks.length > 0 ? (
          <div className="space-y-3">
            {referralLinks.map((link) => (
              <div key={link.id} className="border border-gray-200 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Code: {link.code}</p>
                    <p className="text-sm text-gray-600">Slug: {link.urlSlug}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    ?ref={link.code}
                  </p>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    /r/{link.urlSlug}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No referral links yet</p>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payouts</h2>
        <button
          onClick={() => setShowPayoutForm(!showPayoutForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showPayoutForm ? 'Cancel' : 'Calculate Payout'}
        </button>
      </div>

      {showPayoutForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-xl font-semibold mb-4">Calculate Payout for Period</h3>
          <form onSubmit={handleCalculatePayout} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period Start
                </label>
                <input
                  type="datetime-local"
                  required
                  value={payoutFormData.periodStart}
                  onChange={(e) =>
                    setPayoutFormData({ ...payoutFormData, periodStart: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period End
                </label>
                <input
                  type="datetime-local"
                  required
                  value={payoutFormData.periodEnd}
                  onChange={(e) =>
                    setPayoutFormData({ ...payoutFormData, periodEnd: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Calculate
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {payouts.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(payout.periodStart).toLocaleDateString()} -{' '}
                    {new Date(payout.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payout.currency} {payout.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        payout.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : payout.status === 'PROCESSING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : payout.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payout.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(payout.id, 'PROCESSING')}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Process
                      </button>
                    )}
                    {payout.status === 'PROCESSING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(payout.id, 'PAID')}
                          className="text-green-600 hover:text-green-800 mr-3"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(payout.id, 'FAILED')}
                          className="text-red-600 hover:text-red-800"
                        >
                          Mark Failed
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No payouts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
