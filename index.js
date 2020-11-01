const canvas = document.querySelector('canvas');
const score = document.querySelector('span');
const button = document.querySelector('button');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill()
    }
}

class Projectile {
    constructor (x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = velocity ;
        this.color = color;
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill()
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle {
    constructor (x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = velocity ;
        this.color = color;
        this.alpha = 1;
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill()
        c.restore()
    }
    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

class Enemy {
    constructor (x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = velocity ;
        this.color = color;
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill()
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}


const x = canvas.width /2;
const y = canvas.height /2;

let player1 = new Player (x, y, 10, 'white');


let projectries = [];
let enemies = [];
let particles = [];

function init(){
    player1 = new Player (x, y, 10, 'white');
    projectries = [];
    enemies = [];
    particles = [];
    score.innerHTML = 0;
}

function spawnEmemies(){
    setInterval(()=>{
        const radius = (Math.random() * (30-4+1) + 2);
        let x;
        let y;

        if(Math.random() < 0.5 ){
             x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
             y = Math.random() * canvas.height; 
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius; 
        }
        
        const color = `hsl(${Math.random()* 360},60%, 50%)`;

        const angle = Math.atan2(canvas.height/ 2 - y, canvas.width/2 -x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity ))
    }, 1000)
};

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0,0,0,0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player1.draw();
    projectries.forEach( (projectry, index )=> {
        projectry.update();
        if(projectry.x + projectry.radius < 0 ||
            projectry.x - projectry.radius > canvas.width ||
            projectry.y + projectry.radius < 0 ||
            projectry.y - projectries.radius > canvas.height){
            setTimeout(()=>{
                projectries.splice(index,1);
            },0)
        }
    });
    particles.forEach((particle,index)=>{
        if(particle.alpha <= 0){
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });
    enemies.forEach(
        (enemy, index) => {
            enemy.update();

            const dist = Math.hypot(player1.x - enemy.x, player1.y - enemy.y);

            if(dist - enemy.radius - player1.radius < 1 ){
                cancelAnimationFrame(animationId);
                gameOver(score.innerHTML);
            }
            projectries.forEach((projectry, proIndex) => {
                const dist = Math.hypot(projectry.x - enemy.x , projectry.y - enemy.y);

                if(dist - enemy.radius - projectry.radius < 1){
                    for(let i = 0; i< 8 ; i++ ){
                        particles.push(new Particle(projectry.x, projectry.y, Math.random() * 3, enemy.color, {x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 }))
                    }

                    if(enemy.radius - 10 > 5){
                        gsap.to(enemy,{
                            radius: enemy.radius - 10
                        })
                        setTimeout(()=>{
                            let add = parseInt(score.innerHTML);
                            score.innerHTML = add+50;
                            enemy.radius -=10;
                            
                            projectries.splice(proIndex,1)
                        },0);
                    } else {
                        setTimeout(()=>{
                            let add = parseInt(score.innerHTML);
                            score.innerHTML = add+50;
                            enemies.splice(index, 1);
                            projectries.splice(proIndex,1)
                        },0);
                    }
                }
            })
        }
    );
}

function gameOver(scr){
    let score = document.querySelector('h2');
    score.innerHTML=scr;
    document.getElementById('game-over').classList.remove('none');
}

addEventListener('click', (e) =>{
    const angle = Math.atan2(
        e.clientY - canvas.height / 2,
        e.clientX - canvas.width / 2
    )
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5      
    }
    projectries.push( new Projectile(canvas.width/2, canvas.height /2 ,5, 'white', velocity))
});

button.addEventListener('click',()=>{
    console.log('called');
    init();
    animate();
    document.getElementById('game-over').classList.add('none');
});

animate();
spawnEmemies();