// script.js 

//import extra from other files
import { Player, Enemy, FastSmall, Tank, SimpleZigZag, Projectile } from './entities.js'; //all classes to be sure to have them
import { spawnEnemy, checkCollision } from './mechanics.js'; 




// html references for buttons and displays
const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null; // check if canvas exists

// first buttons and panels references
const startMenu = document.getElementById('start-menu');
const rulesPanel = document.getElementById('rules-panel');
const startButton = document.getElementById('start-button');
const rulesButton = document.getElementById('rules-button');
const closeRulesButton = document.getElementById('close-rules-button');

// get displays references
const livesDisplay = document.getElementById('lives-display');
const scoreDisplay = document.getElementById('score-display');
const shootedDisplay = document.getElementById('shooted-display');
const enemiesDisplay = document.getElementById('enemies-display');

// game over panel references
const gameOverPanel = document.getElementById('game-over-panel');
const restartButton = document.getElementById('restart-button');

// pause menu references
const pauseMenu = document.getElementById('pause-panel'); 
const resumeButton = document.getElementById('resume-button');
const restartButton2 = document.getElementById('restart-button-2'); 

// settings panel references
const settingsPanel = document.getElementById('settings-panel') || null; 
const settingsMenuButton = document.getElementById('settings-menu-button') || null; 
const closeSettingsButton = document.getElementById('close-settings-button') || null; 
const toggleAudioButton = document.getElementById('toggle-audio-button') || null; 
const viewRulesFromSettingsButton = document.getElementById('view-rules-from-settings') || null;


// VARIABLES AND CONSTANTS

//entities arrays and player reference
let player;
let projectiles = []; 
let enemies = [];     
let spawnInterval;    
let mouse = { x: 0, y: 0 }; 

//game values
let score = 0;
let lives = 3;
let shooted = 0;
let killed = 0;
let invulnerableTime = 0;
const INVULNERABLE_DURATION = 60; // in frames 

//state of the game
let isGameRunning = false;
let isGamePaused = false;

//audio
let isAudioEnabled = true;
let masterGain = 1.0;

//high score
let highScore;

//audio files
const soundShoot = new Audio('sounds/shoot.wav'); 
const soundCrash = new Audio('sounds/crash.wav'); 
const soundClick = new Audio('sounds/click.wav'); 
const soundPop = new Audio('sounds/pop.wav'); 

const ALL_SOUNDS = [soundShoot, soundCrash, soundClick, soundPop];

//space
let stars = []; 
let stars2 = [];
const NUM_STARS = 100;
const BACKGROUND_COLOR = '#131322ff';

//paths for sprites
const ASSET_PATHS = {
    player: 'images/spaceship.png',
    projectile: 'images/bullet2.png',
    enemy_base: 'images/alien2.png',
    enemy_fast: 'images/asteroid.png',
    enemy_tank: 'images/alien3.png',
    enemy_zigzag: 'images/alien1.png',
};

window.gameImages = {}; 


// difficulty cohefficents for enemy spawn rate
let currentDifficulty = 'medium'; 
const DIFFICULTY_DATA = {
    'easy': {'rate': 2000, multiplier: 1.0},
    'medium': {'rate': 1500, multiplier: 1.5},
    'hard': {'rate': 1000, multiplier: 2.0}
}


//UTILITIES FUNCTIONS

function loadHighScore() {
    const savedScore = localStorage.getItem('highScore');
    
    if (savedScore) {
        highScore = parseInt(savedScore, 10);
    } else {
        // if no high score saved, initialize to 0
        highScore = 0; 
    }
    
    // update display
    updateHighScoreDisplay(); 
}

function saveHighScore(currentScore) {
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem('highScore', highScore);
        updateHighScoreDisplay();
    }
} 
//functions to load and save high score using local storage 

function updateHighScoreDisplay() {
    const highScoreDisplay = document.getElementById('highscore-display'); 
    if (highScoreDisplay) {
        highScoreDisplay.textContent = highScore;
    }
}
//function to update high score display in the UI

function createStars() {
    stars = [];
    stars2 = [];
    for (let i = 0; i < NUM_STARS; i++) {
        stars.push({x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2 + 1 });
        stars2.push({x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 0.75 + 0.25 });
    }
} 
//function to create 2 layers of stars in the background at random positions 

function updateStars() {
    //moving speeds for stars
    const speed1 = 0.5; 
    const speed2 = 0.2; 
    
    
    stars.forEach(star => {
        star.y += speed1;
        if (star.y > canvas.height) {
            star.y = 0; 
            star.x = Math.random() * canvas.width; 
        }
    });

    stars2.forEach(star => {
        star.y += speed2;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width; 
        }
    });
}
//functions for creating and moving stars in the background
//implemented as random dots to make the background always different 

function updateMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
}


/** function to play sound effects
 * @param {HTMLMediaElement} audioObject - The audio object to be played
 */
