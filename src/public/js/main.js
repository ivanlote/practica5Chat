const userList = document.getElementById('users-list')
const userActual = document.getElementById('me')
const imgProfileActual = document.getElementById('img-profile-me')
const inputMessage = document.getElementById('message')
const btnSend = document.getElementById('btnSend')
const ContainereContextMenu = document.getElementById('content-menu')
const inputFileMessage = document.getElementById('file-message')
const inputAttachedMessage = document.getElementById('file-attached')

let idMessages = 0

document.body.addEventListener('click', () => {
  ContainereContextMenu.innerHTML = ''
})

inputFileMessage.addEventListener('change', () => {
  let file = inputFileMessage.files[0]
  if (file.type.indexOf('image') !== -1) {
    let reader = new window.FileReader()
    reader.onload = event => {
      let payload = {
        id: idMessages,
        user: user.value,
        message: event.target.result,
        date: new Date()
      }
      socket.emit('new-message', payload)
      inputMessage.value = ''
    }
    reader.readAsDataURL(file)
  }
})

inputAttachedMessage.addEventListener('change', () => {
  let file = inputAttachedMessage.files[0]
  if (file.type.indexOf('image') === -1) {
    let reader = new window.FileReader()
    reader.onload = event => {
      let payload = {
        id: idMessages,
        user: user.value,
        message: {
          type: file.type,
          nameFile: file.name,
          message: event.target.result
        },
        date: new Date()
      }
      socket.emit('new-message', payload)
      inputMessage.value = ''
    }
    reader.readAsArrayBuffer(file)
  }
})

document.body.addEventListener('contextmenu', (event) => {
  if (event.target.id === 'messages-content' || event.target.id === 'message-group' || event.target.id === 'btn-eliminar' || event.target.id === 'content-context-menu' || event.target.id === 'user-message') {
    event.preventDefault()
  }

  if (event.target.id === 'time' || event.target.id === 'text-message' || event.target.id === 'message') {
    let id = event.target.id === 'time' || event.target.id === 'text-message' ? event.target.parentElement.querySelector('#idMessage') : event.target.querySelector('#idMessage')

    event.preventDefault()
    ContainereContextMenu.innerHTML = ''
    if (id.parentElement.parentElement.classList.contains('me')) {
      createContextMenu(id.textContent, event.pageX, event.pageY)
    }
  } else {
    ContainereContextMenu.innerHTML = ''
  }
})

btnSend.addEventListener('click', () => {
  let payload = {
    id: idMessages,
    user: user.value,
    message: inputMessage.value,
    date: new Date()
  }
  socket.emit('new-message', payload)
  inputMessage.value = ''
})

inputMessage.addEventListener('keypress', (event) => {
  if (event.key === 'Enter' && inputMessage.value.trim() !== '') {
    event.preventDefault()
    let payload = {
      id: idMessages,
      user: user.value,
      message: inputMessage.value,
      date: new Date()
    }
    socket.emit('new-message', payload)
    inputMessage.value = ''
  }
})

inputMessage.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    inputMessage.value = ''
  }

  let payload = {
    user: user.value,
    message: inputMessage.value.trim()
  }
  socket.emit('writing', payload)
})

socket.on('writing', userNameWriting => {
  if (userNameWriting.user !== user.value) {
    let userWriting = document.getElementById(userNameWriting.user)
    if (userNameWriting.message === '') {
      userWriting.classList.add('no-show-writing')
    } else {
      userWriting.classList.remove('no-show-writing')
    }
  }
})

socket.on('new-message', messages => {
  idMessages = messages.length === 0 ? 1 : messages[messages.length - 1].id + 1
  render(messages)
})

socket.on('users', data => {
  userList.innerHTML = ''
  data.keys.map(userData => {
    if (userData === user.value) {
      userActual.textContent = userData
      imgProfileActual.src = data.images[userData]
    } else {
      const userItemHtml = `<li class="item-user">
                              <div class="content-img-profile">
                                  <img class="img-profile" src="${data.images[userData]}" alt="">
                              </div>
                              <div class="content-user-name">
                                <span>${userData}</span>
                                <span id="${userData}" class="isWriting no-show-writing">Esta escribiendo</spand>
                              </div>
                            </li>`
      userList.innerHTML += userItemHtml
    }
  })
})

let render = (messagesData) => {
  const messages = document.getElementById('messages-content')

  let html = messagesData.map((data, index) => {
    let date = new Date(data.date)
    let me = data.user === user.value ? 'me' : ''
    let same = ''
    let downLoadAttached = {}
    if (typeof data.message === 'object') {
      downLoadAttached = getLinkDownloadAttached(data.message.message, data.message.type, data.message.nameFile)
    }
    if (index !== 0) {
      same = data.user === messagesData[index - 1].user ? 'same' : ''
    }
    return `<div class="message-group ${me} ${same}" id="message-group">
              <div class="message" id="message">
                <strong class="user-message" id="user-message">${me !== 'me' && same !== 'same' ? data.user : ''}</strong>
                <spand class="text-message" id="text-message"> ${
  typeof data.message === 'object'
    ? '<a href="' + downLoadAttached.href + '" download="' + downLoadAttached.nameFile + '" class="content-download-attached"><img src="./img/' + downLoadAttached.ext + '.svg" class="icon-download-attached">' + downLoadAttached.nameFile + '</a>'
    : data.message.indexOf('data:image') === -1
      ? data.message
      : '<div class="content-img-message"><img class="img-message" src="' + data.message + '"></div>'}</spand>
                <spand style="display: none;" id="idMessage">${data.id}</spand>
                <spand class="time" id="time">${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}</spand>
              </div>
            </div>`
  }).join(' ')

  messages.innerHTML = html
  messages.scrollTop = messages.scrollHeight
}

let createContextMenu = (id, x, y) => {
  const contentMenu = document.createElement('div')
  const btnDelete = document.createElement('div')
  contentMenu.classList.add('content-context-menu')
  contentMenu.id = 'content-context-menu'
  contentMenu.style.transform = `translate(${x}px, ${y}px)`
  btnDelete.textContent = 'Eliminar'
  btnDelete.classList.add('btn-eliminar')
  btnDelete.id = 'btn-eliminar'

  btnDelete.addEventListener('click', () => {
    socket.emit('delete-message', id)
  })

  contentMenu.appendChild(btnDelete)
  ContainereContextMenu.appendChild(contentMenu)
}

let getLinkDownloadAttached = (arrayBuffer, type, name) => {
  let nameArray = name.split('.')
  let ext = nameArray[nameArray.length - 1]
  let blob = new window.Blob([arrayBuffer], { type: type })
  let objectUrl = URL.createObjectURL(blob)
  return {
    href: objectUrl,
    nameFile: name,
    ext: (ext !== 'pdf' && ext !== 'docx') ? 'file' : ext
  }
}
