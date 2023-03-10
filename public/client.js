const clientSocket = io()

const canvas = document.getElementById('canvas')
const audio = document.getElementById('audio')
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary')
const secondaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--secondary')
  const backgroundColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--background')
  const foregroundColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--foreground')

const context = canvas.getContext('2d')

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const TILE_SIZE = 64
const PLAYER_SIZE = 32

canvas.width = WIDTH
canvas.height = HEIGHT 

let clientMap = []
let clientPlayers = []

const inputs = {
  'ArrowUp': false,
  'ArrowDown': false,
  'ArrowLeft': false,
  'ArrowRight': false,
}

clientSocket.on('setup', (map) => {
  clientMap = map
})

clientSocket.on('players', (players) => {
  clientPlayers = players
})
 
document.addEventListener('keydown', (event) => {
  if (event.key in inputs) {
    inputs[event.key] = true
  }
})

document.addEventListener('keyup', (event) => {
  if (event.key in inputs) {
    inputs[event.key] = false
  }
})


function update(delta) {
  clientSocket.emit('inputs', inputs)
}

function draw() {
  context.clearRect(0, 0, WIDTH, HEIGHT)
  
    
    for (let row = 0; row < clientMap.length; row++) {
      for (let col = 0; col < clientMap[row].length; col++) {
        const tile = clientMap[row][col]
        
        if (tile === 1) {
          context.fillStyle = foregroundColor
          context.fillRect(
            col * TILE_SIZE,
            row * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
          )
        }
        
        if (tile === 2) {
          context.fillStyle = secondaryColor
          context.fillRect(
            (col * 64),
            (row * 64) + 16 + (16 / 2),
            16,
            16
          )
        }
      }
    }

    for (let player of clientPlayers) {
      context.fillStyle = primaryColor
      context.fillRect(
        player.position.x,
        player.position.y,
        PLAYER_SIZE,
        PLAYER_SIZE
      )

      let textPositionX = (player.position.x + player.velocity.x) - (PLAYER_SIZE / 2) 
      context.fillText(player.name, textPositionX, player.position.y - 10 )
    }
}

let deltaTime = 0
let time = 0
let fps = 0

function loop(timestamp) {
  deltaTime = (timestamp - time) / 1000
  time = timestamp

  fps = Math.round(1 / deltaTime)
  
  update(deltaTime)
  draw()

  window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)
