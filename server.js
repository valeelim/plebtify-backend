require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const lyricsFinder = require('lyrics-finder')

const ExpressError = require('./utils/ExpressError')

const auth = require('./controllers/auth')
const spotify = require('./controllers/spotify')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('You made it :3')
})
app.get('/login', auth.login)
app.post('/callback', auth.callback)
app.post('/refresh', auth.refresh)
app.post('/status', spotify.status)
app.post('/device', spotify.device)
app.post('/current-track', spotify.getCurrentlyPlaying)
app.post('/track/:trackId', spotify.getTrack)
app.post('/set-repeat', spotify.setRepeat)
app.post('/seek', spotify.seek)
app.put('/play', spotify.play)
app.put('/pause', spotify.pause)
app.put('/transfer', spotify.transfer)

app.get('/lyrics', async (req, res) => {
    let lyrics = await lyricsFinder(req.query.artist, req.query.track) || 'Not Found!'
    res.json({ lyrics })
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message)
        err.message = 'Oh no, Something went wrong'
    res.status(statusCode).json(err)
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
