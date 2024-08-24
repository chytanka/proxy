const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

corsOptions = {
    // origin: 'chytanka.github.io',
    // optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.static('public'));


class Base64 {
    static toBase64(input) {
        return btoa(encodeURIComponent(input)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    static fromBase64(input) {
        const paddedInput = input.length % 4 != 0 ? (input + '='.repeat(4 - input.length % 4)) : input;
        const decodedBase64 = paddedInput.replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(atob(decodedBase64));
    }

    static isBase64(input) {
        const str = input.replace(/=+$/, "")
        try {
            return Base64.toBase64(Base64.fromBase64(str)) === str;
        } catch (err) {
            return false;
        }
    }
}


app.get('/api', async (req, res) => {
    try {
        const url = req.query.url;
        const ref = req.query.ref;

        const apiUrl = Base64.isBase64(url) ? Base64.fromBase64(url) : url;

        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 'Referer': ref }

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', headers });

        const contentType = response.headers['content-type'];

        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/redirect', async (req, res) => {
    try {
        const apiUrl = req.query.url;

        getRedirectUrl(apiUrl)
            .then(result => {
                if (result.redirectUrl) {
                    console.log(apiUrl);

                    res.set('Content-Type', `application/json`);
                    res.send({ data: result.redirectUrl });
                } else {
                    console.log('Response data:', result.data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });


    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

const viewers = {
    numConnections: 0
}

app.get('/count', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    incrementNumSubscribers()

    const intervalId = setInterval(() => {
        res.write(`data: ${JSON.stringify(getNumSubscribers())}\n\n`);
    }, 5000);

    req.on('close', () => {
        clearInterval(intervalId);
        decrementNumSubscribers();
    });
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});

// 

function getNumSubscribers() {
    return viewers.numConnections;
}

function incrementNumSubscribers() {
    viewers.numConnections++;
}

function decrementNumSubscribers() {
    viewers.numConnections = Math.max(0, viewers.numConnections - 1);
}

async function getRedirectUrl(url) {
    try {
        const response = await fetch(url, {
            redirect: 'manual', // Забороняємо автоматичне слідування за редіректами
            validateStatus: status => status >= 200 && status < 400,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });

        // Якщо статус відповіді 301 або 302, повертаємо URL редіректу
        if (response.status === 301 || response.status === 302) {
            return {
                status: response.status,
                redirectUrl: response.headers.get('location')
            };
        } else {
            const data = await response.text();
            return {
                status: response.status,
                data: data,
                redirectUrl: null
            };
        }
    } catch (error) {
        throw error;
    }
}