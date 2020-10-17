console.log("hello world!");
const scene = document.querySelector("a-scene");
const onTime = 5000;
const minOffTime = onTime + 2000;
const maxOffTime = 10000;
const buttonOnMaterial = "emissive: #fff; emissiveIntensity: 1;";
const buttonOffMaterial = "emissive: #00f; emissiveIntensity: 0.5;";

// Make an A-Frame element.
function makeElement(name, attributes, dest = scene) {
  const e = document.createElement(`a-${name}`);
  Object.entries(attributes).forEach(([key, value]) => {
    e.setAttribute(key, value);
  });

  dest.appendChild(e);
  return e;
}

// Make a new button.
function makeButton(scale, x, y, z, name) {
  const buttonHeight = 2;
  const buttonRadius = 4;
  const buttonHolder = makeElement("entity", {
    position: { x, y, z },
    id: name,
  });

  const innerButton = makeElement(
    "sphere",
    {
      position: { y: 0, z: -1 * scale, x: 0 },
      radius: buttonRadius * scale,
      color: "white",
      opacity: 1,
      shadow: false,
      roughness: 10,
      material: buttonOffMaterial,
      "sphere-collider": "objects: a-entity",
    },
    buttonHolder
  );

  const outerButton = makeElement(
    "cylinder",
    {
      position: { x: 0, y: 0, z: 0 },
      radius: buttonRadius * 1.25 * scale,
      color: "black",
      rotation: { x: -90, y: 0, z: 0 },
      height: (buttonHeight / 2) * scale,
      shadow: true,
      opacity: 1,
    },
    buttonHolder
  );
  /*
  const light = makeElement(
    "light",
    {
      position: { y: 0, z: 1.8 * scale, x: 0 },
      color: "white",
      type: "point",
      intensity: 0,
    },
    buttonHolder
  );
  // Debug sphere
  makeElement(
    "sphere",
    {
      position: { y: 0, z: 1.8 * scale, x: 0 },
      radius: 1 * scale,
      color: "white",
      opacity: 0,
      shadow: false,
      roughness: 1,
    },
    buttonHolder
  );
*/

  let touched = false;
  innerButton.addEventListener("hit", (e) => {
    if (e.detail.el !== null && touched === false) {
      touched = true;
      console.log("Touch button", e.detail.el.id, name);
      light.setAttribute("color", "green");
      light.setAttribute("intensity", 1);
    }
  });

  innerButton.addEventListener("hitend", (e) => {
    if (e.detail.el !== null && touched === true) {
      touched = false;
      console.log("STOP touch button", e.detail.el.id, name);
      light.setAttribute("color", "white");
    }
  });

  // Create timer to manage on's and off's.
  const offTime = Math.round(maxOffTime * Math.random() + minOffTime);
  // Keep light off until...
  setInterval(() => {
    // Turn light on.
    innerButton.setAttribute("material", buttonOnMaterial);
    setTimeout(() => {
      innerButton.setAttribute("material", buttonOffMaterial);
    }, onTime);

    //console.log('Light ', !!light.intensity);
  }, offTime);
  //  console.log(time);
}

const scale = 0.01;
const grid = { x: 4, y: 3 };
const gridScaleMultiplier = 40;
const width = grid.x * gridScaleMultiplier * scale;
const height = grid.y * gridScaleMultiplier * scale;
const margin = 20 * scale;
const offset = {
  z: -70 * scale,
  x: -50 * scale,
  y: 100 * scale,
};

//  const grid = {x: 1, y: 1};
//  <a-plane position="2.5 2 0" rotation="0 0 0" width="5.6" height="5" color="#7BC8A4" roughness="1" shadow></a-plane>
makeElement("plane", {
  position: {
    x: width * 0.5 - margin + offset.x,
    y: height * 0.5 - margin + offset.y,
    z: 0 + offset.z,
  },
  width,
  height,
  color: "gray",
  roughness: 1,
});
for (let x = 0; x < grid.x; x++) {
  for (let y = 0; y < grid.y; y++) {
    makeButton(
      scale,
      x * scale * gridScaleMultiplier + offset.x,
      y * scale * gridScaleMultiplier + offset.y,
      offset.z,
      `button-${x}-${y}`
    );
  }
}
