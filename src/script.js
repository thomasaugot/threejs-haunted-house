import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#03040a");
scene.fog = new THREE.FogExp2("#03040a", 0.04);

// textures

const textureLoader = new THREE.TextureLoader();

/**
 * House
 */

// floor
const floorGeometry = new THREE.PlaneGeometry(60, 60, 120, 120);
const floorPositions = floorGeometry.attributes.position;
const getTerrainHeight = (x, z) => {
  const dist = Math.sqrt(x * x + z * z);
  const centerFlatness = THREE.MathUtils.clamp((dist - 3.5) / 8, 0, 1);
  const macroWaves = Math.sin(x * 0.23) * Math.cos(z * 0.27) * 0.75;
  const microWaves = Math.sin((x + z) * 0.8) * 0.12;
  const rimLift = THREE.MathUtils.smoothstep(dist, 10, 24) * 0.65;

  return (macroWaves + microWaves) * centerFlatness + rimLift;
};

for (let i = 0; i < floorPositions.count; i++) {
  const x = floorPositions.getX(i);
  const z = floorPositions.getY(i);
  floorPositions.setZ(i, getTerrainHeight(x, z));
}

floorGeometry.computeVertexNormals();

const floorAlphaTexture = textureLoader.load("/textures/floor/alpha.jpg");
const floorColorTexture = textureLoader.load(
  "/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg",
);
const floorArmTexture = textureLoader.load(
  "/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg",
);
const floorNormalTexture = textureLoader.load(
  "/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg",
);
const floorDisplacementTexture = textureLoader.load(
  "/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.jpg",
);

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

floorColorTexture.repeat.set(8, 8);
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;

floorArmTexture.repeat.set(8, 8);
floorArmTexture.wrapS = THREE.RepeatWrapping;
floorArmTexture.wrapT = THREE.RepeatWrapping;

floorNormalTexture.repeat.set(8, 8);
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;

floorDisplacementTexture.repeat.set(8, 8);
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

const floor = new THREE.Mesh(
  floorGeometry,
  new THREE.MeshStandardMaterial({
    alphaMap: floorAlphaTexture,
    transparent: true,
    map: floorColorTexture,
    aoMap: floorArmTexture,
    roughnessMap: floorArmTexture,
    metalnessMap: floorArmTexture,
    normalMap: floorNormalTexture,
    displacementMap: floorDisplacementTexture,
    displacementScale: 0.21,
    displacementBias: -0.1,
  }),
);

floor.rotation.x = -Math.PI * 0.5; // Rotate the floor to be horizontal
scene.add(floor);

gui
  .add(floor.material, "displacementScale")
  .min(0)
  .max(1)
  .step(0.01)
  .name("floor displacement");
gui
  .add(floor.material, "displacementBias")
  .min(-0.5)
  .max(0.5)
  .step(0.01)
  .name("floor displacement bias");

// House container (contains all the house elements so we can move them together)
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({ color: "#ac8e82" }),
);
walls.position.y += 1.25;

const wallsColorTexture = textureLoader.load(
  "/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg",
);
const wallsArmTexture = textureLoader.load(
  "/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg",
);
const wallsNormalTexture = textureLoader.load(
  "/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg",
);

wallsColorTexture.colorSpace = THREE.SRGBColorSpace;

wallsColorTexture.wrapS = THREE.RepeatWrapping;
wallsColorTexture.wrapT = THREE.RepeatWrapping;
wallsColorTexture.repeat.set(2, 2);

wallsArmTexture.wrapS = THREE.RepeatWrapping;
wallsArmTexture.wrapT = THREE.RepeatWrapping;
wallsArmTexture.repeat.set(2, 2);

wallsNormalTexture.wrapS = THREE.RepeatWrapping;
wallsNormalTexture.wrapT = THREE.RepeatWrapping;
wallsNormalTexture.repeat.set(2, 2);

walls.material.map = wallsColorTexture;
walls.material.aoMap = wallsArmTexture;
walls.material.roughnessMap = wallsArmTexture;
walls.material.metalnessMap = wallsArmTexture;
walls.material.normalMap = wallsNormalTexture;

