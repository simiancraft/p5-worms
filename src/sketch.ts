import * as p5 from "p5";

class Boid {
  private position: p5.Vector;
  private velocity: p5.Vector;
  private acceleration: p5.Vector;
  private maxForce: number;
  private maxSpeed: number;
  private trailSize: number;
  private pointHistory: p5.Vector[];

  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 5;
    this.trailSize = 30;
    this.pointHistory = [];
  }

  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }

  align(boids) {
    let perceptionRadius = 25;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y,
      );
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids) {
    let perceptionRadius = 24;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y,
      );
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y,
      );
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(alignSlider?.value());
    cohesion.mult(cohesionSlider?.value());
    separation.mult(separationSlider?.value());

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }

  show() {
    strokeWeight(6);
    stroke(255);
    this.pointHistory.push(new p5.Vector(this.position.x, this.position.y));

    if (this.pointHistory.length > this.trailSize) {
      this.pointHistory.shift();
    }

    for (let i = 0; i < this.pointHistory.length - 1; i++) {
      let p = this.pointHistory[i];
      let c = color(i * 7, i * 15, i * 20);
      fill(c);
      noStroke();
      circle(p.x, p.y, Math.round(2 + i / 2));
    }
  }
}

const flock: Boid[] = [];
const BOIDS_COUNT = 200;
const sliderSpacing = 30;
let alignSlider, cohesionSlider, separationSlider;

export function setup() {
  createCanvas(640, 640);

  alignSlider = createSlider(0, 2, 1.5, 0.1);
  alignSlider.position(640, sliderSpacing);
  cohesionSlider = createSlider(0, 2, 1, 0.1);
  cohesionSlider.position(640, sliderSpacing * 2);
  separationSlider = createSlider(0, 2, 2, 0.1);
  separationSlider.position(640, sliderSpacing * 3);

  for (let i = 0; i < BOIDS_COUNT; i++) {
    flock.push(new Boid());
  }
}

export function draw() {
  background(0, 0, 25);

  for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }
}
