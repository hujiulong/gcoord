const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, '../../dist')));

app.listen(PORT, () => {
  console.log(`Web UI running at http://localhost:${PORT}`);
});
