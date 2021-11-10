/**
 * Created by gilles on 16/04/17.
 */
/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/


class Map {

    constructor() {
        this.barrels = [];
        this.mines = [];
        this.canonballs = [];
        this.ourShips = [];
        this.enemiesShips = [];
    }

    addShip(ship,enemy) {
        if(enemy == 0) {
            this.enemiesShips.push(ship);
        }
        else {
            this.ourShips.push(ship);
            ship.print('addShip');
        }
    }

    addBarrel(barrel) {
        this.barrels.push(barrel);
    }

    addMine(mine) {
        //mine.print(' mine ');
        this.mines.push(mine);
    }

    isMine(point) {
        let isMine = false;
        for(let i = 0; i < this.mines.length ; i++){
            //this.mines[i].print(' mine ');
            if((point.x == this.mines[i].x) && (point.y == this.mines[i].y)) {
                isMine = true;
            }
        }
        //point.print(' isMine ' + isMine);
        return isMine;
    }

    isBarrel(point) {
        let isBarrel = false
        for(let i = 0; i < this.barrels.length ; i++){
            if((point.x == this.barrels[i].center.x) && (point.y == this.barrels[i].center.y)) {
                isBarrel = true;
            }
        }
        return isBarrel;
    }
}

class Cube {
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    directions() {
        let dir0 = new Cube(+1, -1,  0);
        let dir1 = new Cube(+1,  0, -1);
        let dir2 = new Cube( 0, +1, -1);
        let dir3 = new Cube(-1, +1,  0);
        let dir4 = new Cube(-1,  0, +1);
        let dir5 = new Cube( 0, -1, +1);
        return [dir0,dir1,dir2,dir3,dir4,dir5];
    }
    distance(cube) {
        return(Math.max(Math.abs(this.x - cube.x),Math.abs(this.y - cube.y),Math.abs(this.z - cube.z)));
    }

    rotateLeft(center){
        let vector = new Cube(this.x - center.x,this.y - center.y,this.z - center.z);
        let rotatedVector = new Cube(-vector.y,-vector.z,-vector.x);
        let rotatedPoint = new Cube(center.x + rotatedVector.x,center.y + rotatedVector.y,center.z + rotatedVector.z);
        return rotatedPoint;
    }

    rotateRight(center){
        let vector = new Cube(this.x - center.x,this.y - center.y,this.z - center.z);
        let rotatedVector = new Cube(-vector.z,-vector.x,-vector.y);
        let rotatedPoint = new Cube(center.x + rotatedVector.x,center.y + rotatedVector.y,center.z + rotatedVector.z);
        return rotatedPoint;
    }

    cubeToOffset() {
        let x = this.x + (this.z - this.z%2)/2;
        let y = this.z;
        let point = new Point(x,y);
        return point;
    }

    cube_direction(direction) {
        return this.directions[direction];
    }

    cube_neighbor(point, direction) {
        return new Cube(point.x, point.y, this.cube_direction(direction));
    }
}

