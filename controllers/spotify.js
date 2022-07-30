const axios = require('axios')
const qs = require('query-string')
const ExpressError = require('../utils/ExpressError')

const apiHeaderConfig = (token) => {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
}

module.exports.status = async (req, res, next) => {
    await axios.get('https://api.spotify.com/v1/me/player', {
        headers: apiHeaderConfig(req.body.token)
    })
        .then(resp => {
            res.json({
                status: resp.status,
                data: resp.data
            })
        })
        .catch(err => console.log('status', err))
}

module.exports.getTrack = async (req, res, next) => {
    const { trackId } = req.params
    const { token } = req.body
    await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: apiHeaderConfig(token)
    })
        .then(resp => {
            res.json({
                name: resp.data.name,
                album: resp.data.album,
                artists: resp.data.artists,
                id: resp.data.id,
                duration_ms: resp.data.duration_ms
            })
        })
        .catch(err => {
            next(new ExpressError(err))
            console.log('get track error', err)
        })
}

module.exports.setRepeat = async (req, res, next) => {
    const { token, deviceId } = req.body
    console.log('device', deviceId)
    axios({
        url: `https://api.spotify.com/v1/me/player/repeat?state=off&device_id=${deviceId}`,
        headers: apiHeaderConfig(token),
        method: 'put'
    })
        .then(resp => res.send('Succesfully set repeat'))
        .catch(err => {
            console.log('set repeat')
            next(new ExpressError(err))
        })
}

module.exports.device = async (req, res, next) => {
    await axios.get('https://api.spotify.com/v1/me/player/devices', {
        headers: apiHeaderConfig(req.body.token)
    })
        .then(resp => {
            res.json(resp.data.devices)
        })
}

module.exports.getCurrentlyPlaying = async (req, res, next) => {
    await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: apiHeaderConfig(req.body.token)
    })
        .then(resp => res.json(resp.data))
        .catch(err => console.log('currently playing error', err))
}

module.exports.play = async (req, res, next) => {
    const { token, trackUri, deviceId } = req.body
    console.log('trackUri', trackUri)
    await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        uris: trackUri ? [trackUri] : undefined
    }, {
        headers: apiHeaderConfig(token)
    })
        .then(resp => res.send('Playback played'))
        .catch(err => {
            console.log('play error', err)
            next(new ExpressError(err))
        })
}

module.exports.pause = async (req, res, next) => {
    const { token, deviceId } = req.body
    await axios({
        method: 'put',
        url: `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
        headers: apiHeaderConfig(token)
    })
        .then(resp => res.send('Playback paused'))
        .catch(err => {
            console.log('pause', err)
            next(new ExpressError(err))
        })
}

module.exports.transfer = async (req, res, next) => {
    const { token, deviceId } = req.body
    await axios.put('https://api.spotify.com/v1/me/player', {
        play: false,
        device_ids: [deviceId]
    }, {
        headers: apiHeaderConfig(token)
    })
        .then(resp => res.send('Playback transfered'))
        .catch(err => {
            console.log('transfer error', token, deviceId)
            next(new ExpressError(err))
        })
}

module.exports.seek = async (req, res, next) => {
    const { token, position_ms, deviceId } = req.body
    await axios({
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/seek?' + qs.stringify({
            device_id: deviceId,
            position_ms
        }),
        headers: apiHeaderConfig(token)
    })
        .then(resp => res.send('Seek successful'))
        .catch(err => {
            console.log('seek went wrong', err)
            next(new ExpressError(err))
        })
}
