const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('description').trim().isLength({ min: 1 }),
  body('amount').isNumeric().isFloat({ min: 0.01 }),
  body('groupId').isMongoId(),
  body('splits').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, amount, groupId, splits, category, notes } = req.body;

    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.userId
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplitAmount - amount) > 0.01) {
      return res.status(400).json({ message: 'Split amounts must equal total amount' });
    }

    const expense = new Expense({
      description,
      amount,
      paidBy: req.userId,
      group: groupId,
      splits,
      category,
      notes
    });

    await expense.save();
    await expense.populate([
      { path: 'paidBy', select: 'username email avatar' },
      { path: 'splits.user', select: 'username email avatar' },
      { path: 'group', select: 'name' }
    ]);

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.groupId,
      'members.user': req.userId
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'username email avatar')
      .populate('splits.user', 'username email avatar')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/balances/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.groupId,
      'members.user': req.userId
    }).populate('members.user', 'username email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'username email avatar')
      .populate('splits.user', 'username email avatar');

    const balances = {};

    expenses.forEach(expense => {
      const paidById = expense.paidBy._id.toString();
      balances[paidById] = (balances[paidById] || 0) + expense.amount;

      expense.splits.forEach(split => {
        const userId = split.user._id.toString();
        balances[userId] = (balances[userId] || 0) - split.amount;
      });
    });

    const simplifiedBalances = [];
    const users = Object.keys(balances);

    const debtors = users.filter(userId => balances[userId] < 0)
      .map(userId => ({ userId, amount: -balances[userId] }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = users.filter(userId => balances[userId] > 0)
      .map(userId => ({ userId, amount: balances[userId] }))
      .sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      simplifiedBalances.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: amount
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    res.json({
      balances,
      simplifiedBalances,
      groupMembers: group.members
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      paidBy: req.userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    // Also allow group members to delete expenses they paid for
    const userInGroup = await Group.findOne({
      _id: expense.group,
      'members.user': req.userId
    });

    if (!userInGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
