{
    onInit: (meta3dState, api, gameObject) => {
        /*! shared functions
        * 
        */
        globalThis._getAllLevelData = () => {
            return [
                {
                    sceneName: "background_1",
                    foodLocalPosition: [5, 0, 5]
                },
                {
                    sceneName: "background_2",
                    foodLocalPosition: [-5, 0, 5]
                }
            ]
        }
        globalThis._getLevelData = (level) => {
            return globalThis._getAllLevelData()[level]
        }
        globalThis._findGameObjectByName = (meta3dState, api, name) => {
            let engineSceneService = api.getEngineSceneService(meta3dState)

            return api.nullable.getExn(engineSceneService.gameObject.getAllGameObjects(meta3dState).find(gameObject => {
                return engineSceneService.gameObject.getGameObjectName(meta3dState, gameObject) == name
            }))
        }
        globalThis._setState = (meta3dState, api, gameObject, state) => {
            let engineSceneService = api.getEngineSceneService(meta3dState)

            return engineSceneService.script.setAttribute(meta3dState, engineSceneService.gameObject.getScript(meta3dState, gameObject), state)
        }
        globalThis._saveDirection = (event) => {
            let direction = null

            switch (event.which) {
                //a
                case 65:
                    direction = "forward"
                    break
                //d
                case 68:
                    direction = "backward"
                    break
                //w
                case 87:
                    direction = "right"
                    break
                //s
                case 83:
                    direction = "left"
                    break
                default:
                    direction = null
                    break
            }

            globalThis["meta3d_snake_direction"] = direction
        }
        globalThis._showScene = (meta3dState, api, level) => {
            let engineSceneService = api.getEngineSceneService(meta3dState)

            meta3dState = globalThis._getAllLevelData().reduce((meta3dState, { sceneName }, i) => {
                let background_2 = globalThis._findGameObjectByName(meta3dState, api, sceneName)

                let transform = engineSceneService.gameObject.getTransform(meta3dState, background_2)


                if (i == level) {
                    meta3dState = engineSceneService.transform.setLocalScale(meta3dState, transform, globalThis["meta3d_scene_localScale_" + i])
                }
                else {
                    meta3dState = engineSceneService.transform.setLocalScale(meta3dState, transform, [0, 0, 0])
                }

                return meta3dState
            }, meta3dState)

            return meta3dState
        }
        globalThis._resetSnake = () => {
            globalThis["meta3d_snake_direction"] = null
        }




        let _backup = (meta3dState, api) => {
            let engineSceneService = api.getEngineSceneService(meta3dState)

            globalThis._getAllLevelData().forEach(({ sceneName }, i) => {
                let background_2 = globalThis._findGameObjectByName(meta3dState, api, sceneName)

                let transform = engineSceneService.gameObject.getTransform(meta3dState, background_2)

                globalThis["meta3d_scene_localScale_" + i] = engineSceneService.transform.getLocalScale(meta3dState, transform)
            })
        }
        let _createState = () => {
            return {
                direction: null,
                level: 0,
                isFinish: false
            }
        }
        let _initScene = (meta3dState, api) => {
            let engineSceneService = api.getEngineSceneService(meta3dState)

            let arcballCameraController = engineSceneService.gameObject.getArcballCameraController(meta3dState, engineSceneService.basicCameraView.getGameObjects(meta3dState, engineSceneService.basicCameraView.getActiveCameraView(meta3dState, true))[0])



            meta3dState = engineSceneService.arcballCameraController.setDistance(meta3dState, arcballCameraController, 70)
            meta3dState = engineSceneService.arcballCameraController.setTheta(meta3dState, arcballCameraController, Math.PI / 8)


            return meta3dState
        }
        let _createCube = (meta3dState, api, name, diffuseColor, localPosition) => {
            let engineSceneService = api.getEngineSceneService(meta3dState)

            let data = engineSceneService.gameObject.createGameObject(meta3dState)
            meta3dState = data[0]
            let gameObject = data[1]

            meta3dState = engineSceneService.gameObject.setGameObjectName(meta3dState, gameObject, name)

            data = engineSceneService.transform.createTransform(meta3dState)
            meta3dState = data[0]
            let transform = data[1]

            meta3dState = engineSceneService.gameObject.addTransform(meta3dState, gameObject, transform)

            data = engineSceneService.geometry.createGeometry(meta3dState)
            meta3dState = data[0]
            let geometry = data[1]


            // Create a cube
            //    v6----- v5
            //   /|      /|
            //  v1------v0|
            //  | |     | |
            //  | |v7---|-|v4
            //  |/      |/
            //  v2------v3
            let vertices = new Float32Array([   // Coordinates
                1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
                1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
                1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
                -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
                -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
                1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0  // v4-v7-v6-v5 back
            ])
            let normals = new Float32Array([    // Normal
                0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
                1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
                0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
                -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
                0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
                0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
            ])
            let indices = new Uint32Array([
                0, 1, 2, 0, 2, 3,    // front
                4, 5, 6, 4, 6, 7,    // right
                8, 9, 10, 8, 10, 11,    // up
                12, 13, 14, 12, 14, 15,    // left
                16, 17, 18, 16, 18, 19,    // down
                20, 21, 22, 20, 22, 23     // back
            ])

            meta3dState = engineSceneService.geometry.setVertices(meta3dState, geometry, vertices)
            meta3dState = engineSceneService.geometry.setNormals(meta3dState, geometry, normals)
            meta3dState = engineSceneService.geometry.setIndices(meta3dState, geometry, indices)


            meta3dState = engineSceneService.gameObject.addGeometry(meta3dState, gameObject, geometry)



            data = engineSceneService.pbrMaterial.createPBRMaterial(meta3dState)
            meta3dState = data[0]
            let material = data[1]
            meta3dState = engineSceneService.pbrMaterial.setDiffuseColor(meta3dState, material, diffuseColor)
            meta3dState = engineSceneService.gameObject.addPBRMaterial(meta3dState, gameObject, material)


            meta3dState = engineSceneService.transform.setLocalPosition(meta3dState, transform, localPosition)


            return meta3dState
        }
        let _createSnakeBody = (meta3dState, api) => {
            return _createCube(meta3dState, api, "Snake", [1.0, 0.0, 0.0], [0.0, 0.0, 0.0])
        }
        let _createFood = (meta3dState, api, level) => {
            return _createCube(meta3dState, api, "Food", [0.0, 1.0, 0.0], globalThis._getLevelData(level).foodLocalPosition)
        }

        let _bindEvent = () => {
            globalThis.addEventListener("keydown", globalThis._saveDirection, false)
        }

        _backup(meta3dState, api)

        globalThis._resetSnake()

        let state = _createState()

        _bindEvent()

        meta3dState = globalThis._showScene(meta3dState, api, state.level)

        meta3dState = _initScene(meta3dState, api)

        meta3dState = _createSnakeBody(meta3dState, api)

        meta3dState = _createFood(meta3dState, api, state.level)

        meta3dState = globalThis._setState(meta3dState, api, gameObject, state)

        return Promise.resolve(meta3dState)
    },
    onUpdate: (meta3dState, api, gameObject) => {
        //TODO refactor: duplicate

        let _unsafeGetState = (meta3dState, api, gameObject) => {
            let engineSceneService = api.getEngineSceneService(meta3dState)

            return api.nullable.getExn(engineSceneService.script.getAttribute(meta3dState, engineSceneService.gameObject.getScript(meta3dState, gameObject)))
        }
        let _updateState = (meta3dState, api, gameObject) => {
            return globalThis._setState(meta3dState, api, gameObject, {
                ..._unsafeGetState(meta3dState, api, gameObject),
                direction: globalThis["meta3d_snake_direction"]
            })
        }
        let _move = (meta3dState, api, gameObject, direction) => {
            let engineSceneService = api.getEngineSceneService(meta3dState)

            let transform = engineSceneService.gameObject.getTransform(meta3dState, gameObject)

            let localPosition = engineSceneService.transform.getLocalPosition(meta3dState, transform)
            let newPosition = localPosition

            let speed = 0.2


            switch (direction) {
                case "forward":
                    newPosition = [localPosition[0], localPosition[1], localPosition[2] + speed]
                    break
                case "backward":
                    newPosition = [localPosition[0], localPosition[1], localPosition[2] - speed]
                    break
                case "right":
                    newPosition = [localPosition[0] - speed, localPosition[1], localPosition[2]]
                    break
                case "left":
                    newPosition = [localPosition[0] + speed, localPosition[1], localPosition[2]]
                    break
                default:
                    throw new Error("error")

            }

            return engineSceneService.transform.setLocalPosition(meta3dState, transform, newPosition)
        }
        let _moveSnake = (meta3dState, api, gameObject) => {
            let snake = globalThis._findGameObjectByName(meta3dState, api, "Snake")

            let { direction } = _unsafeGetState(meta3dState, api, gameObject)

            if (api.nullable.isNullable(direction)) {
                return meta3dState
            }

            return _move(meta3dState, api, snake, api.nullable.getExn(direction))
        }
        let _isEatFood = (meta3dState, api, level) => {
            let snake = globalThis._findGameObjectByName(meta3dState, api, "Snake")

            let engineSceneService = api.getEngineSceneService(meta3dState)

            let transform = engineSceneService.gameObject.getTransform(meta3dState, snake)

            let localPosition = engineSceneService.transform.getLocalPosition(meta3dState, transform)

            let foodLocalPosition = globalThis._getLevelData(level).foodLocalPosition

            return Math.abs(localPosition[0] - foodLocalPosition[0]) < 1 && Math.abs(localPosition[2] - foodLocalPosition[2]) < 1
        }
        let _moveToNextLevel = (meta3dState, api, gameObject, currentLevel) => {
            let maxLevel = globalThis._getAllLevelData().length - 1

            if (currentLevel >= maxLevel) {
                alert("恭喜您，通关了~")

                return [globalThis._setState(meta3dState, api, gameObject, {
                    ..._unsafeGetState(meta3dState, api, gameObject),
                    isFinish: true
                }), true]
            }

            alert("进入下一关！")
            return [globalThis._setState(meta3dState, api, gameObject, {
                ..._unsafeGetState(meta3dState, api, gameObject),
                level: currentLevel + 1
            }), false]
        }
        let _updateFood = (meta3dState, api, level) => {
            let food = globalThis._findGameObjectByName(meta3dState, api, "Food")

            let engineSceneService = api.getEngineSceneService(meta3dState)

            let transform = engineSceneService.gameObject.getTransform(meta3dState, food)

            return engineSceneService.transform.setLocalPosition(meta3dState, transform,
                globalThis._getLevelData(level).foodLocalPosition
            )
        }


        if (_unsafeGetState(meta3dState, api, gameObject).isFinish) {
            return Promise.resolve(meta3dState)
        }

        meta3dState = _updateState(meta3dState, api, gameObject)

        meta3dState = _moveSnake(meta3dState, api, gameObject)

        let { level } = _unsafeGetState(meta3dState, api, gameObject)
        if (_isEatFood(meta3dState, api, level)) {
            let data = _moveToNextLevel(meta3dState, api, gameObject, level)
            meta3dState = data[0]
            let isFinish = data[1]

            if (isFinish) {
                return Promise.resolve(meta3dState)
            }

            let newLevel = _unsafeGetState(meta3dState, api, gameObject).level
            meta3dState = globalThis._showScene(meta3dState, api, newLevel)
            meta3dState = _updateFood(meta3dState, api, newLevel)


            globalThis._resetSnake()
        }

        return Promise.resolve(meta3dState)
    },
    onStop: (meta3dState, api, gameObject) => {
        let _unbindEvent = () => {
            globalThis.removeEventListener("keydown", globalThis._saveDirection, false)
        }

        _unbindEvent()

        return Promise.resolve(meta3dState)
    },
}