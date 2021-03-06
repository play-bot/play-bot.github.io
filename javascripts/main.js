// Generated by CoffeeScript 1.6.3
(function() {
  var Camera, FollowCamera, Game, Input, RaceScene, Scene, generatePosition, loadModel, loadModelWithAnimation, print, toRadian,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Game = (function() {
    Game.prototype.debug = true;

    Game.prototype.debugOnlyOnLocal = true;

    Game.prototype._debugInfo = void 0;

    Game.prototype.instance = void 0;

    Game.prototype.currentScene = void 0;

    Game.prototype._lastTime = void 0;

    Game.prototype._currentTime = void 0;

    function Game(width, height, debug) {
      this.enterframe = __bind(this.enterframe, this);
      var container,
        _this = this;
      Game.instance = this;
      if (this.debug && this.debugOnlyOnLocal && window.location.protocol.indexOf('file:') !== 0) {
        this.debug = false;
        console.log('debug is disabled');
      }
      this.input = new Input();
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(width, height);
      this.renderer.setClearColor(0x000000, 1);
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
      this.renderer.maxLights = 8;
      this.renderer.antialias = true;
      container = document.getElementById("interactivedemo");
      container.appendChild(this.renderer.domElement);
      if (debug !== void 0) {
        this.debug = debug;
      }
      if (this.debug) {
        this._debugInfo = document.createElement('div');
        this._debugInfo.style.position = 'absolute';
        this._debugInfo.style.top = '10px';
        this._debugInfo.style.width = '100%';
        this._debugInfo.style.textAlign = 'left';
        this._debugInfo.innerHTML = 'debug is on';
        document.body.appendChild(this._debugInfo);
      }
      this.renderer.domElement.ontouchstart = function(touch) {
        touch.preventDefault();
        if (_this.currentScene !== void 0) {
          return _this.currentScene.onTouchStart(generatePosition(touch));
        }
      };
      this.renderer.domElement.ontouchmove = function(touch) {
        touch.preventDefault();
        if (_this.currentScene !== void 0) {
          return _this.currentScene.onTouchMove(generatePosition(touch));
        }
      };
      this.renderer.domElement.ontouchend = function(touch) {
        touch.preventDefault();
        if (_this.currentScene !== void 0) {
          return _this.currentScene.onTouchEnd(generatePosition(touch));
        }
      };
      window.onmousedown = function(click) {
        _this.mousedown = true;
        if (_this.currentScene !== void 0) {
          return _this.currentScene.onTouchStart(generatePosition(click));
        }
      };
      window.onmousemove = function(click) {
        if (!_this.mousedown) {
          return;
        }
        if (_this.currentScene !== void 0) {
          return _this.currentScene.onTouchMove(generatePosition(click));
        }
      };
      window.onmouseup = function(click) {
        _this.mousedown = false;
        if (_this.currentScene !== void 0) {
          return _this.currentScene.onTouchEnd(generatePosition(click));
        }
      };
      window.addEventListener("devicemotion", function(event) {
        if (_this.currentScene !== void 0 && _this.currentScene.onDeviceMotion !== void 0 && _this.currentScene.ready) {
          return _this.currentScene.onDeviceMotion.call(_this.currentScene, event);
        }
      });
      this._currentTime = Date.now();
      this.enterframe();
    }

    Game.prototype.enterframe = function() {
      var deltaTime;
      this._lastTime = this._currentTime;
      this._currentTime = Date.now();
      deltaTime = (this._currentTime - this._lastTime) * 0.001;
      if (this.currentScene !== void 0) {
        this.currentScene.onEnterframe(deltaTime);
        if (this.currentScene.isRenderRequested) {
          this.renderer.clear(this.renderer.clearColor);
          this.renderer.render(this.currentScene, this.currentScene.camera);
          this.currentScene.isRenderRequested = false;
        }
      }
      return requestAnimationFrame(this.enterframe);
    };

    Game.prototype.setScene = function(scene) {
      return this.currentScene = scene;
    };

    Game.prototype.appendDebugInfo = function(message) {
      if (this._debugInfo == null) {
        return;
      }
      return this._debugInfo.innerHTML = message + "<br>" + this._debugInfo.innerHTML;
    };

    Game.prototype.updateDebugInfo = function(message) {
      if (this._debugInfo == null) {
        return;
      }
      return this._debugInfo.innerHTML = message;
    };

    return Game;

  })();

  window.addEventListener('load', function() {
    var container, docHeight, failbackImage, height, width,
      _this = this;
    container = document.getElementById("interactivedemo");
    width = container.offsetWidth;
    height = width * (1080 / 1920);
    failbackImage = document.createElement("img");
    failbackImage.src = 'images/robot_failback.png';
    failbackImage.width = width;
    failbackImage.height = height;
    container.appendChild(failbackImage);
    if (window.WebGLRenderingContext) {
      docHeight = document.body.scrollHeight;
      if (docHeight == null) {
        docHeight = document.body.clientHeight;
      }
      return document.addEventListener('scroll', function() {
        var game, mainScene;
        if (document.height > window.innerHeight && (window.scrollY || document.documentElement.scrollTop) + window.innerHeight < document.body.offsetHeight) {
          return;
        }
        game = new Game(width, height);
        mainScene = new RaceScene(width, height);
        game.setScene(mainScene);
        container.removeChild(failbackImage);
        return document.removeEventListener('scroll', arguments.callee);
      });
    }
  });

  toRadian = function(deg) {
    return (deg / 360) * (Math.PI * 2);
  };

  Input = (function() {
    Input.prototype.instance = void 0;

    Input.prototype.keyCodes = {
      left: 37,
      up: 38,
      right: 39,
      down: 40
    };

    Input.prototype.raw = [];

    function Input() {
      var instance, k, v, _ref,
        _this = this;
      _ref = this.keyCodes;
      for (k in _ref) {
        v = _ref[k];
        this.raw[v] = false;
      }
      window.addEventListener('keydown', function(event) {
        _this.raw[event.keyCode] = true;
        return true;
      });
      window.addEventListener('keyup', function(event) {
        _this.raw[event.keyCode] = false;
        return true;
      });
      window.input = this;
      instance = this;
    }

    Input.prototype.getKey = function(keyCode) {
      if (isNaN(keyCode)) {
        return this.raw[this.keyCodes[keyCode]];
      } else {
        return this.raw[keyCode];
      }
    };

    return Input;

  })();

  Camera = (function(_super) {
    __extends(Camera, _super);

    function Camera(view_angle, aspect, near, far) {
      THREE.PerspectiveCamera.call(this, view_angle, aspect, near, far);
    }

    return Camera;

  })(THREE.PerspectiveCamera);

  FollowCamera = (function(_super) {
    __extends(FollowCamera, _super);

    FollowCamera.prototype.remainRatio = 0;

    FollowCamera.prototype.target = void 0;

    function FollowCamera(view_angle, aspect, near, far) {
      FollowCamera.__super__.constructor.call(this, view_angle, aspect, near, far);
    }

    FollowCamera.prototype.follow = function(position) {
      var _a, _b;
      if (arguments.length === 0) {
        if (this.target !== void 0) {
          position = this.target.position;
        } else {
          return;
        }
      }
      _a = this.remainRatio;
      _b = 1 - _a;
      this.position.x = this.position.x * _a + position.x * _b;
      this.position.y = this.position.y * _a + position.y * _b;
      return this.position.z = this.position.z * _a + position.z * _b;
    };

    return FollowCamera;

  })(Camera);

  Scene = (function(_super) {
    __extends(Scene, _super);

    Scene.prototype.camera = void 0;

    Scene.prototype.realtime = false;

    Scene.prototype.isRenderRequested = false;

    Scene.prototype.childNodes = [];

    function Scene() {
      THREE.Scene.call(this);
    }

    Scene.prototype.requestRender = function() {
      return this.isRenderRequested = true;
    };

    Scene.prototype.onEnterframe = function(deltaTime) {
      if (this.realtime) {
        return this.requestRender = true;
      }
    };

    Scene.prototype.onTouchStart = function(touch) {};

    Scene.prototype.onTouchMove = function(touch) {};

    Scene.prototype.onTouchEnd = function(touch) {};

    Scene.prototype.onDeviceMotion = function(motion) {};

    return Scene;

  })(THREE.Scene);

  RaceScene = (function(_super) {
    __extends(RaceScene, _super);

    RaceScene.prototype.cameraAxis = void 0;

    RaceScene.prototype.cameraRotation = void 0;

    RaceScene.prototype.robot = void 0;

    function RaceScene(width, height) {
      this.onEnterframe = __bind(this.onEnterframe, this);
      this.rotateCameraTo = __bind(this.rotateCameraTo, this);
      this.rotateCameraBy = __bind(this.rotateCameraBy, this);
      var ASPECT, FAR, NEAR, VIEW_ANGLE, aspectRatio, botColorMap, botSpecularMap, cameraLookAtTransform, floorGeometry, floorMaterial, floorMesh, group, lightGroup, mainLight, mainLightColor, robotMaterial, spotLight,
        _this = this;
      RaceScene.__super__.constructor.apply(this, arguments);
      this.fog = new THREE.FogExp2(0x00000f, 0.0085);
      VIEW_ANGLE = 10;
      ASPECT = width / height;
      NEAR = 0.3;
      FAR = 500;
      aspectRatio = Math.min(width, height) / Math.max(width, height);
      this.camera = new FollowCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
      this.camera.remainRatio = 0.7;
      this.camera.position.set(0, -105, 65);
      this.cameraGroup = new THREE.Object3D();
      this.cameraGroup.add(this.camera);
      this.add(this.cameraGroup);
      cameraLookAtTransform = new THREE.Object3D();
      cameraLookAtTransform.position.set(0, 0, 5);
      this.cameraGroup.add(cameraLookAtTransform);
      this.camera.target = cameraLookAtTransform;
      group = new THREE.Object3D();
      this.add(group);
      this.root = group;
      floorGeometry = new THREE.PlaneGeometry(100, 100);
      floorMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        ambient: 0xffffff,
        specular: 0x000800,
        shininess: 100,
        wireframe: false
      });
      floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.receiveShadow = true;
      group.add(floorMesh);
      lightGroup = new THREE.Object3D();
      lightGroup.position.set(0, 0, 10);
      this.cameraGroup.add(lightGroup);
      this.lightGroup = lightGroup;
      mainLightColor = 0xffffff;
      mainLight = new THREE.HemisphereLight(mainLightColor, 0x888888, 0.8);
      lightGroup.add(mainLight);
      spotLight = new THREE.SpotLight(mainLightColor, 0.8);
      spotLight.castShadow = true;
      spotLight.shadowCameraNear = 5;
      spotLight.shadowCameraFar = 1000;
      spotLight.shadowCameraFov = 30;
      spotLight.position.set(20, -50, 50);
      this.lightGroup.add(spotLight);
      botColorMap = THREE.ImageUtils.loadTexture('textures/robot_color.png');
      botColorMap.anisotropy = Game.instance.renderer.getMaxAnisotropy();
      botSpecularMap = THREE.ImageUtils.loadTexture('textures/robot_normal.png');
      botSpecularMap.anisotropy = Game.instance.renderer.getMaxAnisotropy();
      robotMaterial = new THREE.MeshPhongMaterial({
        map: botColorMap,
        specularMap: botSpecularMap,
        ambient: 0x030303,
        color: 0xdddddd,
        specular: 0x009900,
        shininess: 100,
        shading: THREE.SmoothShading,
        wireframe: false
      });
      loadModel('javascripts/robot_tpose.js', robotMaterial, function(mesh) {
        mesh.scale.set(0.1, 0.1, 0.1);
        mesh.castShadow = true;
        group.add(mesh);
        _this.childNodes["robot"] = mesh;
        return _this.requestRender();
      });
      this.cameraAxis = new THREE.Vector3(0, 0, 1);
      this.cameraRotation = 0;
    }

    RaceScene.prototype.rotateCameraBy = function(deg) {
      this.cameraRotation += deg;
      return this.rotateCameraTo(this.cameraRotation);
    };

    RaceScene.prototype.rotateCameraTo = function(deg) {
      var quaternion;
      this.cameraRotation = deg;
      quaternion = new THREE.Quaternion().setFromAxisAngle(this.cameraAxis, toRadian(this.cameraRotation));
      this.cameraGroup.rotation.setFromQuaternion(quaternion);
      return this.requestRender();
    };

    RaceScene.prototype.onEnterframe = function(deltaTime) {
      var input, p, robot;
      RaceScene.__super__.onEnterframe.call(this);
      input = Game.instance.input;
      if (input.getKey("down")) {
        this.lightGroup.position.z -= 100 * deltaTime;
        this.requestRender();
      }
      if (input.getKey("up")) {
        this.lightGroup.position.z += 100 * deltaTime;
        this.requestRender();
      }
      if (input.getKey("left")) {
        this.rotateCameraBy(180 * deltaTime);
      }
      if (input.getKey("right")) {
        this.rotateCameraBy(-180 * deltaTime);
      }
      if (this.touchMovePos !== void 0 && this.touchStartPos !== void 0) {
        this.rotateCameraBy((this.touchStartPos.x - this.touchMovePos.x) * 1);
        this.touchStartPos = this.touchMovePos;
      }
      robot = this.childNodes["robot"];
      this.camera.lookAt(this.camera.target.position);
      p = this.lightGroup.position;
      return Game.instance.updateDebugInfo("x: " + p.x + "<br> y: " + p.y + "<br> z: " + p.z);
    };

    RaceScene.prototype.onTouchStart = function(touch) {
      return this.touchStartPos = touch.position;
    };

    RaceScene.prototype.onTouchMove = function(touch) {
      return this.touchMovePos = touch.position;
    };

    RaceScene.prototype.onTouchEnd = function(touch) {
      return this.touchMovePos = void 0;
    };

    RaceScene.prototype.onDeviceMotion = function(motion) {
      var accel;
      accel = motion.accelerationIncludingGravity;
      return Game.instance.updateDebugInfo("x: " + accel.x + "<br> y: " + accel.y + "<br> z: " + accel.z);
    };

    return RaceScene;

  })(Scene);

  print = function(str) {
    return console.log(str);
  };

  loadModel = function(modelPath, material, callback) {
    var loader;
    loader = new THREE.JSONLoader();
    return loader.load(modelPath, function(geometry, materials) {
      var mesh;
      if (materials === void 0) {
        materials = [material];
      }
      mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      return callback(mesh);
    });
  };

  loadModelWithAnimation = function(modelPath, material, animationIndex, callback) {
    var loader;
    loader = new THREE.JSONLoader();
    return loader.load(modelPath, function(geometry, materials) {
      var animationClipName, index, mesh;
      mesh = new THREE.SkinnedMesh(geometry, material);
      if (!isNaN(animationIndex)) {
        material.skinning = true;
        index = animationIndex;
        animationClipName = mesh.geometry.animations[index].name;
        THREE.AnimationHandler.add(mesh.geometry.animations[index]);
        mesh.animation = new THREE.Animation(mesh, animationClipName, THREE.AnimationHandler.CATMULLROM);
        mesh.animation.play();
      }
      return callback(mesh);
    });
  };

  generatePosition = function(e) {
    if (e.changedTouches !== void 0 && e.changedTouches.length > 0) {
      e.position = {
        x: e.changedTouches[0].pageX,
        y: e.changedTouches[0].pageY
      };
    } else {
      e.position = {
        x: e.pageX,
        y: e.pageY
      };
    }
    return e;
  };

}).call(this);
