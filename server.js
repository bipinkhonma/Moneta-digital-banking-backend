require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('moneta API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const accountRoutes = require('./routes/accountRoutes');
app.use('/api/accounts', accountRoutes);

const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/admin', adminRoutes);