house.add(walls); // make sure we add to the hosue and not the scene

// Roof
const roofColorTexture = textureLoader.load(
  "/textures/roof/grey_roof_tiles_02_diff_1k.jpg",
);
const roofArmTexture = textureLoader.load(
  "/textures/roof/grey_roof_tiles_02_arm_1k.jpg",
);
const roofNormalTexture = textureLoader.load(
  "/textures/roof/grey_roof_tiles_02_nor_gl_1k.jpg",
);
const roofDisplacementTexture = textureLoader.load(
  "/textures/roof/grey_roof_tiles_02_disp_1k.jpg",
);

roofColorTexture.colorSpace = THREE.SRGBColorSpace;

const roofTextureMaps = [
  roofColorTexture,
  roofArmTexture,
  roofNormalTexture,
  roofDisplacementTexture,
];

for (const texture of roofTextureMaps) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
}

const roof = new THREE.Mesh(
  new THREE.CylinderGeometry(0.45, 3.5, 1, 4, 24, false),
  new THREE.MeshStandardMaterial({ color: "#ffffff" }),
);
roof.position.y += 2.5 + 0.5;
roof.rotation.y = Math.PI * 0.25;
roof.material.map = roofColorTexture;
roof.material.aoMap = roofArmTexture;
roof.material.roughnessMap = roofArmTexture;
roof.material.metalnessMap = roofArmTexture;
roof.material.normalMap = roofNormalTexture;
roof.material.displacementMap = roofDisplacementTexture;
roof.material.displacementScale = 0;
roof.material.displacementBias = 0;
roof.material.normalScale.set(1, 1);

house.add(roof);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(1.25, 2, 100, 100),
  new THREE.MeshStandardMaterial({ color: "#aa7b7b" }),
);
door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2),
);
door.position.y += 1;
door.position.z += 2 + 0.01; // move the door slightly in front of the walls to prevent z-fighting

const doorColorTexture = textureLoader.load(
  "/textures/door/color.jpg",
);
const doorAoTexture = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg",
);
const doorRoughnessTexture = textureLoader.load(
  "/textures/door/roughness.jpg",
);
const doorMetalnessTexture = textureLoader.load(
  "/textures/door/metalness.jpg",
);
const doorHeightTexture = textureLoader.load(
  "/textures/door/height.jpg",
);
const doorAlphaTexture = textureLoader.load(
  "/textures/door/alpha.jpg",
);
const doorNormalTexture = textureLoader.load(
  "/textures/door/normal.jpg",
);

doorColorTexture.colorSpace = THREE.SRGBColorSpace;

doorColorTexture.wrapS = THREE.RepeatWrapping;
doorColorTexture.wrapT = THREE.RepeatWrapping;
doorColorTexture.repeat.set(1, 1);

doorAoTexture.wrapS = THREE.RepeatWrapping;
doorAoTexture.wrapT = THREE.RepeatWrapping;
doorAoTexture.repeat.set(1, 1);

doorRoughnessTexture.wrapS = THREE.RepeatWrapping;
doorRoughnessTexture.wrapT = THREE.RepeatWrapping;
doorRoughnessTexture.repeat.set(1, 1);

doorMetalnessTexture.wrapS = THREE.RepeatWrapping;
doorMetalnessTexture.wrapT = THREE.RepeatWrapping;
doorMetalnessTexture.repeat.set(1, 1);

doorHeightTexture.wrapS = THREE.RepeatWrapping;
doorHeightTexture.wrapT = THREE.RepeatWrapping;
doorHeightTexture.repeat.set(1, 1);

doorAlphaTexture.wrapS = THREE.RepeatWrapping;
doorAlphaTexture.wrapT = THREE.RepeatWrapping;
doorAlphaTexture.repeat.set(1, 1);

doorNormalTexture.wrapS = THREE.RepeatWrapping;
doorNormalTexture.wrapT = THREE.RepeatWrapping;
doorNormalTexture.repeat.set(1, 1);

