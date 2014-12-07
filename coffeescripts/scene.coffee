class Scene extends THREE.Scene
	camera : undefined
	realtime : false
	isRenderRequested : false
	childNodes : []
	constructor : () ->
		THREE.Scene.call @

	requestRender : () ->
		@isRenderRequested = true
#         Game.instance.updateDebugInfo "#{new Date()}"

	onEnterframe : (deltaTime) ->
		if @realtime
			@requestRender = true

	onTouchStart : (touch) ->

	onTouchMove : (touch) ->

	onTouchEnd : (touch) ->

	onDeviceMotion : (motion) ->

class RaceScene extends Scene
	cameraAxis : undefined
	cameraRotation : undefined
	robot : undefined
	constructor : (width, height) ->
		super

		@fog = new THREE.FogExp2 0x00000f, 0.0085
#         @fog = new THREE.Fog 0x000022, 100, 200

		# set some camera attributes
		VIEW_ANGLE = 10
		ASPECT = width / height
		NEAR = 0.3
		FAR = 500
		aspectRatio = (Math.min(width, height) / Math.max(width, height))

		@camera = new FollowCamera VIEW_ANGLE, ASPECT, NEAR, FAR
		@camera.remainRatio = 0.7
		@camera.position.set 0, -105, 65

		@cameraGroup = new THREE.Object3D()
		@cameraGroup.add @camera
		@add @cameraGroup

		cameraLookAtTransform = new THREE.Object3D()
		cameraLookAtTransform.position.set 0, 0, 5
		@cameraGroup.add cameraLookAtTransform
		@camera.target = cameraLookAtTransform

		# stage group
		group = new THREE.Object3D()
		@add group
		@root = group

		# Stage
		floorGeometry = new THREE.PlaneGeometry 100, 100
		floorMaterial = new THREE.MeshPhongMaterial {
			color : 0xffffff
			ambient : 0xffffff
			specular : 0x000800
			shininess : 100
			wireframe : false
		}
		floorMesh = new THREE.Mesh floorGeometry, floorMaterial
#         floorMesh.castShadow = true
		floorMesh.receiveShadow = true
		group.add floorMesh

		lightGroup = new THREE.Object3D()
		lightGroup.position.set 0, 0, 10
		@cameraGroup.add lightGroup
		@lightGroup = lightGroup

		mainLightColor = 0xffffff
		mainLight = new THREE.HemisphereLight mainLightColor, 0x888888, 0.8
		lightGroup.add mainLight

		spotLight = new THREE.SpotLight mainLightColor, 0.8
		spotLight.castShadow = true
		spotLight.shadowCameraNear = 5
		spotLight.shadowCameraFar = 1000
		spotLight.shadowCameraFov = 30
		spotLight.position.set 20, -50, 50
		@lightGroup.add spotLight

		# create a point light
#         lightDistance = 20
#         pointLights = new Array
#         cubes = new Array
#         for i in [0..3]
#             pointLights[i] = new THREE.PointLight mainLightColor, 0.4
#             t = Math.PI * 2 * i / 4
#             pos = {
#                 x : lightDistance * Math.sin t
#                 y : lightDistance * Math.cos t
#                 z : 0
#             }
#             pointLights[i].position = pos

#             lightGroup.add pointLights[i]

#             cubeGeometry = new THREE.BoxGeometry 1, 1, 1
#             cubes[i] = new THREE.Mesh cubeGeometry, floorMaterial
#             cubes[i].position.copy pointLights[i].position
#             lightGroup.add cubes[i]
#             console.log cubes[i].position

#         ambientLight = new THREE.AmbientLight 0xffffff, 0.7
#         ambientLight.position.set 0, 0, 5
#         lightGroup.add ambientLight

		# add robot
		botColorMap = THREE.ImageUtils.loadTexture 'textures/robot_color.png'
		botColorMap.anisotropy = Game.instance.renderer.getMaxAnisotropy()
		botSpecularMap = THREE.ImageUtils.loadTexture 'textures/robot_normal.png'
		botSpecularMap.anisotropy = Game.instance.renderer.getMaxAnisotropy()
		robotMaterial = new THREE.MeshPhongMaterial {
			map : botColorMap
			specularMap : botSpecularMap
			ambient: 0x030303
			color: 0xdddddd
			specular: 0x009900
			shininess: 100
			shading: THREE.SmoothShading
			wireframe : false
		}
		loadModel 'javascripts/robot_tpose.js', robotMaterial, (mesh) =>
#             mesh.scale.set 0.01, 0.01, 0.01
			mesh.scale.set 0.1, 0.1, 0.1
			mesh.castShadow = true
			group.add mesh
			@childNodes["robot"] = mesh
			@requestRender()

		@cameraAxis = new THREE.Vector3 0, 0, 1
		@cameraRotation = 0

	rotateCameraBy : (deg) =>
		@cameraRotation += deg
		@rotateCameraTo @cameraRotation

	rotateCameraTo : (deg) =>
		@cameraRotation = deg
		quaternion = new THREE.Quaternion().setFromAxisAngle @cameraAxis
			, toRadian @cameraRotation
		@cameraGroup.rotation.setFromQuaternion quaternion
		@requestRender()

	onEnterframe : (deltaTime) =>
		super()

		input = Game.instance.input
		if input.getKey "down"
			@lightGroup.position.z -= 100 * deltaTime
			@requestRender()
		if input.getKey "up"
			@lightGroup.position.z += 100 * deltaTime
			@requestRender()
		if input.getKey "left"
			@rotateCameraBy 180 * deltaTime
		if input.getKey "right"
			@rotateCameraBy -180 * deltaTime
		if @touchMovePos != undefined && @touchStartPos != undefined
			@rotateCameraBy (@touchStartPos.x - @touchMovePos.x) * 1
			@touchStartPos = @touchMovePos

		robot = @childNodes["robot"]

		@camera.lookAt @camera.target.position
		p = @lightGroup.position
		Game.instance.updateDebugInfo "x: #{p.x}<br> y: #{p.y}<br> z: #{p.z}"

	onTouchStart : (touch) ->
		@touchStartPos = touch.position

	onTouchMove : (touch) ->
		@touchMovePos = touch.position

	onTouchEnd : (touch) ->
		@touchMovePos = undefined

	onDeviceMotion : (motion) ->

		accel = motion.accelerationIncludingGravity
		Game.instance.updateDebugInfo "x: #{accel.x}<br> y: #{accel.y}<br> z: #{accel.z}"

