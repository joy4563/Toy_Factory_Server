const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res, next) => {
  res.send('Toy server is here');
});

app.listen(PORT, () => {
  console.log('toy server is running at', PORT);
});
