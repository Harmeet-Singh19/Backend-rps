const express = require('express')
const app = express()
    // const cors = require('cors')
    // app.use(cors())
const server = require('http').Server(app)

const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

//app.use('/peerjs',peerServer)
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('homepage')
})
app.get('/game', (req, res) => {
    res.redirect(`/game/${uuidV4()}`)
})
app.get('/game/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        var numClients

        io.of('/').in(roomId).clients(function(error, clients) {
            numClients = clients.length;
            // console.log(numClients)
            if (numClients === 2) {
                // console.log("full")
                socket.emit('full', userId);
            } else {

                socket.join(roomId)
                socket.to(roomId).broadcast.emit('user-connected', userId);
                //console.log("join")
                // messages
                socket.on('message', (message, userId) => {
                    //send message to the same room
                    io.to(roomId).emit('createMessage', message, userId)
                });
            }
        });

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })

        socket.on('startcount', (sample) => {
            //console.log("call recieve")
            io.to(roomId).emit('otherstart', userId)
        })

        socket.on('Result', (rps, roomId) => {
            // console.log(rps)
            
             socket.to(roomId).emit('OpponentScore', rps)

        })
        socket.on('sstartcount', (sample) => {
            //console.log("call recieve")

            io.to(roomId).emit('sotherstart', userId)
        })

        socket.on('sResult', (rps, roomId) => {
            // console.log(rps)
            socket.to(roomId).emit('sOpponentScore', rps)
        })
    })
})


server.listen(process.env.PORT || 3030)