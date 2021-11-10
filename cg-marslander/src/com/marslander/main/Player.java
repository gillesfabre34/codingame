import java.util.*;
import java.io.*;
import java.math.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

class Player {

    static int x;
    static int y;
    static int hSpeed;
    static int vSpeed;
    static int fuel;
    static int rotate;
    static int power;
    static Lander lander;

    public static void main(String args[]) {

        Scanner in = new Scanner(System.in);
        Ground ground = new Ground();
        int surfaceN = in.nextInt(); // the number of points used to draw the surface of Mars.
        Point landLeft = new Point(0,0);
        for (int i = 0; i < surfaceN; i++) {
            int landX = in.nextInt(); // X coordinate of a surface point. (0 to 6999)
            int landY = in.nextInt(); // Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
            Point point = new Point(landX,landY);
            ground.addPoint(point);
            if(landLeft.y == landY){
                ground.flatLeft = landLeft;
                ground.flatRight = point;
            }
            landLeft = point;
        }
        ground.print();

        // game loop
        while (true) {
            x = in.nextInt();
            y = in.nextInt();
            hSpeed = in.nextInt(); // the horizontal speed (in m/s), can be negative.
            vSpeed = in.nextInt(); // the vertical speed (in m/s), can be negative.
            fuel = in.nextInt(); // the quantity of remaining fuel in liters.
            rotate = in.nextInt(); // the rotation angle in degrees (-90 to 90).
            power = in.nextInt(); // the thrust power (0 to 4).
            lander = new Lander(x,y,hSpeed,vSpeed,power,fuel,rotate);
            lander.print(ground);
            lander.move(ground);
            System.out.println(lander.rotate + " " + lander.power);
        }
    }

    public  static class Ground {
        List<Point> points;
        Point flatLeft;
        Point flatRight;

        public Ground(){
            this.points = new ArrayList<>();
        }

        public List<Point> getPoints(Predicate<Point> predicate) {
            return points.stream().filter(predicate).collect(Collectors.toList());
        }

        public void addPoint(Point point){
            this.points.add(point);
        }

        public String posAgainstFlatGround(double x){
            String pos = "inside";
            double security = 50;
            if(x < this.flatLeft.x) { pos= "left";}
            if(x >= this.flatLeft.x && x <= this.flatLeft.x + security) { pos = "borderLeft"; }
            if(x >= this.flatRight.x - security && x <= this.flatRight.x) { pos = "borderRight"; }
            if(x > this.flatRight.x) { pos= "right";}
            return pos;
        }

        @Override
        public String toString() {
            StringBuilder strPoints = new StringBuilder() ;
            for(int i = 0; i < this.points.size(); i++){
                strPoints.append(this.points.get(i).toString() + " ");
            }
            return "Ground \n" + "Points : " + strPoints
                    + "\nFlat ground : " + this.flatLeft.toString() + " " + this.flatRight.toString();
        }

        public void print(){
            System.err.println(this.toString());
        }
    }

    public static class Point {
        int x;
        int y;
        public Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public String toString() {
            return "(" + this.x + "," + this.y + ")";
        }
    }

    public static class Vector {
        double x;
        double y;
        double angle;

        public Vector(double x, double y) {
            this.x = x;
            this.y = y;
            this.angle = this.calculateAngle();
        }

        public boolean tooFast() {
            return (Math.abs(this.x) > 18 || this.y < -38);
        }

        public int calculateAngle(){
            int angle;
            if(this.x == 0 && this.y == 0) {
                angle = 0;
            }
            else if(this.x == 0 && this.y > 0) {
                angle = 0;
            }
            else if(this.x == 0 && this.y < 0) {
                angle = -180;
            }
            else if(this.x > 0) {
                double tan = this.y / this.x;
                angle = (int)Math.floor(Math.toDegrees(Math.atan(tan))) - 90;
            }
            else { /** this.x < 0 */
                double tan = this.y / this.x;
                angle = (int)Math.floor(Math.toDegrees(Math.atan(tan))) + 90;
            }
            return angle;
        }

        public double angleOpposite(){
            return (this.angle > 0) ? this.angle - 180 : this.angle + 180;
        }

        @Override
        public String toString() {
            return "V(" + this.x + "," + this.y + ") Angle : " + this.angle;
        }

        public void print(String name){
            System.err.println("Vector " + name + " : " + this.toString());
        }
    }

    public static class Lander {

        int x;
        int y;
        Vector speedVector;
        int power;
        int fuel;
        int rotate;

        public Lander(int x, int y, int hSpeed, int vSpeed, int power, int fuel, int rotate) {
            this.x = x;
            this.y = y;
            this.speedVector = new Vector(hSpeed,vSpeed);
            this.power = power;
            this.fuel = fuel;
            this.rotate = rotate;
        }