class Point {
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.evenLine = (y%2 == 0);
    }

    neighbor(direction) {
        //printErr('neighbor evenLine : ' + this.evenLine + ' direction : ' + direction);
        let dir = (this.evenLine) ? this.directions(this.evenLine)[direction] : this.directions(this.evenLine)[direction];
        let neighbor = new Point(this.x + dir.x, this.y + dir.y);
        return neighbor;
    }

    neighbors(){
        let neighbors = [];
        for(let dir = 0; dir < 6; dir++) {
            //this.neighbor(dir).print(' neighbor ' + dir);
            neighbors.push(this.neighbor(dir));
        }
        return neighbors;
    }

    directions(evenLine){
        if(evenLine) {
            let dir0 = new Point(1,0);
            let dir1 = new Point(0,-1);
            let dir2 = new Point(-1,-1);
            let dir3 = new Point(-1,0);
            let dir4 = new Point(-1,1);
            let dir5 = new Point(0,1);
            return [dir0,dir1,dir2,dir3,dir4,dir5];
        }
        else {
            let dir0 = new Point(1,0);
            let dir1 = new Point(1,-1);
            let dir2 = new Point(0,-1);
            let dir3 = new Point(-1,0);
            let dir4 = new Point(0,1);
            let dir5 = new Point(1,1);
            return [dir0,dir1,dir2,dir3,dir4,dir5];
        }
    }
    distance(point) {
        //point.print('Point distance ');
        let thisCube = this.offsetToCube();
        let otherCube = point.offsetToCube();
        return thisCube.distance(otherCube);
    }

    offsetToCube() {
        let x = this.x - (this.y -this.y%2)/2;
        let z = this.y;
        let y = -x-z;
        let cube = new Cube(x,y,z);
        return cube;
    }

    rotateLeft(center){
        let thisCube = this.offsetToCube();
        let centerCube = center.offsetToCube();
        let rotatedCube = thisCube.rotateLeft(centerCube);
        return rotatedCube.cubeToOffset();
    }

    rotateRight(center){
        let thisCube = this.offsetToCube();
        let centerCube = center.offsetToCube();
        let rotatedCube = thisCube.rotateRight(centerCube);
        return rotatedCube.cubeToOffset();
    }

    nextPoint(direction,speed) {
        let nextPoint = this;
        if(speed > 0) {
            nextPoint = this.neighbor(direction);
        }
        //newPoint.print('nextPoint : ');
        return nextPoint;
    }

    inArea(area) {
        //area.print(' inArea ');
        var inclusions = area.points.filter((point) => {
            return (point.x == this.x && point.y == this.y);
        });
        return (inclusions.length > 0);
    }

    print(name) {
        printErr('Point ' + name + '(' + this.x + ',' + this.y + ')');
    }
}

class Area {
    constructor(points) {
        this.points = points;
    }

    concat(otherArea){
        return this.points.concat(otherArea);
    }

    mines(map) {
        let nbMines = 0;
        for(let mine of map.mines){
            if(mine.inArea(this)) { nbMines++;}
        }
        return nbMines;
    }

    print(name) {
        printErr('AREA ' + name);
        let message = "";
        for(let point of this.points) {
            message += '(' + point.x + ',' + point.y + ') ';
        }
        printErr(message);
    }
}

class ShipArea extends Area {

    constructor(stern,center,prow) {
        super()
        this.stern = stern;
        this.center = center;
        this.prow = prow;
        this.points = [this.stern,this.center,this.prow];
        //this.direction = this.direction();
    }

    rotateLeft() {
        return new ShipArea(this.stern.rotateLeft(this.center),this.center,this.prow.rotateLeft(this.center));
    }

    rotateRight() {
        return new ShipArea(this.stern.rotateRight(this.center),this.center,this.prow.rotateRight(this.center));
    }

    next(direction){
        return new ShipArea(this.stern.neighbor(direction),this.center.neighbor(direction),this.prow.neighbor(direction));
    }

    print(title) {
        printErr('SHIP AREA ' + title);
        this.stern.print(' stern ');
        this.center.print(' center ');
        this.prow.print(' prow ');
    }

}

class Line {
    constructor(firstPoint,lastPoint) {
        //firstPoint.print('firstPoint : ');
        //lastPoint.print('lastPoint : ');
        this.firstPoint = firstPoint;
        this.lastPoint = lastPoint;
        this.direction = 0;
        this.setdirection();
        this.length = 0;
        this.setLength();
    }

    setdirection() {
        //printErr('direction' + this.direction);
        if(this.firstPoint.evenLine) {
            if ((this.lastPoint.x > this.firstPoint.x) && (this.lastPoint.y == this.firstPoint.y)) { this.direction = 0; }
            if ((this.lastPoint.x == this.firstPoint.x) && (this.lastPoint.y < this.firstPoint.y)) { this.direction = 1; }
            if ((this.lastPoint.x < this.firstPoint.x) && (this.lastPoint.y < this.firstPoint.y)) { this.direction = 2; }
            if ((this.lastPoint.x < this.firstPoint.x) && (this.lastPoint.y == this.firstPoint.y)) { this.direction = 3; }
            if ((this.lastPoint.x < this.firstPoint.x) && (this.lastPoint.y > this.firstPoint.y)) { this.direction = 4; }
            if ((this.lastPoint.x == this.firstPoint.x) && (this.lastPoint.y > this.firstPoint.y)) { this.direction = 5; }
        }
        else {
            if ((this.lastPoint.x > this.firstPoint.x) && (this.lastPoint.y == this.firstPoint.y)) { this.direction = 0; }
            if ((this.lastPoint.x > this.firstPoint.x) && (this.lastPoint.y < this.firstPoint.y)) { this.direction = 1; }
            if ((this.lastPoint.x == this.firstPoint.x) && (this.lastPoint.y < this.firstPoint.y)) { this.direction = 2; }
            if ((this.lastPoint.x < this.firstPoint.x) && (this.lastPoint.y == this.firstPoint.y)) { this.direction = 3; }
            if ((this.lastPoint.x == this.firstPoint.x) && (this.lastPoint.y > this.firstPoint.y)) { this.direction = 4; }
            if ((this.lastPoint.x > this.firstPoint.x) && (this.lastPoint.y > this.firstPoint.y)) { this.direction = 5; }
        }
        //printErr('direction' + this.direction);
    }