function playSound(audioObject) {
    if (!isAudioEnabled) return;
    
    audioObject.currentTime = 0; 
    audioObject.play().catch(e => {
        //control error in case of failure
        console.error("Error playing sound:", e);
    });
}

function initializeSprites() {
    let imagesToLoad = Object.keys(ASSET_PATHS).length;
    let loadedCount = 0;

    const checkProgress = () => {
         loadedCount++;
         if (loadedCount === imagesToLoad) {
             console.log("Everything is loaded. Start Full Game");
         }
    };
    //function to check loading progress of sprites

    for (const key in ASSET_PATHS) {
        window.gameImages[key] = new Image();
        
        window.gameImages[key].onload = checkProgress;
        
        // in case of failure
        window.gameImages[key].onerror = () => {
            console.error(`Error loading: ${ASSET_PATHS[key]}. Fallback.`);
            checkProgress();
        };
        
        window.gameImages[key].src = ASSET_PATHS[key];
    }
} //function for creating sprites with fallback in case of error


function setDifficulty(level) {
    currentDifficulty = level;
    
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-level="${level}"]`).classList.add('selected');
} //function to set difficulty and update button styles

function showRules() {
    startMenu.classList.add('hidden');
    rulesPanel.classList.remove('hidden');
}

// GAME HANDLING


function shootProjectile() {
    if (!isGameRunning || isGamePaused) return; //always using this in case of game is paused

    const angle = player.angle - Math.PI / 2; 
    const speed = 4;

    const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };

    const newProjectile = new Projectile(
        player.x, 
        player.y, 
        10, 
        'white', 
        velocity
    ); //always using also the standard drawing for fallback

    playSound(soundShoot); //play shooting sound at 20% volume

    projectiles.push(newProjectile); //adding to projectiles array

    if (score > 0) {
        score -= 1;
    } else {
        score = 0;
    }
    scoreDisplay.textContent = score;
    //shooting costs 1 point to make the game more challenging

    shooted++;
    shootedDisplay.textContent = shooted;

} //function to generate and shoot projectiles

function initGame() {
    score = 0;
    lives = 3;
    shooted = 0;
    killed = 0;
    projectiles = [];
    enemies = [];
    livesDisplay.textContent = lives;
    scoreDisplay.textContent = score;
    shootedDisplay.textContent = shooted;
    enemiesDisplay.textContent = killed;
    //initialize standard values and update displays

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    player = new Player(centerX, centerY, 30, 'hsl(120, 70%, 50%)'); //standard drawing for fallback

    canvas.addEventListener('mousemove', updateMousePosition);
    canvas.addEventListener('click', shootProjectile);
    
    createStars(); //reset stars positions
} //function to initiate standard values of lives and score for the start

function togglePause() {
    if (!isGameRunning) return;

    isGamePaused = !isGamePaused; //toggle pause state

    if (isGamePaused) {
        pauseMenu.classList.remove('hidden'); //show pause menu 
        if (spawnInterval) {
            clearInterval(spawnInterval);
        }
    } else {
        pauseMenu.classList.add('hidden');
        
        const rate = DIFFICULTY_DATA[currentDifficulty].rate //get spawn rate according to difficulty
        
        spawnInterval = setInterval(() => {
             if (isGameRunning) {
                 enemies.push(spawnEnemy(canvas));
             }
         }, rate); //impose spawn rate according to difficulty

        gameLoop();
    } 
}//function for pause menu, with restart and resume

function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    const text = isAudioEnabled ? "Audio: ON" : "Audio: OFF"; //update button text
    toggleAudioButton.textContent = text;
    
    // update master gain
    masterGain = isAudioEnabled ? 1.0 : 0.0;

    ALL_SOUNDS.forEach(audio => {
        //apply volume change to all sounds
        audio.volume = masterGain; 
    });
}

// SETTINGS


function openSettings() {
    pauseMenu.classList.add('hidden'); //hide pause menu
    settingsPanel.classList.remove('hidden'); // show settings
}

function closeSettings() {
    settingsPanel.classList.add('hidden'); 
    pauseMenu.classList.remove('hidden'); // show pause menu
}


function viewRulesFromSettings() {
    settingsPanel.classList.add('hidden'); 
    rulesPanel.classList.remove('hidden'); // show rules panel 
}


function closeRules() {
    rulesPanel.classList.add('hidden');
    
    // check from where we came (title or settings)
    if (isGameRunning && isGamePaused) {
        
        settingsPanel.classList.remove('hidden');
    } else {
        startMenu.classList.remove('hidden');
    }
}


function startGame() {
    if (isGameRunning) return;

    
    initializeSprites(); //start generating sprites
    
    startMenu.classList.add('hidden');
    isGameRunning = true; //starts game
    
    initGame(); 
    
    const rate = DIFFICULTY_DATA[currentDifficulty].rate; //get spawn rate according to difficulty

    spawnInterval = setInterval(() => {
        if (isGameRunning) {
            enemies.push(spawnEnemy(canvas));
        }
    }, rate);

    gameLoop(); 
}

function restartGame() {
    gameOverPanel.classList.add('hidden'); 
    pauseMenu.classList.add('hidden');
    
    enemies = [];
    projectiles = []; 
    //clearing all entities in it
    
    isGameRunning = true;
    isGamePaused = false; 
    //resetting states

    const rate = DIFFICULTY_DATA[currentDifficulty].rate; //get spawn rate according to difficulty
    
    initGame(); 
    gameLoop();
} //function to restart game


function gameLoop() {
    if (!isGameRunning || isGamePaused) {
        return; 
    }

    //logic and physics
    player.updateAngle(mouse.x, mouse.y); 
    projectiles.forEach(p => p.update());
    enemies.forEach(e => e.update());
    updateStars();

    if (invulnerableTime > 0) invulnerableTime--; //reduce invulnerability time

    // handling of collisions and game over screen
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];
            if (checkCollision(enemy, projectile)) { //checking collision between enemy and projectile
                
                enemy.health -= 1; 
                projectile.markedForDeletion = true;

                if (enemy.health <= 0) {
                    enemy.markedForDeletion = true; 
                    playSound(soundPop); //play pop sound 
                    killed++; //add to killed enemies
                    enemiesDisplay.textContent = killed;
                    if (enemy instanceof Tank) {
                        score += 10
                    } else {
                        if (enemy instanceof FastSmall) {
                            score += 20
                        } else {
                            score += 30
                        }
                    } //different points according to the enemy to differentiate scores
                    scoreDisplay.textContent = score; 
                }
                break;
            }
        }
        
        // collision with player and health reduction
        if (!enemy.markedForDeletion && checkCollision(enemy, player) && invulnerableTime == 0) {
            enemy.markedForDeletion = true; 
            lives--;
            livesDisplay.textContent = lives;
            playSound(soundCrash); //play crash sound 
            invulnerableTime = INVULNERABLE_DURATION; //set invulnerability time after being hit

             if (lives <= 0) {
                 isGameRunning = false;
                 const multiplier = DIFFICULTY_DATA[currentDifficulty].multiplier;
                 const finalScore = Math.floor(score * multiplier); //update final score according to difficulty
                 score = finalScore

                 saveHighScore(score); //save high score if beaten

                 // show game over panel with final stats
                 gameOverPanel.classList.remove('hidden');
                 document.getElementById('final-score').textContent = score; 
                 document.getElementById('final-shooted').textContent = shooted;
                 document.getElementById('final-killed').textContent = killed;

                 
                 canvas.removeEventListener('mousemove', updateMousePosition);
                 canvas.removeEventListener('click', shootProjectile);
                 return; 
             }
        }
    }
    
    // clearing all objects
    projectiles = projectiles.filter(p => !p.markedForDeletion);
    enemies = enemies.filter(e => !e.markedForDeletion);

    // rendering of everything
    ctx.fillStyle = BACKGROUND_COLOR; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
  ctx.fillStyle = '#FFFFFF'; 
    stars2.forEach(star => { // Strato Lento (sotto)
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; 
    stars.forEach(star => { // Strato Veloce (sopra)
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    player.draw(ctx, invulnerableTime);
    projectiles.forEach(p => p.draw(ctx));
    enemies.forEach(e => e.draw(ctx)); 

    requestAnimationFrame(gameLoop);
} //main function to make work the game, with logic, physics and rendering


// -----------------------------------------------------------
// LISTENER
// -----------------------------------------------------------

function handleUiClick(callback) {
    playSound(soundClick);
    callback();
} //function to handle click sounds for buttons

// listener Start Game
startButton.addEventListener('click', () => handleUiClick(startGame));

// listener difficulty buttons
document.getElementById('diff-easy').addEventListener('click', () => handleUiClick(() => setDifficulty('easy')));
document.getElementById('diff-medium').addEventListener('click', () => handleUiClick(() => setDifficulty('medium')));
document.getElementById('diff-hard').addEventListener('click', () => handleUiClick(() => setDifficulty('hard')));

// set default difficulty selected
document.querySelector(`[data-level="medium"]`).classList.add('selected');

//listeners rules panel
rulesButton.addEventListener('click', () => handleUiClick(showRules));
closeRulesButton.addEventListener('click', () => handleUiClick(closeRules));

// lsisteners game over panel and pause menu
restartButton.addEventListener('click', () => handleUiClick(restartGame));
resumeButton.addEventListener('click', () => handleUiClick(togglePause));
restartButton2.addEventListener('click', () => handleUiClick(restartGame));

settingsMenuButton.addEventListener('click', openSettings);
closeSettingsButton.addEventListener('click', closeSettings);
toggleAudioButton.addEventListener('click', toggleAudio);
viewRulesFromSettingsButton.addEventListener('click', () => viewRulesFromSettings());

// pause button listener
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'KeyP' || event.code === 'Escape') {
        togglePause();
    }
});

createStars();
loadHighScore();

console.log("script.js caricato. In attesa di click 'Inizia'.");