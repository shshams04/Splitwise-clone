const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { supabase } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// JWT middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabaseHelpers.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data, error } = await supabaseHelpers.createUser({
      username,
      email,
      password: hashedPassword
    });

    if (error) {
      return res.status(400).json({ message: 'Registration failed' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: data[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: data[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const { data: user, error } = await supabaseHelpers.getUserByEmail(email);
    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(400).json({ message: 'User not found' });
    }

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Groups routes
app.post('/api/groups', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const { data, error } = await supabaseHelpers.createGroup({
      name,
      description,
      created_by: req.user.id
    });

    if (error) {
      return res.status(400).json({ message: 'Failed to create group' });
    }

    // Add creator as member
    await supabase
      .from('group_members')
      .insert([{
        group_id: data[0].id,
        user_id: req.user.id
      }]);

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/groups', auth, async (req, res) => {
  try {
    const { data, error } = await supabaseHelpers.getUserGroups(req.user.id);
    
    if (error) {
      return res.status(400).json({ message: 'Failed to fetch groups' });
    }

    res.json(data.map(item => item.groups));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Supabase backend running on port ${PORT}`);
});
