module.exports = io => {
  let users = {}
  let imgProfile = {}
  let messages = []

  io.on('connection', socket => {
    console.log('usuario ingresado')

    socket.on('new-user', (data, callback) => {
      if (data.user in users) {
        callback(false)
      } else {
        callback(true)
        socket.nickname = data.user
        users[socket.nickname] = socket
        imgProfile[socket.nickname] = data.img
        updateUsers()
      }
    })

    socket.on('new-message', message => {
      messages.push(message)
      io.sockets.emit('new-message', messages)
    })

    socket.on('writing', user => {
      io.sockets.emit('writing', user)
    })

    socket.on('delete-message', id => {
      let index = -1
      let deleteMessages = messages.filter((message, i) => {
        return message.id == id ? index = i : false
      })

      messages.splice(index, 1)

      io.sockets.emit('new-message', messages)
    })

    const updateUsers = () => {
      io.emit('users', { keys: Object.keys(users), images: imgProfile })
      io.sockets.emit('new-message', messages)
    }

    socket.on('disconnect', () => {
      if (!socket.nickname) return
      delete users[socket.nickname]
      updateUsers()
    })
  })
}