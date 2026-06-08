import * as THREE from 'three';


// Declarations for 2D and 3D:
const h = window.innerHeight;
const w = window.innerWidth;

// 3D Scene Setup
let previousTime = Date.now() / 1000.0;
const scale = 0.25;
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer.setSize(w * scale, h * scale);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.width = "100vw";
renderer.domElement.style.height = "100vh";
renderer.domElement.className = "tapeCanvas";
document.body.appendChild(renderer.domElement);
const r = 0.0025;
const camera = new THREE.OrthographicCamera(-w * r, w * r, h * r, -h * r, 0.1, 1000);
camera.position.z = 10;
camera.lookAt(0, 0, 0)
const scene = new THREE.Scene();

// 3D Adding Objects
const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(0, 0, 3);
scene.add(dirLight);

const prism = new THREE.BoxGeometry(1.75, 1.0, 0.25);
const loader = new THREE.TextureLoader();
const textureUrls = [
    "assets/images/sides.png", // +X
    "assets/images/sides.png",  // -X
    "assets/images/top.png",   // +Y
    "assets/images/top.png",// -Y
    "assets/images/front.png", // +Z
    "assets/images/back.png"   // -Z
];

const textureCache = {};

function preloadTexture(path) {
    loader.load(path, (texture) => {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        textureCache[path] = texture;
    })
}
preloadTexture("assets/images/godot.png");
preloadTexture("assets/images/python.png");
preloadTexture("assets/images/HTMLCSS.png");
preloadTexture("assets/images/aseprite.png");

const mat = textureUrls.map(texture => {
    const t = loader.load(texture);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return new THREE.MeshStandardMaterial({
        map: t
    });
});
const mesh = new THREE.Mesh(prism, mat);
mesh.position.y = 0.5;
scene.add(mesh);

const prismHitBox = mesh.clone();
prismHitBox.visible = false;
scene.add(prismHitBox);

const mouseCast = new THREE.Raycaster();
let mousePos = new THREE.Vector2(1, 1);

window.addEventListener("mousemove", (event) => {
    mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
})

// 3D Rendering
animate3D()

function animate3D() {
    // Defining Rotations
    const time = Date.now() / 1000.0;
    const delta = time - previousTime;
    const lerpSpeed = 12.0;
    let targetx = Math.cos(time) / 2.0;
    let targety = Math.sin(time) / 4.0;

    // Mouse Detection
    mouseCast.setFromCamera(mousePos, camera);
    const intersect = mouseCast.intersectObject(prismHitBox);
    if (intersect.length > 0) {
        let collisionPoint = new THREE.Vector2(intersect[0]["point"].x, intersect[0]["point"].y);
        collisionPoint.y -= prismHitBox.position.y;
        targetx = -collisionPoint.y * 2.25;
        targety = collisionPoint.x * 1.50;
    }
    mesh.rotation.x = lerp(mesh.rotation.x, targetx, delta * lerpSpeed);
    mesh.rotation.y = lerp(mesh.rotation.y, targety, delta * lerpSpeed);

    // Finish Rendering and Calculations
    renderer.render(scene, camera);
    previousTime = time;
    requestAnimationFrame(animate3D);
}

function lerp(current, target, percent) {
    percent = Math.min(percent, 1.0);
    const difference = (target - current) * percent;
    return current + difference;
}

