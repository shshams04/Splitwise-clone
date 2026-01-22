import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const BalanceSummary = ({ balances }) => {
  const { simplifiedBalances, groupMembers } = balances;
  
  const getUserById = (userId) => {
    const member = groupMembers.find(m => m.user?._id === userId);
    return member ? member.user : { username: 'Unknown User' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!simplifiedBalances || simplifiedBalances.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Settle Up</h3>
        <p className="text-gray-600 text-center py-4">All settled up!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Settle Up</h3>
      
      <div className="space-y-3">
        {simplifiedBalances.map((balance, index) => {
          const fromUser = getUserById(balance.from);
          const toUser = getUserById(balance.to);
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{fromUser.username}</span>
                  <ArrowUpIcon className="h-4 w-4 text-green-600" />
                </div>
                
                <span className="text-gray-500">owes</span>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{toUser.username}</span>
                  <ArrowDownIcon className="h-4 w-4 text-red-600" />
                </div>
              </div>
              
              <span className="font-semibold text-gray-900">
                {formatCurrency(balance.amount)}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <UserGroupIcon className="h-4 w-4 mr-2" />
          {simplifiedBalances.length} settlement{simplifiedBalances.length !== 1 ? 's' : ''} needed
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
