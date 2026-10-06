// js/mechanics.js

// imports all classes of enemies
import { Enemy, FastSmall, Tank, SimpleZigZag } from './entities.js'; 


// spawn enemy function
export function spawnEnemy(canvas) {
    const { width, height } = canvas;
    const center = { x: width / 2, y: height / 2 };
    
    //out of bounds spawn position
    const spawnDistance = Math.max(width, height) * 0.7; 
    const spawnAngle = Math.random() * Math.PI * 2; 
    
    const startX = center.x + Math.cos(spawnAngle) * spawnDistance;
    const startY = center.y + Math.sin(spawnAngle) * spawnDistance;
    
    //calculate properties of enemy
    const radius = Math.random() * 25 + 15; 
    const speed = Math.random() * 1.5 + 0.5; 
    const angleToCenter = Math.atan2(center.y - startY, center.x - startX);
    
    const velocity = {
        x: Math.cos(angleToCenter) * speed,
        y: Math.sin(angleToCenter) * speed
    };
    
    const color = `hsl(120, 70%, 50%)`; // Greenish color for enemies for fallback

    // random selection of enemy type
    let type = Math.floor(Math.random() * 3); // Genera 0, 1 o 2

    switch (type) { //switch case to spawn different enemy types
        case 0:
 
            return new FastSmall (startX, startY, radius, color, velocity);
        case 1: 
            return new SimpleZigZag (startX, startY, radius, color, velocity);
        case 2: 
            return new Tank (startX, startY, radius, color, velocity);
        default:
            return new Enemy (startX, startY, radius, color, velocity); //fallback
    }
}

// collision detection function
export function checkCollision(objA, objB) {
    const dx = objA.x - objB.x;
    const dy = objA.y - objB.y;
    
    const distanceSquared = dx * dx + dy * dy;
    
    const radiiSum = objA.radius + objB.radius;
    const radiiSumSquared = radiiSum * radiiSum;
    
    return distanceSquared < radiiSumSquared;
}