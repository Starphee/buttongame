console.log("hello world!");
const scene = document.querySelector("a-scene");

const minOffTime = 2000;
const maxOffTime = 10000;
const buttonOnMaterial = "emissive: #fff; emissiveIntensity: 1;";
const buttonOffMaterial = "emissive: #00f; emissiveIntensity: 0.5;";

// Add desktop button clicking.
document.addEventListener("click", (e) => {
  if (e.target.tagName === "A-SPHERE") {
    //console.log("click!", e.target);
    e.target.forceTouch();
  }
});

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

  function makeSound(src) {
    return makeElement(
      "entity",
      {
        position: { y: 0, z: -1 * scale, x: 0 },
        sound: `src: #${src}; poolSize: 5`,
      },
      buttonHolder
    );
  }

  return {
    state: false,
    playSound: function (sound) {
      if (!this[sound]) {
        this[sound] = makeSound(sound);
        this[sound].addEventListener("sound-loaded", () => {
          this[sound].components.sound.playSound();
        });
      } else {
        this[sound].components.sound.playSound();
      }
    },
    setState: function (state) {
      this.state = state;
      if (state) {
        innerButton.setAttribute("material", buttonOnMaterial);
      } else {
        innerButton.setAttribute("material", buttonOffMaterial);
      }
    },
    onTouch: function (callback) {
      let touched = false;
      innerButton.addEventListener("hit", (e) => {
        if (e.detail.el !== null && touched === false) {
          touched = true;
          console.log("Touch button", e.detail.el.id, name);
          callback(e.detail.el);
        }
      });

      innerButton.forceTouch = () => {
        callback(null);
      };

      innerButton.addEventListener("hitend", (e) => {
        if (e.detail.el !== null && touched === true) {
          touched = false;
          console.log("STOP touch button", e.detail.el.id, name);
        }
      });
    },
  };
}

function makeGrid(x, y) {
  const buttons = [];
  const scale = 0.01;
  const grid = { x, y };
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
    buttons[x] = [];
    for (let y = 0; y < grid.y; y++) {
      buttons[x][y] = makeButton(
        scale,
        x * scale * gridScaleMultiplier + offset.x,
        y * scale * gridScaleMultiplier + offset.y,
        offset.z,
        `button-${x}-${y}`
      );
    }
  }
  return buttons;
}

function setScore(value) {
  document.getElementById("score").setAttribute("value", value);
}

const buttons = makeGrid(4, 3);
let score = 0;
buttons.forEach((col) => {
  col.forEach((button) => {
    // Create timer to manage on's and off's.
    const offTime = Math.round(maxOffTime * Math.random() + minOffTime);
    // Keep light off until...
    setTimeout(() => {
      button.setState(true);
    }, offTime);

    // When button is touched, turn off, start new timer.
    button.onTouch((controller) => {
      if (button.state) {
        button.playSound("beep-good");
        button.setState(false);
        setScore(++score);
        if (controller) {
          controller.components.haptics.pulse(0.3, 100);
        }
        setTimeout(() => {
          button.setState(true);
        }, offTime);
      } else {
        button.playSound("beep-bad");
        setScore(--score);
      }
    });
  });
});
