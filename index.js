const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Base64 = require('./base64');
const app = express();
const rateLimit = require('express-rate-limit');

const port = process.env.PORT || 5000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

corsOptions = {
    // origin: [/\.chytanka\.ink$/, 'https://chytanka.ink'],
    // optionsSuccessStatus: 200
}

const allowedDomains = [
    'imgur.com',
    'mangadex.org',
    'comick.fun',
    'imgchest.com',
    'mangadex.network',
    'nhentai.net',
    'pixiv.net',
    'pximg.net',
    'redd.it',
    'telegra.ph',
    'yande.re',
    'b-cdn.net'
];

function isAllowedHost(hostname) {
    return allowedDomains.some((domain) =>
        hostname === domain || hostname.endsWith('.' + domain)
    );
}

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use('/api', limiter);

app.get('/api', async (req, res) => {
    try {
        const url = req.query.url;
        const ref = req.query.ref;

        const apiUrl = Base64.isBase64(url) ? Base64.fromBase64(url) : url;

        const parsedUrl = new URL(apiUrl);

        if (!isAllowedHost(parsedUrl.hostname)) {
            console.warn(`Blocked request to disallowed host: ${parsedUrl.hostname}`);
            return res.status(403).send();
        }

        const authorizationHeader = req.headers.authorization
        
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Referer': ref,
            "Authorization": authorizationHeader
        }

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', headers });

        const contentType = response.headers['content-type'];

        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(403).send();
    }
});

app.get('/', async (req, res) => {
    res.status(403).send()
})

app.listen(port, '127.0.0.1', () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});