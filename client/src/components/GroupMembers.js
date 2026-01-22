import React, { useState } from 'react';
import { UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../api';

const GroupMembers = ({ group, currentUser, onMemberAdded, onMemberRemoved }) => {
  const [email, setEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Custom confirmation dialog instead of window.confirm
    const isConfirmed = window.confirm('Are you sure you want to add this member?');
    if (!isConfirmed) return;

    try {
      const response = await api.post(`/groups/${group._id}/members`, {
        email,
      });

      if (response.data) {
        setEmail('');
        setShowAddMember(false);
        onMemberAdded();
      } else {
        alert(response.data?.message || 'Failed to add member');
      }
    } catch (error) {
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    // Custom confirmation dialog instead of window.confirm
    const isConfirmed = window.confirm('Are you sure you want to remove this member?');
    if (!isConfirmed) return;

    try {
      const response = await api.delete(`/groups/${group._id}/members/${memberId}`);

      if (response.data) {
        onMemberRemoved();
      } else {
        alert(response.data?.message || 'Failed to remove member');
      }
    } catch (error) {
      alert('Failed to remove member');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Members</h3>
        <button
          onClick={() => setShowAddMember(true)}
          className="flex items-center space-x-2 text-green-600 hover:text-green-800"
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>Add Member</span>
        </button>
      </div>

      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Member</h3>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {group.members.map((member) => (
          <div key={member.user._id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {member.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.user.username}</p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
              </div>
            </div>
            
            {member.user._id !== currentUser && group.createdBy !== member.user._id && (
              <button
                onClick={() => handleRemoveMember(member.user._id)}
                className="text-red-600 hover:text-red-800"
                title="Remove member"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupMembers;
