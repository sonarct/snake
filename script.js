function Canvas(px) {
  this.px = px
  this.createCanvas()
  this.onResize()
  window.addEventListener('resize', this.onResize.bind(this))
}

Canvas.prototype = {
  createCanvas: function() {
    this.canvas = document.createElement('canvas')
    document.body.appendChild(this.canvas)
    this.ctx = this.canvas.getContext("2d")
  },

  drawMap: function(x, y) {
    this.ctx.clearRect(0, 0, this.ww, this.wh)
    this.ctx.strokeRect(0.5, 0.5, x * this.px, y * this.px)
  },

  drawPoint: function(x, y, color) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x * this.px, y * this.px, this.px, this.px)
  },

  resizeCanvas: function() {
    this.canvas.width = this.ww
    this.canvas.height = this.wh
  },

  onResize: function() {
    this.ww = window.innerWidth
    this.wh = window.innerHeight
    this.resizeCanvas()
  }
}


function Snake(pixelSize, map, gameSpeed) {
  this.canvas = new Canvas(pixelSize)
  this.directions = {
    38: 'up',
    40: 'down',
    37: 'left',
    39: 'right'
  },
  this.moves = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  },
  this.initialLength = 2
  this.map = map
  this.gameSpeed = gameSpeed
  this.isPlaying = false
  this.food = []
  this.direction
  this.length
  this.gameLoop
  this.snake
}

Snake.prototype = {
  setDirection: function(direction) {
    this.direction = direction
  },

  setFood: function(food) {
    this.food = food
  },

  setLength: function(length) {
    this.length = length
  },

  generateFood: function() {
    const pos = this.generateRandomPosition()
    for (let i = 0; i < this.snake.length; i++) {
      const snake = this.snake[i]
      if (this.collide(snake, pos)) {
        this.generateFood()
        return
      }
    }
    this.setFood(pos)
  },

  generateRandomPosition: function() {
    return [
      Math.floor(Math.random() * this.map[0]),
      Math.floor(Math.random() * this.map[1])
    ]
  },

  getNewPosition: function(dir) {
    const head = this.snake[this.snake.length - 1]
    const m = this.moves[dir]
    return [head[0] + m[0], head[1] + m[1]]
  },

  collideWall: function(p) {
    return p[0] < 0 || p[0] >= this.map[0] || p[1] < 0 || p[1] >= this.map[1]
  },

  collideSelf: function(p) {
    for (let i = 0; i < this.snake.length; i++) {
      const s = this.snake[i]
      if (this.collide(p, s)) {
        return true
      }
    }
    return false
  },

  collide: function(p1, p2) {
    return p1[0] === p2[0] && p1[1] === p2[1]
  },

  move: function() {
    const pos = this.getNewPosition(this.direction)
    if (this.collideWall(pos) || this.collideSelf(pos)) {
      this.endGame()
      return
    }
    const canEat = this.collide(pos, this.food)
    if (canEat) {
      this.setLength(this.length + 1)
    }
    this.growSnake(pos)
    if (canEat) {
      this.generateFood()
    }
  },

  growSnake: function(pos) {
    if (this.snake.length === this.length) {
      this.snake.shift()
    }
    this.snake.push(pos)
  },

  drawSnake: function() {
    for (let i = 0; i < this.length; i++) {
      const index = this.snake.length - 1 - i
      if (index < 0) {
        return
      }
      const pos = this.snake[index]
      this.canvas.drawPoint(pos[0], pos[1], '#4d4d4d')
    }
  },

  drawFood: function() {
    this.canvas.drawPoint(this.food[0], this.food[1], '#c22250')
  },

  endGame: function() {
    alert(`GAME OVER. YOUR SCORE: ${this.snake.length - this.initialLength}`)
    this.isPlaying = false
    clearInterval(this.gameLoop)
  },

  resetGame: function() {
    this.setLength(this.initialLength)
    this.setDirection(null)
    this.setFood([])
    this.snake = [this.generateRandomPosition()]
  },

  startGame: function() {
    this.isPlaying = true
    const move = this.move.bind(this)
    this.gameLoop = setInterval(move, this.gameSpeed)
    this.generateFood()
  },

  onKeyEvent: function(event) {
    const dir = this.directions[event.keyCode]
    if (!dir) {
      return
    }
    if (!this.direction) {
      this.startGame()
    }
    if (!this.isPlaying) {
      this.resetGame()
      return
    }
    if (this.isNewDirectionIncorrect(dir)) {
      return
    }
    const pos = this.snake[this.snake.length - this.initialLength]
    const newPos = this.getNewPosition(dir)
    if (pos && this.collide(pos, newPos)) {
      return
    }
    if (dir) {
      this.setDirection(dir)
    }
  },

  isNewDirectionIncorrect: function(dir) {
    return this.direction === 'left'  && dir === 'right' ||
           this.direction === 'right' && dir === 'left' ||
           this.direction === 'up'    && dir === 'down' ||
           this.direction === 'down'  && dir === 'up'
  },

  animate: function() {
    this.canvas.drawMap(this.map[0], this.map[1])
    this.drawSnake()
    this.drawFood()
    // TODO: remove bind
    requestAnimationFrame(this.animate.bind(this))
  }
}


function init () {
  const map = [16, 20]
  const snake = new Snake(32, map, 200)
  const onKeyEvent = snake.onKeyEvent.bind(snake)

  function onLoadComplete() {
    snake.animate()
    snake.resetGame()
  }

  window.addEventListener('keydown', onKeyEvent)
  window.addEventListener('load', onLoadComplete)
}

init()

// Add walls
// Add ability to go through map
// Add bonus food with limited time
// Add interface

