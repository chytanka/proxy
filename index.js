const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

corsOptions = {
    // origin: 'http://192.168.43.243:4200',
    // optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.get('/api', async (req, res) => {
    try {
        const apiUrl = req.query.url;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        const contentType = response.headers['content-type'];

        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});