        public double xLanding(Ground ground){
            double yRelative = ground.flatLeft.y - this.y;
            double xLanding = this.x + (this.speedVector.y + Math.sqrt(this.speedVector.y*this.speedVector.y - 2 * 3.711 * yRelative)) * ( this.speedVector.x / 3.711);
//            System.err.println("xLanding : " + xLanding);
            return xLanding;
        }

        public double y(double x){
            double x0 = x - this.x;
            double y = 100000;
            if(this.speedVector.x != 0) {
                y = this.y - 0.5 * 3.711 * x0 * x0 / (this.speedVector.x * this.speedVector.x) + this.speedVector.y * x0 / this.speedVector.x;
            }
            //System.err.println("x : " + x + "y(x) = " + y);
            return y;
        }

        public double t(double x, double y){
            double t = 0;
            if(this.speedVector.x != 0) {
                t = (x - this.x) / this.speedVector.x;
            }
            else if(this.speedVector.y != 0) {
                t = (y - this.y) / this.speedVector.y;
            }
            //System.err.println("t = " + t);
            return t;
        }

        public Vector speed(double x, double y){
            double t = this.t(x,y);
            Vector speedVector = new Vector(this.speedVector.x,-3.711 * t + this.speedVector.y);
            speedVector.print("speed(" + x + ")");
            return speedVector;
        }

        public List<Point> obstacles(Ground ground){
            Predicate<Point> predicate;
            if(this.x < ground.flatLeft.x){
                predicate = point -> point.x > this.x && point.x < ground.flatLeft.x;
            }
            else if(this.x > ground.flatRight.x){
                predicate = point -> point.x > ground.flatRight.x && point.x < this.x;
            }
            else {
                predicate = point -> false;
            }
            List<Point> points = ground.getPoints(predicate);
            System.err.println("Points before flatGround : " + points.toString());
            Iterator<Point> iterator = points.iterator();
            List<Point> obstacles = new ArrayList<>();
            while (iterator.hasNext()){
                Point point = iterator.next();
                if((double)point.y > this.y(point.x)){
                    obstacles.add(point);
                    System.err.println("OBSTACLE : " + point.toString());
                }
            }
            return obstacles;
        }

        public int turnTo(int angle){
            angle = Math.min(angle,90);
            angle = Math.max(angle,-90);
            return angle;
        }

        public void brake(){
            this.power = 0;
            int levelUrgency = 15;
            double angleBrake;
            if(this.speedVector.y < -Math.abs(this.speedVector.x) - levelUrgency) {
                angleBrake = 0;
            }
            else {
                angleBrake = this.speedVector.angleOpposite();
            }
            if(Math.abs(this.rotate - angleBrake) < 45
                    || (this.rotate > -60 && this.rotate < 60)) { /** Correct direction : brake */
                this.power = 4;
            }
            this.rotate = this.turnTo((int)Math.floor(angleBrake));
        }

        public Point findTarget(Ground ground){ /** need to implement this method */
            Point target = new Point(this.x,this.y);
            return target;
        }

        public void move(Ground ground){
            Point target = findTarget(ground);
            String posAgainstFlatGround = ground.posAgainstFlatGround(this.xLanding(ground));
            List<Point> obstacles = this.obstacles(ground);
            System.err.println("obstacles " + obstacles);
            if(obstacles.size() > 0 && Math.abs(this.speedVector.x) > 10){
                this.power = 4;
                this.rotate = 0;
            }
            else {
                switch (posAgainstFlatGround) {
                    case "inside":
                        Vector landingSpeed = this.speed(this.xLanding(ground),ground.flatLeft.y);
                        if(landingSpeed.tooFast()){
                            this.brake();
                        }
                        else {
                            this.power = 0;
                            this.rotate = 0;
                        }
                        break;
                    case "left":
                        this.power = 4;
                        this.rotate = -45;
                        break;
                    case "right":
                        this.power = 4;
                        if(this.speedVector.x < -40){
                            this.rotate = 5;
                        }
                        else {
                            this.rotate = 45;
                        }
                }
            }
        }

        public String toString(Ground ground) {
            return "LANDER : " +
                    "x=" + x +
                    ", y=" + y +
                    ", power=" + power +
                    ", fuel=" + fuel +
                    ", rotate=" + rotate +
                    ", xLanding=" + this.xLanding(ground)
                    ;
        }

        public void print(Ground ground) {
            System.err.println(this.toString(ground));
            this.speedVector.print("Speed vector");
        }
    }
}