    setLength(){
        this.length = Math.abs(this.firstPoint.x- this.lastPoint.x) + Math.abs(this.firstPoint.y- this.lastPoint.y) + 1;
    }

    print(name){
        printErr(' Line ' + name + ' : (' + this.firstPoint.x + ',' + this.firstPoint.y + ') => ' +
            '(' + this.lastPoint.x + ',' + this.lastPoint.y + ') direction ' + this.direction + ' length ' + this.length);
    }
}

class Barrel {
    constructor(center, units) {
        this.center = center;
        this.units = units;
        this.closest = null;
    }

    print(title) {
        printErr('Barrel ' + title + ' : (' + this.center.x + ',' + this.center.y + ') ' + this.units + ' units');
    }
}

class Ship {
    constructor(center,direction,speed,stock,is_enemy) {
        this.center = center;
        this.direction = direction;
        this.speed = speed;
        this.stock = stock;
        this.is_enemy = (is_enemy == 0);
        this.prow = this.center.neighbor(direction);
        this.stern = this.center.neighbor((direction + 3)%6);
        this.area = new ShipArea(this.stern,this.center,this.prow);
    }

    target(map) {
        let enemyActualPosition = this.closest(map.enemiesShips).center;
        let direction = this.closest(map.enemiesShips).direction;
        let speed = this.closest(map.enemiesShips).speed;
        let enemyFuturePosition = enemyActualPosition.nextPoint(direction,speed);
        enemyFuturePosition = enemyFuturePosition.nextPoint(direction,speed);
        enemyFuturePosition = enemyFuturePosition.nextPoint(direction,speed);
        //let distEnemy = dist(this.center,enemyActualPosition);
        return enemyFuturePosition;
    }

