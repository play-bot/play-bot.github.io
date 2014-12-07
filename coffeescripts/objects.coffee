class Input
	instance : undefined
	keyCodes : {
		left: 37
		up: 38
		right: 39
		down: 40
	}
	raw : []

	constructor : () ->
		for k, v of @keyCodes
			@raw[v] = false

		window.addEventListener( 'keydown', (event) =>
			@raw[event.keyCode] = true
			return true
		)

		window.addEventListener( 'keyup', (event) =>
			@raw[event.keyCode] = false
			return true
		)

		window.input = @
		instance = @

	getKey : (keyCode) ->
		if isNaN keyCode
			return @raw[@keyCodes[keyCode]]
		else
			return @raw[keyCode]

class Camera extends THREE.PerspectiveCamera
	constructor : (view_angle, aspect, near, far) ->
		THREE.PerspectiveCamera.call @, view_angle, aspect, near, far

class FollowCamera extends Camera
#     offset : {
#         x : 0
#         y : 0
#         z : 0
#     }
#     lookAtOffset : {
#         x : 0
#         y : 0
#         z : 0
#     }
	remainRatio : 0
	target : undefined

	constructor : (view_angle, aspect, near, far) ->
		super view_angle, aspect, near, far

#     lookAt : (position) ->
#         if (arguments.length == 0 && @target != undefined)
#             position = @target.position
#         super {
#             x : position.x + @lookAtOffset.x,
#             y : position.y + @lookAtOffset.y,
#             z : position.z + @lookAtOffset.z
#         }

	follow : (position) ->
		if (arguments.length == 0)
			if (@target != undefined)
				position = @target.position
			else
				return

		_a = @remainRatio
		_b = 1 - _a
		@position.x = @position.x * _a + position.x * _b
		@position.y = @position.y * _a + position.y * _b
		@position.z = @position.z * _a + position.z * _b
