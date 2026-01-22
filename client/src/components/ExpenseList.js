import React from 'react';
import axios from 'axios';
import { TrashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const ExpenseList = ({ expenses, onExpenseDeleted }) => {
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await axios.delete(`/api/expenses/${expenseId}`);
      onExpenseDeleted();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      rent: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-600">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
      </div>
      
      <div className="divide-y">
        {expenses.map((expense) => (
          <div key={expense._id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span>${expense.amount.toFixed(2)}</span>
                  <span>•</span>
                  <span>Paid by {expense.paidBy.username}</span>
                  <span>•</span>
                  <span>{formatDate(expense.date)}</span>
                </div>

                {expense.notes && (
                  <p className="mt-2 text-sm text-gray-600">{expense.notes}</p>
                )}

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Split between:</p>
                  <div className="flex flex-wrap gap-2">
                    {expense.splits.map((split) => (
                      <span
                        key={split.user._id}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {split.user.username}: ${split.amount.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteExpense(expense._id)}
                className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete expense"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
