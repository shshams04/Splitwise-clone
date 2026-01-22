import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/groups', newGroup);
      setNewGroup({ name: '', description: '' });
      setShowCreateGroup(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Group</span>
        </button>
      </div>

      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-600 mb-4">Create your first group to start splitting expenses</p>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group._id}
              to={`/group/${group._id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{group.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {member.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {group.members.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        +{group.members.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-500">{group.members.length} members</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