door.material.map = doorColorTexture;
door.material.alphaMap = doorAlphaTexture;
door.material.transparent = true;
door.material.aoMap = doorAoTexture;
door.material.roughnessMap = doorRoughnessTexture;
door.material.metalnessMap = doorMetalnessTexture;
door.material.normalMap = doorNormalTexture;
door.material.displacementMap = doorHeightTexture;
door.material.displacementScale = 0.15;
door.material.displacementBias = -0.02;

house.add(door);

// windows
const windowGlassMaterial = new THREE.MeshStandardMaterial({
  color: "#8fa9bd",
  roughness: 0.35,
  metalness: 0.04,
  emissive: "#6f9bc0",
  emissiveIntensity: 0.32,
});
const windowFrameMaterial = new THREE.MeshStandardMaterial({
  color: "#2a2d31",
  roughness: 0.9,
  metalness: 0.08,
});

const createWindowUnit = (x, y, z) => {
  const group = new THREE.Group();
  const windowWidth = 0.75;
  const windowHeight = 0.75;
  const frameThickness = 0.07;
  const frameDepth = 0.05;
  const paneInset = 0.01;

  const pane = new THREE.Mesh(
    new THREE.PlaneGeometry(
      windowWidth - frameThickness * 2 - 0.02,
      windowHeight - frameThickness * 2 - 0.02,
    ),
    windowGlassMaterial,
  );
  pane.position.z = frameDepth * 0.5 - paneInset;
  group.add(pane);

  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth, frameThickness, frameDepth),
    windowFrameMaterial,
  );
  topFrame.position.y = windowHeight * 0.5 - frameThickness * 0.5;
  group.add(topFrame);

  const bottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth, frameThickness, frameDepth),
    windowFrameMaterial,
  );
  bottomFrame.position.y = -windowHeight * 0.5 + frameThickness * 0.5;
  group.add(bottomFrame);

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, windowHeight - frameThickness * 2, frameDepth),
    windowFrameMaterial,
  );
  leftFrame.position.x = -windowWidth * 0.5 + frameThickness * 0.5;
  group.add(leftFrame);

  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, windowHeight - frameThickness * 2, frameDepth),
    windowFrameMaterial,
  );
  rightFrame.position.x = windowWidth * 0.5 - frameThickness * 0.5;
  group.add(rightFrame);

  const verticalMullion = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, windowHeight - frameThickness * 2, frameDepth * 0.8),
    windowFrameMaterial,
  );
  group.add(verticalMullion);

  const horizontalMullion = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth - frameThickness * 2, 0.04, frameDepth * 0.8),
    windowFrameMaterial,
  );
  group.add(horizontalMullion);

  group.position.set(x, y, z + 0.015);
  return group;
};

const window1 = createWindowUnit(-1.25, 1.5, 2);
const window2 = createWindowUnit(1.25, 1.5, 2);
house.add(window1, window2);

// Bushes
const bushColorTexture = textureLoader.load(
  "/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.jpg",
);
const bushArmTexture = textureLoader.load(
  "/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.jpg",
);
const bushNormalTexture = textureLoader.load(
  "/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.jpg",
);

bushColorTexture.colorSpace = THREE.SRGBColorSpace;

bushColorTexture.wrapS = THREE.RepeatWrapping;
bushColorTexture.wrapT = THREE.RepeatWrapping;
bushColorTexture.repeat.set(1, 1);

bushArmTexture.wrapS = THREE.RepeatWrapping;
bushArmTexture.wrapT = THREE.RepeatWrapping;
bushArmTexture.repeat.set(1, 1);

bushNormalTexture.wrapS = THREE.RepeatWrapping;
bushNormalTexture.wrapT = THREE.RepeatWrapping;
bushNormalTexture.repeat.set(1, 1);

const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: "#89c854" });
bushMaterial.map = bushColorTexture;
bushMaterial.aoMap = bushArmTexture;
bushMaterial.roughnessMap = bushArmTexture;
bushMaterial.metalnessMap = bushArmTexture;
bushMaterial.normalMap = bushNormalTexture;

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
bush1.rotation.x = - 0.75;

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);

