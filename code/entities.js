// js/entities.js 

// --- GENERIC ENTITY CLASS ---
//using draw method to draw a circle for basic representation for fallback
export class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.markedForDeletion = false; 
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- PLAYER ---
export class Player extends Entity {
    constructor(x, y, radius, color) {
        super(x, y, radius, color);
        this.angle = 0; 
    }

    updateAngle(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.angle = Math.atan2(dy, dx) + Math.PI / 2;
    } // function to update player angle based on mouse position



    draw(ctx, invulnerableTime = 0) {

        if (invulnerableTime > 0 && Math.floor(invulnerableTime / 10) % 2 === 0) {
            return
        } //flickering effect when invulnerable
        
        ctx.save(); 
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const image = window.gameImages ? window.gameImages.player : null; 
        
        if (image && image.complete) { // check if image is loaded
            const size = this.radius * 2; 
            ctx.drawImage(
                image, 
                -size / 2, 
                -size / 2, 
                size, 
                size
            );
        } else {
            // fallback drawing
            super.draw(ctx); 
            ctx.fillStyle = 'white';
            ctx.fillRect(-this.radius / 5, -this.radius * 1.5, this.radius / 2.5, this.radius * 1.5);
        }
        
        ctx.restore(); 
    }
}

// --- GENERIC ENEMY ---
export class Enemy extends Entity {
    constructor(x, y, radius = 15, color, velocity, health = 1, spriteKey = 'enemy_base') { 
        super(x, y, radius, color);
        this.velocity = velocity;
        this.health = health;
        this.spriteKey = spriteKey; 
    } //default radius 15px

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    } //moving enemy based on velocity
    
    draw(ctx) {
        const image = window.gameImages ? window.gameImages[this.spriteKey] : null; 
        
        if (image && image.complete) {
            const size = this.radius * 2; 
            ctx.drawImage(
                image, 
                this.x - size / 2, 
                this.y - size / 2, 
                size, 
                size
            );
        } else {
            super.draw(ctx); 
        }
    }
}

// --- CLASSE PROJECTILE ---
export class Projectile extends Entity {
    constructor(x, y, radius = 25, color, velocity) { 
        super(x, y, radius, color);
        this.velocity = velocity; 
        this.spriteKey = 'projectile';
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        //delete if out of bounds
        if (this.x < -100 || this.x > 900 || this.y < -100 || this.y > 700) {
            this.markedForDeletion = true;
        }
    }
    
    draw(ctx) {
        const image = window.gameImages ? window.gameImages[this.spriteKey] : null; 
        
        if (image && image.complete) {
            const size = this.radius * 2; 
            ctx.drawImage(
                image, 
                this.x - size / 2, 
                this.y - size / 2, 
                size, 
                size
            );
        } else {
            super.draw(ctx); 
        }
    }
}

// --- FAST SMALL ENEMY ---
export class FastSmall extends Enemy{
    constructor (x, y, radius, color, velocity) {
        super (
            x, y, 
            20, 
            'hsl(180, 70%, 50%)', 
            {x: velocity.x * 1.25, y: velocity.y * 1.25}, 
            1, 
            'enemy_fast' 
        );
    }
}

// --- TANK---
export class Tank extends Enemy {
    constructor (x, y, radius, color, velocity) {
        super (
            x, y, 
            35, 
            'hsl(30, 70%, 50%)', 
            {x: velocity.x * 0.75, y: velocity.y * 0.75}, 
            3, 
            'enemy_tank' 
        );
    }
}

// --- SIMPLE ZIGZAG ---
export class SimpleZigZag extends Enemy {
    constructor (x, y, radius, color, velocity) {
        super (
            x, y, 
            30, 
            'hsl(280, 70%, 50%)', 
            {x: velocity.x * 0.6, y: velocity.y * 0.6}, 
            1,
            'enemy_zigzag' 
        );
        this.time = 0; 
        this.zigzagSpeed = 0.05; 
        this.zigzagMagnitude = 3; 
    }

    update () {
        this.time++;
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        const lateralOffset = Math.sin(this.time * this.zigzagSpeed) * this.zigzagMagnitude;
        this.x += lateralOffset; 
    }
}