import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ExpenseForm = ({ groupId, groupMembers, onExpenseAdded, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [notes, setNotes] = useState('');
  const [splits, setSplits] = useState([]);
  const [splitType, setSplitType] = useState('equal');

  React.useEffect(() => {
    const initialSplits = groupMembers.map(member => ({
      user: member.user._id,
      username: member.user.username,
      amount: 0,
      percentage: 0
    }));
    setSplits(initialSplits);
  }, [groupMembers]);

  const handleSplitTypeChange = (type) => {
    setSplitType(type);
    if (type === 'equal') {
      const equalAmount = parseFloat(amount || 0) / splits.length;
      const equalPercentage = 100 / splits.length;
      setSplits(splits.map(split => ({
        ...split,
        amount: equalAmount,
        percentage: equalPercentage
      })));
    }
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    if (splitType === 'equal') {
      const numAmount = parseFloat(value || 0);
      const equalAmount = numAmount / splits.length;
      const equalPercentage = 100 / splits.length;
      setSplits(splits.map(split => ({
        ...split,
        amount: equalAmount,
        percentage: equalPercentage
      })));
    }
  };

  const handleSplitAmountChange = (index, value) => {
    const newSplits = [...splits];
    newSplits[index].amount = parseFloat(value || 0);
    
    const numAmount = parseFloat(amount || 0);
    
    if (numAmount > 0) {
      newSplits[index].percentage = (newSplits[index].amount / numAmount) * 100;
    }
    
    setSplits(newSplits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
    const numAmount = parseFloat(amount);
    
    if (Math.abs(totalSplitAmount - numAmount) > 0.01) {
      alert('Split amounts must equal total amount');
      return;
    }

    try {
      await axios.post('/api/expenses', {
        description,
        amount: numAmount,
        groupId,
        splits: splits.map(split => ({
          user: split.user,
          amount: split.amount,
          percentage: split.percentage
        })),
        category,
        notes
      });
      
      onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Add Expense</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities</option>
                <option value="rent">Rent</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Split Type
              </label>
              <select
                value={splitType}
                onChange={(e) => handleSplitTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="equal">Equal Split</option>
                <option value="custom">Custom Split</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="2"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Split Between</h3>
            <div className="space-y-2">
              {splits.map((split, index) => (
                <div key={split.user} className="flex items-center space-x-3">
                  <span className="flex-1 font-medium">{split.username}</span>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.01"
                      value={split.amount}
                      onChange={(e) => handleSplitAmountChange(index, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={splitType === 'equal'}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">
                    {split.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
