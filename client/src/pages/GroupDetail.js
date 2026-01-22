import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import BalanceSummary from '../components/BalanceSummary';
import GroupMembers from '../components/GroupMembers';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { dbHelpers } from '../supabaseClient';

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const [groupRes, expensesRes, balancesRes] = await Promise.all([
          dbHelpers.getGroup(id),
          dbHelpers.getGroupExpenses(id),
          { data: [] } // Placeholder for balances
        ]);
        
        setGroup(groupRes.data);
        setExpenses(expensesRes.data);
        setBalances(balancesRes.data);
      } catch (error) {
        console.error('Error fetching group data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id]);

  const handleExpenseAdded = () => {
    setShowExpenseForm(false);
    window.location.reload();
  };

  const handleMemberAdded = () => {
    window.location.reload();
  };

  const handleMemberRemoved = () => {
    window.location.reload();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!group) {
    return <div className="text-center py-12">Group not found</div>;
  }

  return (
    <div>
      {!loading && group && (
        <>
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-gray-600 mt-1">{group.description}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-sm text-gray-500">
                    {group.members?.length || 0} members
                  </span>
                  <span className="text-sm text-gray-500">
                    {expenses?.length || 0} expenses
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowExpenseForm(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ExpenseList expenses={expenses || []} onExpenseDeleted={handleExpenseAdded} />
            </div>
            
            <div className="space-y-6">
              {balances && <BalanceSummary balances={balances} />}
              <GroupMembers 
                group={group} 
                currentUser={JSON.parse(localStorage.getItem('user'))?.id}
                onMemberAdded={handleMemberAdded}
                onMemberRemoved={handleMemberRemoved}
              />
            </div>
          </div>

          {showExpenseForm && (
            <ExpenseForm
              groupId={group._id}
              groupMembers={group.members || []}
              onExpenseAdded={handleExpenseAdded}
              onClose={() => setShowExpenseForm(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GroupDetail;
