'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { programsApi, Program } from '@/lib/api';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'REFERRAL',
    percentage: '',
    fixedBounty: '',
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await programsApi.getAll();
      setPrograms(response.data);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const configJson: any = {};
      if (formData.percentage) {
        configJson.percentage = parseFloat(formData.percentage);
      }
      if (formData.fixedBounty) {
        configJson.fixedBounty = parseFloat(formData.fixedBounty);
      }

      await programsApi.create({
        name: formData.name,
        type: formData.type,
        configJson,
      });

      setShowCreateForm(false);
      setFormData({ name: '', type: 'REFERRAL', percentage: '', fixedBounty: '' });
      loadPrograms();
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Create Program'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Program</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="REFERRAL">Referral</option>
                <option value="AFFILIATE">Affiliate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percentage (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Bounty ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.fixedBounty}
                onChange={(e) => setFormData({ ...formData, fixedBounty: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <Link
            key={program.id}
            href={`/programs/${program.id}`}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {program.name}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Type: <span className="font-medium">{program.type}</span>
            </p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{program._count?.partners || 0} partners</span>
              <span>{program._count?.conversionEvents || 0} conversions</span>
            </div>
          </Link>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No programs yet. Create your first program!</p>
        </div>
      )}
    </div>
  );
}
