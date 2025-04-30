import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateSpaceModal from '../../components/spaces/CreateSpaceModal';

export default function Spaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await axios.get('/spaces');
      setSpaces(response.data);
    } catch (err) {
      setError('Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async (spaceData) => {
    try {
      const response = await axios.post('/spaces', spaceData);
      setSpaces([...spaces, response.data]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setError('Failed to create space');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse">Loading spaces...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Spaces</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Space
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Link
              key={space.id}
              to={`/spaces/${space.id}`}
              className="block hover:shadow-md transition-shadow"
            >
              <div className="card hover:border-primary-500 border-2 border-transparent">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {space.name}
                </h2>
                <div className="text-sm text-gray-500">
                  {space.memberCount} members • {space.meetingCount} meetings
                </div>
              </div>
            </Link>
          ))}
        </div>

        <CreateSpaceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSpace}
        />
      </div>
    </div>
  );
}
