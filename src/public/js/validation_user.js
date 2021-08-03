const socket = io()

const user = document.getElementById('user')
const contentUser = document.getElementById('enter-user')
const messageInput = document.getElementById('message-input')
const imgProfile = document.getElementById('img-profile-change')
const imgUserProfile = document.getElementById('img-user-profile')

user.addEventListener('keyup', (event) => {
  if (user.value !== '') {
    messageInput.textContent = 'Enter para ingresar'
    messageInput.style.color = '#013859'
  } else {
    messageInput.textContent = 'Nombre de usuario vacío'
    messageInput.style.color = '#EB3E4A'
  }

  if (event.key === 'Enter') {
    if (user.value === '') {
      messageInput.textContent = 'Nombre de usuario vacío'
      messageInput.style.color = '#EB3E4A'
    } else {
      socket.emit('new-user', { user: user.value, img: imgUserProfile.src }, isConnected => {
        if (isConnected) {
          contentUser.classList.add('close-login')
        } else {
          messageInput.textContent = 'Nombre de usuario existente'
          messageInput.style.color = '#EB3E4A'
        }
      })
    }
  }
})

imgProfile.addEventListener('change', () => {
  let file = imgProfile.files[0]
  if (file.type.indexOf('image') === -1) {
    messageInput.textContent = 'Foto de perfil no es una imagen'
    messageInput.style.color = '#EB3E4A'
  } else {
    let reader = new window.FileReader()
    reader.onload = event => {
      imgUserProfile.src = event.target.result
    }
    reader.readAsDataURL(file)
    messageInput.textContent = 'Enter para ingresar'
    messageInput.style.color = '#013859'
  }
})