house.add(bush1, bush2, bush3, bush4);

// Graves
const graveColorTexture = textureLoader.load(
  "/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg",
);
const graveArmTexture = textureLoader.load(
  "/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg",
);
const graveNormalTexture = textureLoader.load(
  "/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg",
);

graveColorTexture.colorSpace = THREE.SRGBColorSpace;

graveColorTexture.wrapS = THREE.RepeatWrapping;
graveColorTexture.wrapT = THREE.RepeatWrapping;
graveColorTexture.repeat.set(1, 1);

graveArmTexture.wrapS = THREE.RepeatWrapping;
graveArmTexture.wrapT = THREE.RepeatWrapping;
graveArmTexture.repeat.set(1, 1);

graveNormalTexture.wrapS = THREE.RepeatWrapping;
graveNormalTexture.wrapT = THREE.RepeatWrapping;
graveNormalTexture.repeat.set(1, 1);

const graves = new THREE.Group();
scene.add(graves);

const graveMaterial = new THREE.MeshStandardMaterial({
  color: "#b2b6b1",
  roughness: 0.95,
});
graveMaterial.map = graveColorTexture;
graveMaterial.roughnessMap = graveArmTexture;
graveMaterial.metalnessMap = graveArmTexture;
graveMaterial.normalMap = graveNormalTexture;

const graveDarkMaterial = new THREE.MeshStandardMaterial({
  color: "#9ea39e",
  roughness: 0.98,
});
graveDarkMaterial.map = graveColorTexture;
graveDarkMaterial.roughnessMap = graveArmTexture;
graveDarkMaterial.metalnessMap = graveArmTexture;
graveDarkMaterial.normalMap = graveNormalTexture;

const crossMaterial = new THREE.MeshStandardMaterial({
  color: "#d6d6d6",
  roughness: 0.9,
});

const slabGraveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.22);
const plaqueGeometry = new THREE.BoxGeometry(0.28, 0.16, 0.02);
const frontCrossVerticalGeometry = new THREE.BoxGeometry(0.07, 0.28, 0.025);
const frontCrossHorizontalGeometry = new THREE.BoxGeometry(0.2, 0.06, 0.025);

const roundedShape = new THREE.Shape();
roundedShape.moveTo(-0.3, -0.4);
roundedShape.lineTo(0.3, -0.4);
roundedShape.lineTo(0.3, 0.16);
roundedShape.absarc(0, 0.16, 0.3, 0, Math.PI, false);
roundedShape.lineTo(-0.3, -0.4);

const roundedGraveGeometry = new THREE.ExtrudeGeometry(roundedShape, {
  depth: 0.22,
  bevelEnabled: false,
});
roundedGraveGeometry.translate(0, 0, -0.11);

const crossBaseGeometry = new THREE.BoxGeometry(0.62, 0.16, 0.26);
const crossBodyGeometry = new THREE.BoxGeometry(0.24, 0.92, 0.2);
const crossArmsGeometry = new THREE.BoxGeometry(0.58, 0.2, 0.2);

const addFrontCross = (graveModel, frontZ, yBase) => {
  const frontCrossVertical = new THREE.Mesh(
    frontCrossVerticalGeometry,
    crossMaterial,
  );
  frontCrossVertical.position.set(0, yBase, frontZ);
  graveModel.add(frontCrossVertical);

  const frontCrossHorizontal = new THREE.Mesh(
    frontCrossHorizontalGeometry,
    crossMaterial,
  );
  frontCrossHorizontal.position.set(0, yBase + 0.08, frontZ);
  graveModel.add(frontCrossHorizontal);
};

