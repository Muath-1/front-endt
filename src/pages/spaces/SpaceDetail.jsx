import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import CreateMeetingModal from '../../components/meetings/CreateMeetingModal';
import InviteMembersModal from '../../components/spaces/InviteMembersModal';

export default function SpaceDetail() {
  const { spaceId } = useParams();
  const [space, setSpace] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
  const [isInviteMembersModalOpen, setIsInviteMembersModalOpen] = useState(false);

  useEffect(() => {
    fetchSpaceData();
  }, [spaceId]);

  const fetchSpaceData = async () => {
    try {
      const [spaceRes, meetingsRes, membersRes] = await Promise.all([
        axios.get(`/api/spaces/${spaceId}`),
        axios.get(`/api/spaces/${spaceId}/meetings`),
        axios.get(`/api/spaces/${spaceId}/members`),
      ]);
      setSpace(spaceRes.data);
      setMeetings(meetingsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      setError('Failed to fetch space data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      const response = await axios.post(`/api/spaces/${spaceId}/meetings`, meetingData);
      setMeetings([...meetings, response.data]);
      setIsCreateMeetingModalOpen(false);
    } catch (err) {
      setError('Failed to create meeting');
    }
  };

  const handleInviteMembers = async (emails) => {
    try {
      const response = await axios.post(`/api/spaces/${spaceId}/members/invite`, { emails });
      setMembers([...members, ...response.data]);
      setIsInviteMembersModalOpen(false);
    } catch (err) {
      setError('Failed to invite members');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse">Loading space...</div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-red-600">Space not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{space.name}</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsInviteMembersModalOpen(true)}
                className="btn-secondary inline-flex items-center"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Invite Members
              </button>
              <button
                onClick={() => setIsCreateMeetingModalOpen(true)}
                className="btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Meeting
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Meetings</h2>
                <div className="space-y-4">
                  {meetings.length === 0 ? (
                    <p className="text-gray-500">No meetings scheduled yet.</p>
                  ) : (
                    meetings.map((meeting) => (
                      <Link
                        key={meeting.id}
                        to={`/spaces/${spaceId}/meetings/${meeting.id}`}
                        className="block hover:shadow-md transition-shadow"
                      >
                        <div className="card hover:border-primary-500 border-2 border-transparent">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {meeting.title}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {new Date(meeting.scheduledAt).toLocaleString()}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Members</h2>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <CreateMeetingModal
          isOpen={isCreateMeetingModalOpen}
          onClose={() => setIsCreateMeetingModalOpen(false)}
          onSubmit={handleCreateMeeting}
        />

        <InviteMembersModal
          isOpen={isInviteMembersModalOpen}
          onClose={() => setIsInviteMembersModalOpen(false)}
          onSubmit={handleInviteMembers}
        />
      </div>
    </div>
  );
}
