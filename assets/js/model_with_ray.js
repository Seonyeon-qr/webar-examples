
// Define variables
let scene,
    camera,
    renderer,
    mesh,
    mixer,
    clock = new THREE.Clock();

// Ray
let mouse = new THREE.Vector2();
let INTERSECTED,
    raycaster;

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

  // 3. Raycaster
  raycaster = new THREE.Raycaster();
  document.addEventListener('touchstart', onDocumentTouchStart, false);

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

    // Instantiate a gltf loader
    let loader = new THREE.GLTFLoader();
    loader.load('https://intra.letsee.io/3D-model/gltf/ulsan/UlsanNorthMapL2.glb', function(gltf) {

      gltf.scene.position.set(0, 0, 0);
      gltf.scene.rotateX(Math.PI/180 * 90);
      gltf.scene.scale.setScalar(30);

      // Play model's animation
      if (gltf.animations.length) {
        /*mixer = new THREE.AnimationMixer( gltf.scene );
        let action = mixer.clipAction( gltf.animations[ 0 ] );
        action.play();*/
      }
      else console.warn(`Model does not have animation`);

      resolve(gltf.scene);

    }, onProgress, onError);
  })

}

/**
 * Get touch coordinates when user touch on screen.
 * @param event
 */
function onDocumentTouchStart(event) {
  const scaled = letsee.threeRenderer().getEffectiveSize();
  mouse.x = +(event.changedTouches[0].pageX / scaled.effectiveWidth) * 2 - 1;
  mouse.y = -(event.changedTouches[0].pageY / scaled.effectiveHeight) * 2 + 1;

  findIntersection();
}

/**
 * Find the intersection of the 3D model and touch event.
 */
function findIntersection() {
  raycaster.setFromCamera(mouse, camera);

  if (mesh !== undefined) {

    const intersects = raycaster.intersectObjects(mesh.children, true);

    if ( intersects.length > 0 ) {

      INTERSECTED = intersects[ 0 ].object;

      if (INTERSECTED && INTERSECTED.type !== 'AxesHelper') {
        console.error(INTERSECTED);

        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex( 0xff0000 );

        setTimeout(() => {
          INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        }, 1000)
      }
    }

  }
}