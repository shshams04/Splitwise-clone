const express = require('express');
const { body, validationResult } = require('express-validator');
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('name').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, memberEmails } = req.body;

    const members = [{ user: req.userId, joinedAt: new Date() }];

    if (memberEmails && memberEmails.length > 0) {
      const users = await User.find({ email: { $in: memberEmails } });
      users.forEach(user => {
        if (!members.some(m => m.user.toString() === user._id.toString())) {
          members.push({ user: user._id, joinedAt: new Date() });
        }
      });
    }

    const group = new Group({
      name,
      description,
      members,
      createdBy: req.userId
    });

    await group.save();
    await group.populate('members.user', 'username email avatar');

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.userId })
      .populate('members.user', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      'members.user': req.userId
    })
      .populate('members.user', 'username email avatar')
      .populate('createdBy', 'username email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/members', auth, [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const group = await Group.findOne({
      _id: req.params.id,
      'members.user': req.userId
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (group.members.some(m => m.user.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'User already in group' });
    }

    group.members.push({ user: user._id, joinedAt: new Date() });
    await group.save();
    await group.populate('members.user', 'username email avatar');

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      'members.user': req.userId
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is trying to remove themselves
    if (req.params.userId === req.userId) {
      return res.status(400).json({ message: 'Cannot remove yourself from group' });
    }

    // Check if user is group creator
    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can remove members' });
    }

    group.members = group.members.filter(
      member => member.user.toString() !== req.params.userId
    );
    
    await group.save();
    await group.populate('members.user', 'username email avatar');

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
