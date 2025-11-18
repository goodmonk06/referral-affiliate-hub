'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { programsApi, partnersApi, referralLinksApi, Program, Partner } from '@/lib/api';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    contactEmail: '',
    payoutType: 'stripe',
    accountId: '',
  });
  const [showLinkForm, setShowLinkForm] = useState<string | null>(null);
  const [linkFormData, setLinkFormData] = useState({
    code: '',
    urlSlug: '',
  });

  useEffect(() => {
    loadData();
  }, [programId]);

  const loadData = async () => {
    try {
      const [programRes, partnersRes] = await Promise.all([
        programsApi.getOne(programId),
        partnersApi.getAll(programId),
      ]);
      setProgram(programRes.data);
      setPartners(partnersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await partnersApi.create({
        programId,
        name: partnerFormData.name,
        contactEmail: partnerFormData.contactEmail,
        payoutMethodJson: {
          type: partnerFormData.payoutType,
          accountId: partnerFormData.accountId,
        },
      });
      setShowPartnerForm(false);
      setPartnerFormData({ name: '', contactEmail: '', payoutType: 'stripe', accountId: '' });
      loadData();
    } catch (error) {
      console.error('Error creating partner:', error);
    }
  };

  const handleCreateLink = async (e: React.FormEvent, partnerId: string) => {
    e.preventDefault();
    try {
      await referralLinksApi.create({
        partnerId,
        code: linkFormData.code,
        urlSlug: linkFormData.urlSlug,
      });
      setShowLinkForm(null);
      setLinkFormData({ code: '', urlSlug: '' });
      loadData();
    } catch (error) {
      console.error('Error creating referral link:', error);
      alert('Error creating link. Code or slug may already exist.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Program not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/programs" className="text-blue-600 hover:text-blue-800">
          ← Back to Programs
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.name}</h1>
        <p className="text-gray-600 mb-4">Type: {program.type}</p>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Payout Configuration:</h3>
          <pre className="text-sm">{JSON.stringify(program.configJson, null, 2)}</pre>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Partners</h2>
        <button
          onClick={() => setShowPartnerForm(!showPartnerForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showPartnerForm ? 'Cancel' : 'Add Partner'}
        </button>
      </div>

      {showPartnerForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Partner</h3>
          <form onSubmit={handleCreatePartner} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={partnerFormData.name}
                onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={partnerFormData.contactEmail}
                onChange={(e) => setPartnerFormData({ ...partnerFormData, contactEmail: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payout Type</label>
              <select
                value={partnerFormData.payoutType}
                onChange={(e) => setPartnerFormData({ ...partnerFormData, payoutType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
              <input
                type="text"
                required
                value={partnerFormData.accountId}
                onChange={(e) => setPartnerFormData({ ...partnerFormData, accountId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Partner
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{partner.name}</h3>
                <p className="text-sm text-gray-600">{partner.contactEmail}</p>
              </div>
              <Link
                href={`/partners/${partner.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details →
              </Link>
            </div>
            <div className="flex gap-4 text-sm text-gray-500 mb-4">
              <span>{partner._count?.referralLinks || 0} links</span>
              <span>{partner._count?.conversionEvents || 0} conversions</span>
              <span>{partner._count?.payouts || 0} payouts</span>
            </div>

            {showLinkForm === partner.id ? (
              <form onSubmit={(e) => handleCreateLink(e, partner.id)} className="space-y-3 mt-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Code
                    </label>
                    <input
                      type="text"
                      required
                      value={linkFormData.code}
                      onChange={(e) => setLinkFormData({ ...linkFormData, code: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="ACME2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      required
                      value={linkFormData.urlSlug}
                      onChange={(e) => setLinkFormData({ ...linkFormData, urlSlug: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="acme-corp"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                  >
                    Create Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkForm(null)}
                    className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowLinkForm(partner.id)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Referral Link
              </button>
            )}
          </div>
        ))}
      </div>

      {partners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No partners yet. Add your first partner!</p>
        </div>
      )}
    </div>
  );
}