const createGraveModel = (typeRoll) => {
  const graveModel = new THREE.Group();

  if (typeRoll < 0.4) {
    const slab = new THREE.Mesh(slabGraveGeometry, graveMaterial);
    slab.position.y = 0.4;
    graveModel.add(slab);

    const plaque = new THREE.Mesh(plaqueGeometry, graveDarkMaterial);
    plaque.position.set(0, 0.32, 0.121);
    graveModel.add(plaque);

    addFrontCross(graveModel, 0.126, 0.47);
  } else if (typeRoll < 0.78) {
    const rounded = new THREE.Mesh(roundedGraveGeometry, graveMaterial);
    rounded.position.y = 0.4;
    graveModel.add(rounded);

    const plaque = new THREE.Mesh(plaqueGeometry, graveDarkMaterial);
    plaque.position.set(0, 0.3, 0.121);
    graveModel.add(plaque);

    addFrontCross(graveModel, 0.126, 0.43);
  } else {
    const crossBase = new THREE.Mesh(crossBaseGeometry, graveDarkMaterial);
    crossBase.position.y = 0.08;
    graveModel.add(crossBase);

    const crossBody = new THREE.Mesh(crossBodyGeometry, graveMaterial);
    crossBody.position.y = 0.54;
    graveModel.add(crossBody);

    const crossArms = new THREE.Mesh(crossArmsGeometry, graveMaterial);
    crossArms.position.y = 0.67;
    graveModel.add(crossArms);
  }

  return graveModel;
};

for (let i = 0; i < 30; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 6;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const graveGroup = new THREE.Group();
  graveGroup.position.set(x, 0, z);
  graveGroup.rotation.y = (Math.random() - 0.5) * 0.4;
  graveGroup.rotation.z = (Math.random() - 0.5) * 0.2;

  const graveModel = createGraveModel(Math.random());
  graveModel.rotation.y = (Math.random() - 0.5) * 0.1;
  graveGroup.add(graveModel);

  graves.add(graveGroup);
}

// Trees
const trees = new THREE.Group();
scene.add(trees);

const treeTrunkGeometry = new THREE.CylinderGeometry(0.07, 0.11, 1.1, 10);
const treeFoliageGeometry = new THREE.ConeGeometry(0.54, 1.2, 12);
const treeTrunkMaterial = new THREE.MeshStandardMaterial({
  color: "#2a2018",
  roughness: 0.94,
  metalness: 0,
});
const treeFoliageMaterial = new THREE.MeshStandardMaterial({
  color: "#1d3527",
  roughness: 0.92,
  metalness: 0,
});

const treeSwayData = [];

const createTree = () => {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
  trunk.position.y = 0.55;
  tree.add(trunk);

  const lowerFoliage = new THREE.Mesh(treeFoliageGeometry, treeFoliageMaterial);
  lowerFoliage.position.y = 1.08;
  lowerFoliage.scale.set(1, 0.95, 1);
  tree.add(lowerFoliage);

  const upperFoliage = new THREE.Mesh(treeFoliageGeometry, treeFoliageMaterial);
  upperFoliage.position.y = 1.55;
  upperFoliage.scale.set(0.72, 0.76, 0.72);
  tree.add(upperFoliage);

  return tree;
};

for (let i = 0; i < 24; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 10 + Math.random() * 12;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const tree = createTree();
  const scale = 0.72 + Math.random() * 0.6;

  tree.position.set(x, getTerrainHeight(x, z), z);
  tree.scale.setScalar(scale);
  tree.rotation.y = Math.random() * Math.PI * 2;

  trees.add(tree);
  treeSwayData.push({
    tree,
    baseX: tree.rotation.x,
    baseZ: tree.rotation.z,
    phase: Math.random() * Math.PI * 2,
    speed: 0.55 + Math.random() * 0.6,
    amplitude: 0.014 + Math.random() * 0.018,
  });
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#9cb0d8", 0.34);
scene.add(ambientLight);

// Moon + moonlight
const moonColorTexture = textureLoader.load("/textures/moon/moon_01_diff_1k.jpg");
const moonArmTexture = textureLoader.load("/textures/moon/moon_01_arm_1k.jpg");
const moonNormalTexture = textureLoader.load("/textures/moon/moon_01_nor_gl_1k.jpg");
const moonDisplacementTexture = textureLoader.load("/textures/moon/moon_01_disp_1k.jpg");

moonColorTexture.colorSpace = THREE.SRGBColorSpace;

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 32, 32),
  new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: moonColorTexture,
    aoMap: moonArmTexture,
    roughnessMap: moonArmTexture,
    metalnessMap: moonArmTexture,
    normalMap: moonNormalTexture,
    displacementMap: moonDisplacementTexture,
    displacementScale: 0.03,
    displacementBias: -0.015,
    emissive: "#9fb4dd",
    emissiveIntensity: 0.45,
    roughness: 0.85,
    metalness: 0.02,
  }),
);
moon.position.set(12, 13, 18);
scene.add(moon);

