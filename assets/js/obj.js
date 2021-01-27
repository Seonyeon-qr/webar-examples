
// Define variables
let scene,
    camera,
    renderer,
    mesh,
    mixer,
    clock = new THREE.Clock();

const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (item, loaded, total) => console.log(item, loaded, total);

/**
 * Show the progress of loading model
 * @param xhr
 */
function onProgress(xhr) {
  if (xhr.lengthComputable) {
    const percentComplete = xhr.loaded / xhr.total * 100;
    console.warn(Math.round(percentComplete) + '%');
  }
}

/**
 * Show error if loading error.
 * @param e
 */
function onError(e) {
  console.error(e);
}

/**
 * Initialize world.
 */
function initWorld() {

  console.warn(`THREE.REVISION: ${THREE.REVISION}`);

  initScene();
  proceedModel();

}

/**
 * Initialize Scene.
 */
function initScene() {

  // 1. Add lights
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  ambientLight.position.set(0, 0, 0);
  scene.add(ambientLight);

  let dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight.position.set(-0.5, 0.5, 0.866);
  dirLight.castShadow = false;
  dirLight.shadow.mapSize = new THREE.Vector2(512, 512);
  scene.add(dirLight);

  // 2. Set light effects for renderer
  renderer.toneMappingExposure = 1;
  renderer.toneMapping = 0;
  renderer.gammaFactor = 2;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights=true;

}

/**
 * 1. Load whole model of fridge and other objects.
 * 2. Make animation clips.
 * 3. Add model into Entity.
 */
function proceedModel() {
  letsee.addTarget('letsee-marker.json').then(entity => {

    // 1. Load model
    loadModel()
    .then(model => {
      mesh = model;

      // 2.Add mesh into entity
      entity.add(mesh);

      // 3. Add entity to scene
      scene.add(entity);

    });

    // Render all
    const renderAll = async function() {
      requestAnimationFrame(renderAll);

      if (mixer) {
        let delta = clock.getDelta();
        mixer.update(delta);
      }

      camera = letsee.threeRenderer().getDeviceCamera();
      await letsee.threeRenderer().update();

      renderer.render(scene, camera);
    };

    renderAll();
  });
}

/**
 * 1. Load model.
 * 2. Play model animation.
 */
function loadModel() {
  return new Promise((resolve) => {

    // Instantiate mtlLoader
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('https://intra.letsee.io/3D-model/obj/cube/');
    mtlLoader.load('Cube_obj.mtl', (materials) => {

      // Preload the materials
      materials.preload();

      let objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('https://intra.letsee.io/3D-model/obj/cube/');
      objLoader.load('Cube_obj.obj', (obj) => {

        obj.position.set(0, -50, 0);
        obj.scale.setScalar(0.7);
        obj.rotateY(Math.PI/180 * 60);
        obj.add(new THREE.AxesHelper(300));

        resolve(obj);
      }, onProgress, onError)

    })
  })

}