    enableAreas() {
        let nextShipArea = this.area.next(this.direction);
        let newDirection = this.direction;
        let stop = {area: this.area, nextProw: this.prow};
        let left = {area: this.area, nextProw: this.prow};
        let right = {area: this.area, nextProw: this.prow};
        let goOn = {area: this.area, nextProw: this.prow};
        let goOnTurnLeft = {area: this.area, nextProw: this.prow};
        let goOnTurnRight = {area: this.area, nextProw: this.prow};
        if(this.speed == 0) {
            // We stay here or just turn
            stop = {area: this.area, nextProw: this.prow};
            let turnLeft = new Area(this.area.concat(this.area.rotateLeft().points));
            let nextProw = this.prow.rotateLeft(this.center);
            //turnLeft.print('NEXT AREA speed 0 rotateLeft');
            left = {area: turnLeft, nextProw: nextProw};
            let turnRight = new Area(this.area.concat(this.area.rotateRight().points));
            nextProw = this.prow.rotateRight(this.center);
            //turnRight.print('NEXT AREA speed 0 rotateRight');
            right = {area: turnRight, nextProw: nextProw};

            // we go faster, so we need to take care of the prow's poistion the turn after
            nextProw = this.prow.neighbor(this.direction);
            let nextNextProw = nextProw.neighbor(this.direction);
            let areaGoOn = new Area(this.area.concat(nextShipArea.points).concat([nextNextProw]));
            goOn = {area: areaGoOn, nextProw: nextProw};

            let nextProwGoOnTurnLeft = nextShipArea.prow.rotateLeft(nextShipArea.center);
            newDirection = (this.direction + 1)%6;
            nextNextProw = nextProwGoOnTurnLeft.neighbor(newDirection);
            let areaGoOnTurnLeft = new Area(areaGoOn.concat(nextShipArea.rotateLeft().points).concat([nextNextProw]));
            goOnTurnLeft = {area: areaGoOnTurnLeft, nextProw: nextProwGoOnTurnLeft};

            let nextProwGoOnTurnRight = nextShipArea.prow.rotateRight(nextShipArea.center);
            newDirection = (this.direction + 5)%6;
            nextNextProw = nextProwGoOnTurnRight.neighbor(newDirection);
            let areaGoOnTurnRight = new Area(areaGoOn.concat(nextShipArea.rotateRight().points).concat([nextNextProw]));
            goOnTurnRight = {area: areaGoOnTurnRight, nextProw: nextProwGoOnTurnRight};
        }
        else {

            let nextProw = this.prow.neighbor(this.direction);
            stop = {area: nextShipArea, nextProw: nextProw};
            let turnLeft = new Area(nextShipArea.concat(nextShipArea.rotateLeft().points));
            let nextProwLeft = nextProw.rotateLeft(this.center.neighbor(this.direction));
            left = {area: turnLeft,nextProw: nextProwLeft};
            let turnRight = new Area(nextShipArea.concat(nextShipArea.rotateRight().points));
            let nextProwRight = nextProw.rotateRight(this.center.neighbor(this.direction));
            //let newDirectionRight = (this.direction + 5) % 6;
            //nextProw = nextProw.neighbor(newDirectionRight);
            right = {area: turnRight,nextProw: nextProwRight};
            let nextProwGoOn = nextProw.neighbor(this.direction);
            let areaGoOn = new Area(nextShipArea.concat(nextShipArea.next(this.direction).points));
            goOn = {area: areaGoOn, nextProw: nextProwGoOn};
            let areaGoOnTurnLeft = new Area(areaGoOn.concat(nextShipArea.rotateLeft().points));
            let nextProwGoOnTurnLeft = nextShipArea.prow.rotateLeft(nextShipArea.center);
            goOnTurnLeft = {area: areaGoOnTurnLeft, nextProw: nextProwGoOnTurnLeft};
            let areaGoOnTurnRight = new Area(areaGoOn.concat(nextShipArea.rotateLeft().points));
            let nextProwGoOnTurnRight = nextShipArea.prow.rotateRight(nextShipArea.center);
            goOnTurnRight = {area: areaGoOnTurnRight, nextProw: nextProwGoOnTurnRight};
        }
        let enableAreas = {stop: stop, left: left, right: right, goOn: goOn, goOnTurnLeft: goOnTurnLeft, goOnTurnRight: goOnTurnRight};
        return enableAreas;
    }

    moveToClosestBarrel(map) {
        if(map.barrels.length > 0) {
            let closestBarrel = this.closest(map.barrels);
            closestBarrel.print(' closestBarrel ');
            this.doTravel(map);
        }
    }

    fire(map) {
        print('FIRE ' + this.target(map).x + ' ' + this.target(map).y);
    }

