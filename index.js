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
        const response = await axios.get(url, {
            maxRedirects: 0,
            timeout: 10000, // Встановлюємо таймаут в 10 секунд
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Приймаємо статуси від 200 до 399
      }
        });

        return {
            status: response.status,
            redirectUrl: response.headers.location
        };
    } catch (error) {
        if (error.response && (error.response.status === 301 || error.response.status === 302)) {

            return {
                status: error.response.status,
                redirectUrl: error.response.headers.location
            };
        } else {
            throw error;
        }
    }
}