const moonHalo = new THREE.Mesh(
  new THREE.SphereGeometry(1.8, 24, 24),
  new THREE.MeshBasicMaterial({
    color: "#9bb5e6",
    transparent: true,
    opacity: 0.14,
    side: THREE.BackSide,
  }),
);
moon.add(moonHalo);

const directionalLight = new THREE.DirectionalLight("#b5c7ee", 1.85);
directionalLight.position.copy(moon.position);
scene.add(directionalLight);

const moonFillLight = new THREE.PointLight("#87a8e8", 0.35, 55);
moonFillLight.position.copy(moon.position);
scene.add(moonFillLight);

const doorLight = new THREE.PointLight("#ff7d46", 1.2, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

// Ghosts
const ghostBodyGeometry = new THREE.CapsuleGeometry(0.19, 0.34, 12, 24);
const ghostEyeGeometry = new THREE.SphereGeometry(0.02, 12, 12);
const ghostMouthGeometry = new THREE.SphereGeometry(0.028, 14, 14);
const ghostFabricColorTexture = textureLoader.load(
  "/textures/ghosts/cotton_jersey_diff_1k.jpg",
);
const ghostFabricArmTexture = textureLoader.load(
  "/textures/ghosts/cotton_jersey_arm_1k.jpg",
);
const ghostFabricNormalTexture = textureLoader.load(
  "/textures/ghosts/cotton_jersey_nor_gl_1k.jpg",
);
const ghostFaceMaterial = new THREE.MeshStandardMaterial({
  color: "#090d16",
  roughness: 0.85,
  metalness: 0,
  emissive: "#05080f",
  emissiveIntensity: 0.18,
});

ghostFabricColorTexture.colorSpace = THREE.SRGBColorSpace;

const ghostTextureMaps = [
  ghostFabricColorTexture,
  ghostFabricArmTexture,
  ghostFabricNormalTexture,
];

for (const texture of ghostTextureMaps) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.4, 1.4);
}

const createGhost = (color) => {
  const ghost = new THREE.Group();
  const bodyGroup = new THREE.Group();
  ghost.add(bodyGroup);

  const ghostMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.2,
    map: ghostFabricColorTexture,
    aoMap: ghostFabricArmTexture,
    roughnessMap: ghostFabricArmTexture,
    metalnessMap: ghostFabricArmTexture,
    normalMap: ghostFabricNormalTexture,
    transparent: true,
    opacity: 0.48,
    roughness: 0.78,
    metalness: 0,
    depthWrite: false,
  });

  const body = new THREE.Mesh(ghostBodyGeometry, ghostMaterial);
  body.position.y = 0.32;
  bodyGroup.add(body);

  const leftEye = new THREE.Mesh(ghostEyeGeometry, ghostFaceMaterial);
  leftEye.position.set(-0.06, 0.405, 0.152);
  leftEye.scale.set(0.9, 1.4, 0.26);
  bodyGroup.add(leftEye);

  const rightEye = new THREE.Mesh(ghostEyeGeometry, ghostFaceMaterial);
  rightEye.position.set(0.06, 0.405, 0.152);
  rightEye.scale.set(0.9, 1.4, 0.26);
  bodyGroup.add(rightEye);

  const mouth = new THREE.Mesh(ghostMouthGeometry, ghostFaceMaterial);
  mouth.position.set(0, 0.335, 0.154);
  mouth.scale.set(0.5, 1.6, 0.24);
  bodyGroup.add(mouth);

  const glow = new THREE.PointLight(color, 0.95, 2.1);
  glow.position.set(0, 0.36, 0);
  ghost.add(glow);

  scene.add(ghost);

  return { ghost, bodyGroup };
};