    doTravel(map) {

        let closestEnemy = this.closest(map.enemiesShips);
        //printErr('distance closestEnemy :' + this.center.distance(closestEnemy.center));
        if(this.center.distance(closestEnemy.center) < 3) {
            printErr('TOO CLOSE ! FIRE :' + this.direction);
            this.fire(map);
        }

            let enableAreas = this.enableAreas();
            enableAreas.stop.nextProw.print('STOP');
            enableAreas.left.nextProw.print('LEFT');
            enableAreas.right.nextProw.print('RIGHT');
            enableAreas.goOn.nextProw.print('GOON');
            let bestChoice = this.orderChoices(enableAreas,map);
            printErr('bestChoice ' + bestChoice.name);
            let moveTo = new Point(this.center.x,this.center.y);
            switch (bestChoice.name) {
                case 'stop':
                    moveTo = enableAreas.stop.nextProw;
                    break;
                case 'left':
                    moveTo = enableAreas.left.nextProw;
                    break;
                case 'right':
                    moveTo = enableAreas.right.nextProw;
                    break;
                case 'goOn':
                    moveTo = enableAreas.goOn.nextProw;
                    break;
                case 'goOnTurnLeft':
                    moveTo = enableAreas.goOnTurnLeft.nextProw;
                    break;
                case 'goOnTurnRight':
                    moveTo = enableAreas.goOnTurnRight.nextProw;
                    break;
            }
            moveTo.print(' moveTo ');
            if(bestChoice.name == 'goOn' && this.speed > 0) {
                printErr('fire :' + this.direction);
                this.fire(map);
            }
            else {
                this.move(moveTo);
            }
/*
            if(!enableAreas.stop.isSafe(map)) { printErr('stop MINEEEEEEEEEEE !!!!');}
            if(!enableAreas.left.isSafe(map)) { printErr('left MINEEEEEEEEEEE !!!!');}
            if(!enableAreas.right.isSafe(map)) { printErr('right MINEEEEEEEEEEE !!!!');}
            if(!enableAreas.goOn.isSafe(map)) { printErr('goOn MINEEEEEEEEEEE !!!!');}*/
/*            if(map.isMine(nextPointProw)) {
                printErr('MINE !!!');
                this.avoidMine(this.closest(map.barrels).center);
            }
            else {*/
/*                this.closest(map.barrels).center.print(' closest barrel ');
                let distClosestBarrel = this.prow.distance(this.closest(map.barrels).center);
                printErr('distClosestBarrel ' + distClosestBarrel);
                if (line.length <= 2) {// the ship will arrive to destination with his actual speed, we need to turn
                    printErr('change direction');

                    this.closest(map.barrels).center.print(' pos next barrel : ');
                    if (line.lastPoint.x == this.closest(map.barrels).center.x && line.lastPoint.y == this.closest(map.barrels).center.y) { //we are on the barrel
                        map.barrels.splice(0, 1); // the barrel disappears
                    }
                    if(map.barrels.length > 0) {
                        this.closest(map.barrels).center.print(' pos next barrel : ');
                        this.move(this.closest(map.barrels).center);
                    }
                }
                else {
                    printErr('fire direction this :' + this.direction + ' line ' + line.direction);
                    //this.fire(map);
                    if (this.direction == line.direction) { // we have enough time to fire
                        printErr('fire :' + this.direction);
                        this.fire(map);
                    }
                    else {
                        printErr('not enough time to fire :');
                        this.move(this.closest(map.barrels).center);
                    }
                }*/
            //}
/*        }
        else {
            printErr('speed 0 : move to closest barrel ');
            this.move(this.closest(map.barrels).center);
        }*/
    }

    orderChoices(enableAreas,map) {
        //printErr('ORDERCHOICES');
        let scoreStop = new Score('stop');
        let scoreLeft = new Score('left');
        let scoreRight = new Score('right');
        let scoreGoOn = new Score('goOn');
        let scoreGoOnTurnLeft = new Score('goOnTurnLeft');
        let scoreGoOnTurnRight = new Score('goOnTurnRight');

        scoreStop.distance = this.prow.distance(this.closest(map.barrels).center) - enableAreas.stop.nextProw.distance(this.closest(map.barrels).center);
        scoreLeft.distance = this.prow.distance(this.closest(map.barrels).center) - enableAreas.left.nextProw.distance(this.closest(map.barrels).center);
        scoreRight.distance = this.prow.distance(this.closest(map.barrels).center) - enableAreas.right.nextProw.distance(this.closest(map.barrels).center);
        scoreGoOn.distance = this.prow.distance(this.closest(map.barrels).center) - enableAreas.goOn.nextProw.distance(this.closest(map.barrels).center);
        scoreGoOnTurnLeft.distance = this.prow.distance(this.closest(map.barrels).center) - enableAreas.goOnTurnLeft.nextProw.distance(this.closest(map.barrels).center);
        scoreGoOnTurnRight.distance = this.prow.distance(this.closest(map.barrels).center) - enableAreas.goOnTurnRight.nextProw.distance(this.closest(map.barrels).center);
        scoreStop.distance = scoreStop.distance - 0.1;

        scoreStop.mines = enableAreas.stop.area.mines(map) * (-10);
        scoreLeft.mines = enableAreas.left.area.mines(map) * (-10);
        scoreRight.mines = enableAreas.right.area.mines(map) * (-10);
        scoreGoOn.mines = enableAreas.goOn.area.mines(map) * (-10);
        scoreGoOnTurnLeft.mines = enableAreas.goOnTurnLeft.area.mines(map) * (-10);
        scoreGoOnTurnRight.mines = enableAreas.goOnTurnRight.area.mines(map) * (-10);

        if(scoreStop.mines < 0 ) { printErr(enableAreas.stop.area.mines(map) + ' MINES on stop ')}
        if(scoreLeft.mines < 0 ) { printErr(enableAreas.left.area.mines(map) + ' MINES on left ')}
        if(scoreRight.mines < 0 ) { printErr(enableAreas.right.area.mines(map) + ' MINES on right ')}
        if(scoreGoOn.mines < 0 ) { printErr(enableAreas.goOn.area.mines(map) + ' MINES on goOn ')}
        if(scoreGoOnTurnLeft.mines < 0 ) { printErr(enableAreas.goOnTurnLeft.area.mines(map) + ' MINES on goOnTurnLeft ')}
        if(scoreGoOnTurnRight.mines < 0 ) { printErr(enableAreas.goOnTurnRight.area.mines(map) + ' MINES on goOnTurnRight ')}


        scoreStop.print(' stop ');
        scoreLeft.print(' left ');
        scoreRight.print(' right ');
        scoreGoOn.print(' goOn ');
        scoreGoOnTurnLeft.print(' goOnTurnLeft ');
        scoreGoOnTurnRight.print(' goOnTurnRight ');

        let arrayScores = [scoreStop,scoreLeft,scoreRight,scoreGoOn,scoreGoOnTurnLeft,scoreGoOnTurnRight];
        arrayScores.sort(function (a,b) {
            return b.score() - a.score();
        });
        let bestChoice = arrayScores[0];
        printErr('Best choice : ' + bestChoice.name);
        return bestChoice;
    }

