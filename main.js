(function() {
    document.addEventListener('DOMContentLoaded', initFunction, false);
    var canvas = null;
    var ctx = null;
    var fps = 60;
    var minimap = true;
    var oneTimeDebugPrint = false;

    var gamestate = {
        sensitivity: 0.8,
        moveSpeed: 0.3,
        movement: {
            up:false,
            down:false,
            left:false,
            right:false
        },
        posX: 0,
        posY: 0,
        posZ: 0,
        viewX: 0.5,
        viewY: 0.5,
        enemies: []
    };

    function gameUpdate() {
        if(oneTimeDebugPrint) {
            oneTimeDebugPrint = false;
            console.log(gamestate);
        }

                

        for(var i = 0; i < gamestate.enemies.length; i++) {
            gamestate.enemies[i].update()
        }
        if(gamestate.movement.up) {
            gamestate.posX += gamestate.moveSpeed * Math.sin(Math.PI * -2 * gamestate.viewX);
            gamestate.posY += gamestate.moveSpeed * Math.cos(Math.PI * -2 * gamestate.viewX);
        }
        if(gamestate.movement.left) {
            gamestate.posX += gamestate.moveSpeed * Math.sin(Math.PI * -2 * (gamestate.viewX-0.25));
            gamestate.posY += gamestate.moveSpeed * Math.cos(Math.PI * -2 * (gamestate.viewX-0.25));
        }
        if(gamestate.movement.right) {
            gamestate.posX += gamestate.moveSpeed * Math.sin(Math.PI * -2 * (gamestate.viewX+0.25));
            gamestate.posY += gamestate.moveSpeed * Math.cos(Math.PI * -2 * (gamestate.viewX+0.25));
        }
        if(gamestate.movement.down) {
            gamestate.posX -= gamestate.moveSpeed * Math.sin(Math.PI * 2 * gamestate.viewX);
            gamestate.posY -= gamestate.moveSpeed * Math.cos(Math.PI * 2 * gamestate.viewX);
        }

    }

    function drawLoop() {

        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width, canvas.height);

        /*Enemies*/
        ctx.fillStyle = "#f00";
        var enemy;
        for(var i = 0; i < gamestate.enemies.length; i++) {
            enemy = gamestate.enemies[i];
            var absAngle = ((Math.atan2(enemy.posX - gamestate.posX,enemy.posY - gamestate.posY)) / (2 * Math.PI));

            var angle;
            if(absAngle > 0) { //I call this If-Else "I am dumb and bad at math".
                angle = 1-absAngle;
            } else {
                angle = -1 * absAngle;
            }

            var distance = distance3d(gamestate.posX,gamestate.posY,gamestate.posZ,enemy.posX,enemy.posY,enemy.posZ);
            var viewSize = 500/distance;
            ctx.fillStyle = "black";
            ctx.fillRect((angle * canvas.width)-1,(enemy.posZ + (canvas.height/2)) - 1 + (viewSize/2),viewSize+2,viewSize+2);
            ctx.fillStyle = "red";
            ctx.fillRect(angle * canvas.width,enemy.posZ + (canvas.height/2) + (viewSize/2),viewSize,viewSize);
        }
        if(minimap) {
            /*Minimap View*/
            ctx.fillStyle = "#aaa";
            ctx.fillRect(0,0,200,200);
            ctx.fillStyle = "#22f";
            ctx.fillRect(gamestate.posX + 100, gamestate.posY + 100, 4,4);
            ctx.strikeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(gamestate.posX + 102,gamestate.posY + 102);
            ctx.lineTo(gamestate.posX + 102 + Math.sin(-2*Math.PI*gamestate.viewX)*8, gamestate.posY + 102 + Math.cos(-2*Math.PI*gamestate.viewX)*8);
            ctx.stroke();

            for(i=0;i<gamestate.enemies.length;i++) {
                enemy = gamestate.enemies[i];
                ctx.fillStyle = "#2f2";
                ctx.fillRect(enemy.posX + 100, enemy.posY + 100, 3,3);
            }
        }

        /*Crosshair*/
        ctx.fillStyle = "black";
        var x = canvas.width * gamestate.viewX;
        var y = canvas.height * gamestate.viewY;
        drawCrosshair(x,y);
        drawCrosshair(x - canvas.width,y);
        drawCrosshair(x + canvas.width,y);



        window.requestAnimationFrame(drawLoop);

        function distance3d(x1,y1,z1,x2,y2,z2) {
            var _x = Math.pow(x1-x2,2);
            var _y = Math.pow(y1-y2,2);
            var _z = Math.pow(z1-z2,2);

            return Math.sqrt(_x+_y+_z);
        }

        function drawCrosshair(x,y) {
            ctx.fillRect(x-20,y-1,40,2);
            ctx.fillRect(x-1,y-20,2,40);
        }
    }

    function keyDown(e) {
        if(e.key == 'w' || e.key == 'ArrowUp')
            gamestate.movement.up = true;
        if(e.key == 'a' || e.key == 'ArrowLeft')
            gamestate.movement.left = true;
        if(e.key == 's' || e.key == 'ArrowDown')
            gamestate.movement.down = true;
        if(e.key == 'd' || e.key == 'ArrowRight')
            gamestate.movement.right = true;
    }
    function keyUp(e) {
        gamestate.movement.up = (e.key == 'w' || e.key == 'ArrowUp') ? false : gamestate.movement.up;
        gamestate.movement.left = (e.key == 'a' || e.key == 'ArrowLeft') ? false : gamestate.movement.left;
        gamestate.movement.down = (e.key == 's' || e.key == 'ArrowDown') ? false : gamestate.movement.down;
        gamestate.movement.right = (e.key == 'd' || e.key == 'ArrowRight') ? false : gamestate.movement.right;
        if(e.key == ' ') {
            gamestate.enemies.push(new Enemy((Math.random() * 200)-100,(Math.random() * 200)-100, 0));

        }
        if(e.key == 'm') {
            minimap = !minimap;
        }
        if(e.key == 'p') {
            oneTimeDebugPrint = true;
        }
    }

    function updateView(e) {
        var xDelta = e.movementX * 0.001 * gamestate.sensitivity;
        var yDelta = e.movementY * 0.001 * gamestate.sensitivity;

        gamestate.viewX += xDelta;
        gamestate.viewY += yDelta;

        gamestate.viewY = Math.max(gamestate.viewY, 0);
        gamestate.viewY = Math.min(gamestate.viewY, 1);

        if(gamestate.viewX > 1) {
            gamestate.viewX -= 1;
        } else if(gamestate.viewX < 0) {
            gamestate.viewX += 1;
        }

    }

    function lockChangeAlert() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            document.addEventListener("mousemove", updateView, false);
        } else {
            document.removeEventListener("mousemove", updateView, false);
        }
    }

    function initFunction() {

        canvas = document.getElementById('game');

        canvas.width = 1280;
        canvas.height = 720;

        ctx = canvas.getContext('2d');

        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

        canvas.requestPointerLock();

        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

        canvas.onclick = function() {
            canvas.requestPointerLock();
        };

        // Hook pointer lock state change events for different browsers
        document.addEventListener('pointerlockchange', lockChangeAlert, false);
        document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
        document.addEventListener('keydown', keyDown, false);
        document.addEventListener('keyup', keyUp, false);

        window.setInterval(gameUpdate, 1000/fps);

        window.requestAnimationFrame(drawLoop);
    }

})();