const ghost1 = createGhost("#d6deea");
const ghost2 = createGhost("#cdd5e0");
const ghost3 = createGhost("#e2e6ed");

// Starry sky
const starsCount = 1200;
const starPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount; i++) {
  const i3 = i * 3;
  const radius = 14 + Math.random() * 20;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 0.65;

  starPositions[i3] = Math.cos(theta) * Math.sin(phi) * radius;
  starPositions[i3 + 1] = Math.cos(phi) * radius + 3;
  starPositions[i3 + 2] = Math.sin(theta) * Math.sin(phi) * radius;
}

const starsGeometry = new THREE.BufferGeometry();
starsGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3),
);

const starsMaterial = new THREE.PointsMaterial({
  color: "#cfd8ff",
  size: 0.06,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Sharpen textures when seen at grazing angles (e.g. roof from camera perspective).
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
const sceneTextureMaps = [
  floorColorTexture,
  floorArmTexture,
  floorNormalTexture,
  floorDisplacementTexture,
  wallsColorTexture,
  wallsArmTexture,
  wallsNormalTexture,
  roofColorTexture,
  roofArmTexture,
  roofNormalTexture,
  roofDisplacementTexture,
];

for (const texture of sceneTextureMaps) {
  texture.anisotropy = maxAnisotropy;
}

/**
 * Animate
 */
const timer = new Timer();

const tick = () => {
  // Timer
  timer.update();
  const elapsedTime = timer.getElapsed();

  // Ghost animation
  const ghost1Angle = elapsedTime * 0.5;
  ghost1.ghost.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.ghost.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.ghost.position.y = Math.sin(elapsedTime * 2.2) * 0.2 + 1;
  ghost1.ghost.rotation.y = -ghost1Angle;
  ghost1.bodyGroup.rotation.z = Math.sin(elapsedTime * 1.8) * 0.1;
  ghost1.bodyGroup.scale.y = 1 + Math.sin(elapsedTime * 3.2) * 0.04;

  const ghost2Angle = -elapsedTime * 0.32;
  ghost2.ghost.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.ghost.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.ghost.position.y =
    (Math.sin(elapsedTime * 2.6) + Math.sin(elapsedTime * 1.7)) * 0.16 + 1.15;
  ghost2.ghost.rotation.y = -ghost2Angle;
  ghost2.bodyGroup.rotation.z = Math.sin(elapsedTime * 2.3 + 1.2) * 0.08;
  ghost2.bodyGroup.scale.y = 1 + Math.sin(elapsedTime * 3.7 + 0.5) * 0.03;

  const ghost3Angle = -elapsedTime * 0.18;
  ghost3.ghost.position.x =
    Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  ghost3.ghost.position.z =
    Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  ghost3.ghost.position.y =
    (Math.sin(elapsedTime * 3.3) + Math.sin(elapsedTime * 1.9)) * 0.15 + 1.2;
  ghost3.ghost.rotation.y = -ghost3Angle;
  ghost3.bodyGroup.rotation.z = Math.sin(elapsedTime * 2.1 + 2.4) * 0.1;
  ghost3.bodyGroup.scale.y = 1 + Math.sin(elapsedTime * 4.2 + 1.4) * 0.035;

  // Sky animation
  stars.rotation.y = elapsedTime * 0.01;
  starsMaterial.opacity = 0.8 + Math.sin(elapsedTime * 0.8) * 0.1;
  moon.material.emissiveIntensity = 0.52 + Math.sin(elapsedTime * 0.6) * 0.05;
  moonHalo.material.opacity = 0.12 + Math.sin(elapsedTime * 0.6) * 0.03;

  for (const sway of treeSwayData) {
    const swayTime = elapsedTime * sway.speed + sway.phase;
    sway.tree.rotation.x = sway.baseX + Math.sin(swayTime) * sway.amplitude;
    sway.tree.rotation.z = sway.baseZ + Math.cos(swayTime * 0.85) * sway.amplitude * 0.7;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