// 2D Particles Setup
const canvas = document.querySelector(".particleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = w;
canvas.height = h;
let particleArray = [];

class Particle {
    constructor(r, s) {
        const angle = 2 * Math.random() * Math.PI; 
        const velAngle = angle + (0.1 * (Math.random() - 0.5) * Math.PI);
        const speed = Math.max(Math.random() * 130.0, 50.0);
        const size = Math.random() * 40.0;
        const x = Math.cos(angle) * r * Math.max(Math.random(), 0.3);
        const y = Math.sin(angle) * r * Math.max(Math.random(), 0.3);
        const d = Math.sqrt(x ** 2 + y ** 2);
        this.x = x + w / 2.0;
        this.y = y + h / 2.0 + s;
        this.size = 0.0;
        this.targetSize = size + d * 0.2;
        this.degradeSpeed = 50.0;
        this.upgradeSpeed = 160.0;
        this.velX = -Math.cos(velAngle) * speed;
        this.velY = -Math.sin(velAngle) * speed;
        this.hitTarget = false;
        this.distance = d - 350.0;
        this.travel = 0.0;
        this.respawnRadius = r;
        this.respawnShift = s;
    }

    respawn(r, s) {
        const angle = 2 * Math.random() * Math.PI; 
        const velAngle = angle + (0.1 * (Math.random() - 0.5) * Math.PI);
        const speed = Math.max(Math.random() * 130.0, 50.0);
        const size = Math.random() * 40.0;
        const x = Math.cos(angle) * r * Math.max(Math.random(), 0.3);
        const y = Math.sin(angle) * r * Math.max(Math.random(), 0.3);
        const d = Math.sqrt(x ** 2 + y ** 2);
        this.x = x + w / 2.0;
        this.y = y + h / 2.0 + s;
        this.size = 0.0;
        this.targetSize = size + d * 0.2;
        this.degradeSpeed = 50.0;
        this.upgradeSpeed = 160.0;
        this.velX = -Math.cos(velAngle) * speed;
        this.velY = -Math.sin(velAngle) * speed;
        this.hitTarget = false;
        this.distance = d - 350.0;
        this.travel = 0.0;
    }

    draw() {
        ctx.fillStyle = "rgba(10, 5, 20, 1.0)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update(delta) {
        this.x += this.velX * delta;
        this.y += this.velY * delta;
        this.travel += Math.sqrt(1.5 * (this.velX * delta) ** 2 + (this.velY * delta) ** 2);
        if (!this.hitTarget) {
            this.size += this.upgradeSpeed * delta;
            if (this.size > this.targetSize) {
                this.hitTarget = true;
            }
        }
        else if (this.travel > this.distance) {
            this.degradeSpeed += Math.sqrt((this.velX * delta) ** 2 + (this.velY * delta) ** 2);
            this.size -= this.degradeSpeed * delta;
            if (this.size < 0.01) {
                this.respawn(this.respawnRadius, this.respawnShift);
            }
        }
    }
}

particleArray = [];
for (let i=0; i<700; i++) {
    particleArray.push(new Particle(1100.0, -100.0));
}

function animate2D() {
    const delta = 1 / 60.0;
    ctx.clearRect(0, 0, w, h);
    for (let i=0; i<particleArray.length; i++) {
        particleArray[i].update(delta);
        particleArray[i].draw();
    }
    requestAnimationFrame(animate2D);
}
animate2D();

function startTape() {
    for (let i=0; i<particleArray.length; i++) {
        particleArray[i].respawn(particleArray[i].respawnRadius, particleArray[i].respawnShift);
    }
    const canvas1 = document.querySelector(".tapeCanvas");
    const canvas2 = document.querySelector(".particleCanvas");
    canvas1.classList.add("appear");
    canvas2.classList.add("appear");
}

function stopTape() {
    const canvas1 = document.querySelector(".tapeCanvas");
    const canvas2 = document.querySelector(".particleCanvas");
    canvas1.classList.remove("appear");
    canvas2.classList.remove("appear");
}

// Handles Menu Animations
const menuButtons = document.querySelectorAll(".gridItem");
const mainMenu = document.querySelector(".mainMenu");

const aboutMe = document.querySelector(".aboutMe");
const projects = document.querySelector(".projects");
const skills = document.querySelector(".skills");
const contacts = document.querySelector(".contacts");

const bg = document.querySelector(".backgroundImage");
const rope = document.querySelector(".rope")
let menuState = "";

// Tape Buttons
const tapeExits = document.querySelectorAll(".tapeExit");
const tapeButtons = document.querySelectorAll(".tapePNG");
let field;
tapeButtons.forEach(tape => {
    tape.addEventListener("click", async function () {
        tapeButtons.forEach(t => {
            t.classList.remove("down")
        })
        const data = tape.id
        // Get tape image
        const path = "assets/images/" + data + ".png"
        mesh.material[4].map = textureCache[path]
        mesh.material[4].map.needsUpdate = true
        field = document.querySelector("." + data)
        field.classList.add("appear")
        console.log(data)
        startTape()
    })
});

tapeExits.forEach(exit => {
    exit.addEventListener("click", async function () {
        tapeButtons.forEach(t => {
            t.classList.add("down")
        })
        field.classList.remove("appear")
        stopTape()
    })
});

// Poster Buttons
const windowContainer = document.querySelector(".windowContainer");
const windowTab = document.querySelector(".window");
const posterButtons = document.querySelectorAll(".poster");
let posterData;
posterButtons.forEach(poster => {
    poster.addEventListener("click", function () {
        console.log("Clicked Poster")
        const posterName = poster.id
        posterData = document.querySelector("." + posterName)
        posterData.classList.add("appear")
        windowContainer.classList.add("appear")
        windowTab.classList.add("appear")
    })
});

const exitPoster = document.querySelector(".X");
exitPoster.addEventListener("click", function () {
    console.log("Exit Poster")
    posterData.classList.remove("appear")
    windowContainer.classList.remove("appear")
    windowTab.classList.remove("appear")
});

// Menu Buttons
menuButtons.forEach(menuButton => {
    menuButton.addEventListener("click", async function () {
        console.log("You clicked:", menuButton.innerText);
        mainMenu.classList.add("hidden");

        const buttonName = menuButton.innerText;
        await scrollAnim("down");
        rope.classList.add("down");
        menuState = buttonName;
        if (buttonName == "About Me") {
            aboutMe.classList.add("appear");
        }
        else if (buttonName == "Projects") {
            projects.classList.add("appear");
        }
        else if (buttonName == "Skills") {
            skills.classList.add("appear");
            tapeButtons.forEach(t => {
                t.classList.add("down")
            })
        }
        else if (buttonName == "Contacts") {
            contacts.classList.add("appear");
        }
    })
});

// Rope Button
rope.addEventListener("click", async function() {
    rope.classList.remove("down");
    if (menuState == "About Me") {
        aboutMe.classList.remove("appear");
    }
    else if (menuState == "Projects") {
        projects.classList.remove("appear");
    }
    else if (menuState == "Skills") {
        skills.classList.remove("appear");
        tapeButtons.forEach(t => {
            t.classList.remove("down")
        })
    }
    else if (menuState == "Contacts") {
        contacts.classList.remove("appear");
    }
    await scrollAnim("up");
    mainMenu.classList.remove("hidden");
});

// Scrolling Animation
function scrollAnim(playmode) {
    return new Promise(animFinished => {
        bg.classList.add(playmode + "Start");
        bg.addEventListener("animationend", () => {
            bg.classList.remove(playmode + "Start");
            bg.classList.add(playmode + "End");
            bg.addEventListener("animationend", () => {
                bg.classList.remove(playmode + "End");
                speak();
                animFinished();
            }, {once: true})
        }, {once: true});
    })
}

// Typing Effect
const texts = document.querySelectorAll(".type");
let typeValue = 0;

function speak() {
    typeValue += 1;
    const currentTypeValue = typeValue;
    texts.forEach((text) => {
        const data = text.parentElement.querySelector(".hiddenTextBox").textContent;
        const icon = text.parentElement.querySelector(".textBoxIcon");
        text.textContent = "";
        setTimeout(() => {
            type(0, text, data, icon, currentTypeValue)
        }, 500);
    });
}

function type(index, text, data, icon, ctv) {
    if (ctv == typeValue) {
        if (index == 0) {
            icon.classList.add("speak");
        }
        text.textContent += data.charAt(index);
        if (index < data.length) {
            setTimeout(() => {
                type(index + 1, text, data, icon, ctv);
            }, 35);
        }
        else {
            console.log("Speaking Finished");
            icon.classList.remove("speak");
        }
    }
}

speak();


