const express = require('express');
const request = require('request');
const app = express();

app.use('/api', (req, res) => {
    const url = `https://api.kingdom.so${req.url}`;
    req.pipe(request(url)).pipe(res);
});

app.listen(3000, () => console.log('Proxy listening on port 3000'));
