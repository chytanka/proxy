const axios = require('axios');
const express = require('express');
const cors = require('cors');

async function getRedirectUrl(url) {
    try {
        const response = await axios.get(url, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        return {
            status: response.status,
            data: response.data,
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
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});