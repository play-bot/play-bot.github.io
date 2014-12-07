class Game
	debug : true
	debugOnlyOnLocal : true
	_debugInfo : undefined
	instance : undefined
	currentScene : undefined
	_lastTime : undefined
	_currentTime : undefined
	constructor : (width, height, debug) ->
		Game.instance = @

		if (@debug && @debugOnlyOnLocal &&
				window.location.protocol.indexOf('file:') != 0)
			@debug = false
			console.log 'debug is disabled'

		@input = new Input()

		# create a WebGL renderer
		@renderer = new THREE.WebGLRenderer()
#         @renderer = new THREE.CanvasRenderer()
		@renderer.setSize width, height
		@renderer.setClearColor 0x000000, 1
		@renderer.shadowMapEnabled = true
		@renderer.shadowMapType = THREE.PCFSoftShadowMap
		@renderer.maxLights = 8
		@renderer.antialias = true
#         @renderer.precision = "highp"

		# get the DOM element to attach to
		container = document.getElementById "interactivedemo"

		# attach the render-supplied DOM element
		container.appendChild @renderer.domElement

		# Show debug information
		@debug = debug if debug != undefined
		if @debug
			@_debugInfo = document.createElement 'div'
			@_debugInfo.style.position = 'absolute'
			@_debugInfo.style.top = '10px'
			@_debugInfo.style.width = '100%'
			@_debugInfo.style.textAlign = 'left'
			@_debugInfo.innerHTML = 'debug is on'
			document.body.appendChild @_debugInfo

		# Handle touch
		@renderer.domElement.ontouchstart = (touch) =>
			touch.preventDefault()
			if @currentScene != undefined
				@currentScene.onTouchStart generatePosition touch

		@renderer.domElement.ontouchmove = (touch) =>
			touch.preventDefault()
			if @currentScene != undefined
				@currentScene.onTouchMove generatePosition touch

		@renderer.domElement.ontouchend = (touch) =>
			touch.preventDefault()
			if @currentScene != undefined
				@currentScene.onTouchEnd generatePosition touch

		window.onmousedown = (click) =>
			@mousedown = true
			if @currentScene != undefined
				@currentScene.onTouchStart generatePosition click

		window.onmousemove = (click) =>
			return if not @mousedown
			if @currentScene != undefined
				@currentScene.onTouchMove generatePosition click

		window.onmouseup = (click) =>
			@mousedown = false
			if @currentScene != undefined
				@currentScene.onTouchEnd generatePosition click

		# Handle devicemotion
		window.addEventListener "devicemotion", (event) =>
			if @currentScene != undefined &&
					@currentScene.onDeviceMotion != undefined &&
					@currentScene.ready
				@currentScene.onDeviceMotion.call @currentScene, event

		# Start main loop
		@_currentTime = Date.now()
		@enterframe()

	enterframe : () =>
		@_lastTime = @_currentTime
		@_currentTime = Date.now()
		deltaTime = (@_currentTime - @_lastTime) * 0.001

		if @currentScene != undefined
			@currentScene.onEnterframe deltaTime
			if @currentScene.isRenderRequested
				@renderer.clear @renderer.clearColor
				@renderer.render @currentScene, @currentScene.camera
				@currentScene.isRenderRequested = false

		requestAnimationFrame @enterframe

	setScene : (scene) ->
		@currentScene = scene

	appendDebugInfo : (message) ->
		return if not @_debugInfo?
		@_debugInfo.innerHTML = message + "<br>" + @_debugInfo.innerHTML

	updateDebugInfo : (message) ->
		return if not @_debugInfo?
		@_debugInfo.innerHTML = message

window.addEventListener 'load', ->

	container = document.getElementById "interactivedemo"

	# set the scene size
	width = container.offsetWidth
	height = width * (1080 / 1920)

	# Display failback image
	failbackImage = document.createElement "img"
	failbackImage.src = 'images/robot_failback.png'
	failbackImage.width = width
	failbackImage.height = height
	container.appendChild failbackImage

	if (window.WebGLRenderingContext)
		docHeight = document.body.scrollHeight
		docHeight = document.body.clientHeight if not docHeight?
		document.addEventListener 'scroll', () =>
			if document.body.scrollTop / docHeight < 0.80
				return

			# Init Three.js
			game = new Game width, height
			mainScene = new RaceScene width, height
			game.setScene mainScene

			container.removeChild failbackImage
			document.removeEventListener 'scroll', arguments.callee
