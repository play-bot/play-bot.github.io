print = (str) ->
	console.log str

loadModel = (modelPath, material, callback) ->
	loader = new THREE.JSONLoader()
	loader.load modelPath, (geometry, materials) ->
		if (materials == undefined)
			materials = [material]
		mesh = new THREE.Mesh geometry, new THREE.MeshFaceMaterial materials
		callback mesh

loadModelWithAnimation = (modelPath, material, animationIndex, callback) ->
	loader = new THREE.JSONLoader()
	loader.load(modelPath, (geometry, materials) ->
		mesh = new THREE.SkinnedMesh geometry, material

		if not isNaN animationIndex
#             materials = mesh.material.materials
#             for k in [0...materials.length]
#                 materials[k].skinning = true
			material.skinning = true

			index = animationIndex
			animationClipName = mesh.geometry.animations[index].name
			THREE.AnimationHandler.add(mesh.geometry.animations[index])
			mesh.animation = new THREE.Animation(mesh, animationClipName, THREE.AnimationHandler.CATMULLROM)
			mesh.animation.play()

		callback mesh
	)

generatePosition = (e) ->
	if (e.changedTouches != undefined && e.changedTouches.length > 0)
		e.position = {
			x : e.changedTouches[0].pageX
			y : e.changedTouches[0].pageY
		}
	else
		e.position = {
			x : e.pageX
			y : e.pageY
		}
	return e