    move(point) {
        print('MOVE ' + point.x + ' ' + point.y);
    }

    closest(arrayEntities) {
        let minDist = 100;
        let closest = false;
        for(let i = 0; i< arrayEntities.length; i++) {
            let distBarrel = this.prow.distance(arrayEntities[i].center);
            if(distBarrel < minDist) {
                closest = arrayEntities[i];
                minDist = distBarrel;
            }
        }
        return closest;
    }

    print(title){
        printErr('Ship ' + title + ' : [(' + this.stern.x + ',' + this.stern.y + ')' +
                                        '(' + this.center.x + ',' + this.center.y + ')' +
                                        '(' + this.prow.x + ',' + this.prow.y + ') ' +
                    ' Enemy :' + this.is_enemy + ' Speed ' + this.speed + ' direction ' + this.direction + ' stock ' + this.stock);
    }
}

class Score {
    constructor(name) {
        this.distance = 0;
        this.mines = 0;
        this.canonballs = 0;
        this.name = name;
    }

    score(){
        return (this.distance + this.mines + this.canonballs);
    }

    print() {
        printErr('SCORE ' + this.name + ' : distance ' + this.distance + ' mines ' + this.mines + ' canonballs ' + this.canonballs + ' Total ' + this.score());
    }
}

// game loop
while (true) {
    var myShipCount = parseInt(readline()); // the number of remaining ships
    var entityCount = parseInt(readline()); // the number of entities (e.g. ships, mines or cannonballs)
    var map = new Map();
    for (var i = 0; i < entityCount; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]);
        var entityType = inputs[1];
        var x = parseInt(inputs[2]);
        var y = parseInt(inputs[3]);
        var arg1 = parseInt(inputs[4]);
        var arg2 = parseInt(inputs[5]);
        var arg3 = parseInt(inputs[6]);
        var arg4 = parseInt(inputs[7]);
        let center = new Point(x,y);
        switch (entityType) {
            case "SHIP":
                let boat = new Ship(center,arg1,arg2,arg3,arg4);
                map.addShip(boat,arg4);
                break;
            case "BARREL":
                let barrel = new Barrel(center,arg1);
                map.addBarrel(barrel);
                break;
            case "MINE":
                let mine = new Point(x,y);
                map.addMine(mine);
                break;
        }
    }

    for (let i = 0; i < map.ourShips.length; i++) {
        let ship = map.ourShips[i];
        ship.moveToClosestBarrel(map);
    }
}
