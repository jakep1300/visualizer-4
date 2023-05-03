let mic, fft;
let particles = [];

let numParticles = 10000; // Change the number of particles
let particleShape = "triangle"; // Change the particle shape: "ellipse", "rect", or "triangle"
let micSensitivity = 4; // Change the mic sensitivity, 1 is default, increase or decrease as needed

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  angleMode(DEGREES);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
}

function draw() {
  background(0);
  let spectrum = fft.analyze();
  let centroid = fft.getCentroid();
  let hue = map(centroid, 0, width / 2, 0, 360);
  let rms = mic.getLevel() * micSensitivity;
  let direction = map(rms, 0, 1, 0, 360);

  if (particles.length < numParticles) {
    particles.push(new Particle(hue, map(rms, 0, 1, 2, 100), direction));
  }

  particles = particles.filter((p) => {
    p.update();
    p.display();
    return !p.dead;
  });
}

class Particle {
  constructor(h, s, d) {
    this.x = random(width);
    this.y = random(height);
    this.size = s;
    this.hue = h;
    this.saturation = 100;
    this.brightness = 100;
    this.alpha = 1;
    this.speed = random(1, 5);
    this.direction = d;
    this.spinSpeed = random(-2, 2);
    this.spin = 0;
    this.colorFade = random(-2, 2);
    this.colorChange = 0;
    this.face = createGraphics(this.size, this.size);
    this.face.colorMode(HSB, 360, 100, 100, 1);
    this.face.angleMode(DEGREES);
    this.drawFace();
    this.birthTime = millis();
  }

  update() {
    this.x += cos(this.direction) * this.speed;
    this.y += sin(this.direction) * this.speed;
    this.spin += this.spinSpeed;
    this.colorChange += this.colorFade;
    if (millis() - this.birthTime > 2000) {
      this.dead = true;
    }
  }

  display() {
    noStroke();
    push();
    translate(this.x, this.y);
    rotate(this.spin);
    image(this.face, -this.size / 2, -this.size / 2);
    pop();
  }

  drawFace() {
    let c = color(
      (this.hue + this.colorChange) % 360,
      this.saturation,
      this.brightness,
      this.alpha
    );
    this.face.background(0, 0);
    this.face.noStroke();
    this.face.fill(c);

    // Draw different shapes based on particleShape
    if (particleShape === "ellipse") {
      this.face.ellipse(this.size / 2, this.size / 2, this.size);
    } else if (particleShape === "rect") {
      this.face.rectMode(CENTER);
      this.face.rect(this.size / 2, this.size / 2, this.size, this.size);
    } else if (particleShape === "triangle") {
     
      this.face.push();
      this.face.translate(this.size / 2, this.size / 2);
      this.face.beginShape();
      this.face.vertex(0, -this.size / 2);
      this.face.vertex(-this.size / 2, this.size / 2);
      this.face.vertex(this.size / 2, this.size / 2);
      this.face.endShape(CLOSE);
      this.face.pop();
    } else {
      console.error("Invalid particle shape. Please use 'ellipse', 'rect', or 'triangle'.");
    }
  }
}
let ringRotation = 0;

function draw() {
  background(0);
  let spectrum = fft.analyze();
  let centroid = fft.getCentroid();
  let hue = map(centroid, 0, width / 2, 0, 360);
  let rms = mic.getLevel() * micSensitivity;
  let direction = map(rms, 0, 1, 0, 360);

  drawSaturnShape(spectrum, hue, rms);

  if (particles.length < numParticles) {
    particles.push(new Particle(hue, map(rms, 0, 1, 2, 100), direction));
  }

  particles = particles.filter((p) => {
    p.update();
    p.display();
    return !p.dead;
  });
}

function drawSaturnShape(spectrum, hue, rms) {
  push();
  translate(width / 2, height / 2);

  // Draw Saturn's body
  let bodyRadius = map(spectrum[int(spectrum.length / 4)], 0, 255, 50, 150);
  fill((hue + 180) % 360, 100, 100);
  noStroke();
  ellipse(0, 0, bodyRadius);

  // Draw Saturn's rings
  let numOfRings = 360;
  let angleStep = 360 / numOfRings;
  let minRingRadius = bodyRadius * 1.25;
  let ringWidth = map(rms, 0, 1, 0, 200);

  ringRotation += 0.5;
  for (let j = 1; j <= 3; j++) {
    let maxRingRadius = minRingRadius + j * ringWidth;
    push();
    rotate(ringRotation * j);
    for (let i = 0; i < numOfRings; i++) {
      let angle = map(i, 0, numOfRings, 0, 360);
      let ringRadius = map(spectrum[int(i * spectrum.length / 360)], 0, 255, minRingRadius, maxRingRadius);
      let x = ringRadius * cos(angle);
      let y = ringRadius * sin(angle);

      fill((hue + angle) % 360, 100, 100);
      noStroke();
      ellipse(x, y, 5);
    }
    pop();
  }

  pop();
}
