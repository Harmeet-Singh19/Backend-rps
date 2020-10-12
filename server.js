const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const { PeerServer } = require('peer');

const peerServer = PeerServer({ port: process.env.PORT || 3001, path: '/peerjs' });
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

//app.use('/peerjs',peerServer)
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })

    socket.on('startcount',(sample)=>{
      console.log("call recieve")
      io.to(roomId).emit('otherstart',userId)
    })

    socket.on('Result',(rps,roomId)=>{
      console.log(rps)
      socket.to(roomId).broadcast.emit('OpponentScore',rps)
    })
  })
})


server.listen(process.env.PORT||3000)