
class Car {
    constructor() {
        this.car = document.getElementById('car');
        this.track = document.getElementById('background');
        this.track.width = 2000;
        this.track.height = 1000;
        this.context = this.track.getContext("2d");
        this.trackCenter = [this.track.width/2, this.track.height/2];
        this.carCoordinates = this.trackCenter;
        this.speed = 0;
        this.maxSpeed = 8;
        this.maxBackwardsSpeed = -4;
        this.minDriftSpeed = 3;
        this.inertiaSpeed = 0.1;
        this.speedIncreaseForward = 0.07;
        this.speedIncreaseBackward = 0.10;
        this.angle = 0;
        this.driftAngle = 0;
        this.maxDriftAngle = Math.PI / 3;
        this.pressedKeys = {
            'forward': null,
            'backward': null,
            'left': null,
            'right': null
        };
        this.x = 1000 - (window.innerWidth/2);
        this.y = 500 - (window.innerHeight/2);
        this.windowCenter = [
            (window.innerWidth/2) - (this.car.width/2),
            (window.innerHeight/2) - (this.car.height/2)
        ];
        this.lastWindowWidth = window.innerWidth;
        this.lastWindowHeight = window.innerHeight;
        this.trackImage = new Image();
        this.trackImage.src = 'images/track.png';
        this.initInterval();        
    }

    initInterval() {
        this.interval = setInterval(() => {
           this.frame();
        }, 20);
    }

    clearBackground() {
        this.context.clearRect(0, 0, this.track.width, this.track.height);
        this.drawTrack();
    }

    drawTrack() {
        this.context.drawImage(this.trackImage, (this.track.width-2000)/2, 0, 2000, 1000);
    }

    changeCarCoordinates() {
        this.carCoordinates[0] += this.speed*Math.cos(this.angle);
        this.carCoordinates[1] += this.speed*Math.sin(this.angle);

        this.x += this.speed*Math.cos(this.angle);
        this.y += this.speed*Math.sin(this.angle);

        this.track.style.transform = `translate(${-this.x}px, ${-this.y}px)`;
        this.car.style.transform = `translate(${this.windowCenter[0]}px, ${this.windowCenter[1]}px) rotate(${this.driftAngle}rad)`;

        if (this.pressedKeys['left']) { // 4 6
            if (this.speed > this.minDriftSpeed) {
                if (this.driftAngle < this.angle) {
                    this.angle -= 3 * Math.PI / 180;
                }

                if (this.driftAngle > this.angle - this.maxDriftAngle) {
                    this.driftAngle -= 5 * Math.PI / 180;
                }
            } else {
                this.angle -= this.speed * Math.PI / 180;
                this.driftAngle -= this.speed * Math.PI / 180;
            }
        } else if (this.pressedKeys['right']) {
            if (this.speed > this.minDriftSpeed) {
                if (this.driftAngle > this.angle) {
                    this.angle += 3 * Math.PI / 180;
                }

                if (this.driftAngle < this.angle + this.maxDriftAngle) {
                    this.driftAngle += 5 * Math.PI / 180;
                }
            } else {
                this.angle += this.speed * Math.PI / 180;
                this.driftAngle += this.speed * Math.PI / 180;
            }
        } else if (this.driftAngle > this.angle) {
            this.angle += 0.01;
        } else if (this.driftAngle < this.angle) {
            this.angle -= 0.01;
        } 

        if (this.pressedKeys['forward'] && this.speed < this.maxSpeed) {
            this.speed += this.speedIncreaseForward;
        } else if (this.pressedKeys['backward'] && this.speed > this.maxBackwardsSpeed) {
            this.speed -= this.speedIncreaseBackward;
        } else if (this.speed > 0.5) {
            this.speed -= this.inertiaSpeed;
        } else if (this.speed < -0.5) {
            this.speed += this.inertiaSpeed;
        } else {
            this.speed = 0;
            this.angle = this.driftAngle;
        }
    }

    drawDots() {
        if (this.speed > 3) {
            this.context.save();
            this.context.translate(this.carCoordinates[0], this.carCoordinates[1]);
            this.context.rotate(this.driftAngle);
            this.context.fillStyle = "#424242";
            this.context.beginPath();
            this.context.arc(-15, -5, 1, 0, 2 * Math.PI);
            this.context.arc(-15, 5, 1, 0, 2 * Math.PI);
            this.context.fill();
            this.context.beginPath();
            this.context.arc(15, -5, 1, 0, 2 * Math.PI);
            this.context.arc(15, 5, 1, 0, 2 * Math.PI);
            this.context.fill();
            this.context.restore();
        }
    }

    frame() {
        this.drawDots();
        this.changeCarCoordinates();
    }
}


let car = new Car();
let clearButton = document.getElementById('clear-button');
let controlerButtons = document.querySelectorAll('.controler-button');

window.onload = () => {
    car.drawTrack();
};

function keyEvent(event, value) {
    if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
        car.pressedKeys['left'] = value;
    } else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
        car.pressedKeys['right'] = value;
    } else if (event.code == 'KeyW' || event.code == 'ArrowUp') {
        car.pressedKeys['forward'] = value;
    } else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
        car.pressedKeys['backward'] = value;
    }
}

document.addEventListener('keydown', (event) => {
    keyEvent(event, true);
});

document.addEventListener('keyup', (event) => {
    keyEvent(event, false);
});

let supportsTouch = ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) || 
                    (navigator.msMaxTouchPoints > 0);

if (supportsTouch) {
    for (let i of controlerButtons) {
        i.style.display = 'block';
        i.addEventListener('touchstart', (event) => {
            event.preventDefault();
            car.pressedKeys[i.id] = true;
        });
        i.addEventListener('touchend', (event) => {
            event.preventDefault();
            car.pressedKeys[i.id] = false;
        });
    }
}

window.addEventListener("resize", (event) => {
    car.windowCenter = [
        (window.innerWidth/2) - (car.car.width/2),
        (window.innerHeight/2) - (car.car.height/2)
    ];
    car.x -= (window.innerWidth - car.lastWindowWidth)/2;
    car.y -= (window.innerHeight - car.lastWindowHeight)/2;

    car.lastWindowWidth = window.innerWidth;
    car.lastWindowHeight = window.innerHeight;
});

clearButton.addEventListener('click', (event) => {
    car.clearBackground();
});
