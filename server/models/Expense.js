const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  splits: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'entertainment', 'utilities', 'rent', 'other'],
    default: 'other'
  },
  receipt: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

expenseSchema.methods.calculateBalances = function() {
  const balances = {};
  
  this.splits.forEach(split => {
    const userId = split.user.toString();
    balances[userId] = (balances[userId] || 0) + split.amount;
  });
  
  const paidById = this.paidBy.toString();
  balances[paidById] = (balances[paidById] || 0) - this.amount;
  
  return balances;
};

module.exports = mongoose.model('Expense', expenseSchema);
