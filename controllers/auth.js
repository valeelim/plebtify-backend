const ExpressError = require('../utils/ExpressError')
const axios = require('axios')
const qs = require('query-string')

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
 const generateRandomString = length => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const scope = 'user-read-private user-read-email streaming user-library-read user-library-modify user-read-playback-state user-modify-playback-state'
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = 'https://plebtify.herokuapp.com/'

const authHeaderConfig = {
    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded'
}

module.exports.login = (req, res) => {
    // console.log(scope, client_id, client_secret)
    res.redirect('https://accounts.spotify.com/authorize?' +
        qs.stringify({
            response_type: 'code',
            scope,
            client_id,
            redirect_uri
        }))
}

module.exports.callback = async (req, res, next) => {
    const code = req.body.code || null
    await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
            code,
            grant_type: 'authorization_code',
            redirect_uri
        },
        headers: authHeaderConfig
    })
        .then(resp => {
            res.json({
                accessToken: resp.data.access_token,
                refreshToken: resp.data.refresh_token,
                expiresIn: resp.data.expires_in
            })
        })
        .catch(err => {
            // res.send(err)
            next(new ExpressError('Token could not be retrieved', 400))
        })
}

module.exports.refresh = async (req, res, next) => {
    const refresh_token = req.body.refreshToken
    await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
            grant_type: 'refresh_token',
            refresh_token
        },
        headers: authHeaderConfig
    })
        .then(resp => {
            res.json({
                accessToken: resp.data.access_token,
                expiresIn: resp.data.expires_in
            })
        })
        .catch(err => next(new ExpressError('Refresh token could not be retrieved'), 400))
}