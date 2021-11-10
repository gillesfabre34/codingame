import java.util.*;
import java.io.*;
import java.math.*;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Collectors;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

class Player {

    static int playerCount;
    static World world;
    static Empire myEmpire;
    static int nbNeutralZones;

    public static void main(String args[]) {
        Scanner in = new Scanner(System.in);
        playerCount = in.nextInt(); // the amount of players (2 to 4)
        int myId = in.nextInt(); // my player ID (0, 1, 2 or 3)
        int zoneCount = in.nextInt(); // the amount of zones on the map
        int linkCount = in.nextInt(); // the amount of links between all zones
        world = new World(linkCount);
//        System.err.println("zoneCount = " + zoneCount);
        for (int i = 0; i < playerCount; i++) {
            Empire empire = new Empire(i);
            if(i == myId) {
                empire.setIsMyEmpire(true);
            }
            world.empires[i] = empire;
        }
        myEmpire = world.empires[myId];

        for (int i = 0; i < zoneCount; i++) {
            int zoneId = in.nextInt(); // this zone's ID (between 0 and zoneCount-1)
            int platinumSource = in.nextInt(); // the amount of Platinum this zone can provide per game turn
            Zone zone = new Zone(zoneId,platinumSource);
            world.area.zones.add(zone);
        }
        for (int i = 0; i < linkCount; i++) {
            int zone1 = in.nextInt();
            int zone2 = in.nextInt();
            Frontier frontier = new Frontier(world.area.zones.get(zone1),world.area.zones.get(zone2));
            world.frontiers[i] = frontier;
        }
        world.createContinents();
        world.print("");

        // game loop
        while (true) {
            myEmpire.setPlatinum(in.nextInt()); // my available Platinum
            world.removeAllPods();
            nbNeutralZones = 0;
            for (int i = 0; i < zoneCount; i++) {
                int zId = in.nextInt(); // this zone's ID
                Zone zone = world.getZone(zId);
                zone.ownerId = in.nextInt(); // the player who owns this zone (-1 otherwise)
                if(zone.ownerId == -1) nbNeutralZones++;
                world.empires[0].addPods(zone,in.nextInt()); // player 0's PODs on this zone
                world.empires[1].addPods(zone,in.nextInt()); // player 1's PODs on this zone
                int pods2 = in.nextInt();
                if(playerCount > 2) world.empires[2].addPods(zone,pods2); // player 2's PODs on this zone
                int pods3 = in.nextInt();
                if(playerCount > 3) world.empires[3].addPods(zone,pods3); // player 3's PODs on this zone
            }
            world.print(" LOOP ");
            String outputMoving = move();
            StringBuilder outputLanding = new StringBuilder("");
            if(nbNeutralZones > 0) {
                outputLanding.append(landNeutralZones());
            }
            if(myEmpire.getPlatinum() >= 20) {
                outputLanding.append(landOwnedZones());
            }
            // first line for movement commands, second line for POD purchase (see the protocol in the statement for details)
            System.out.println(outputMoving);
            System.out.println(outputLanding);
        }
    }

    public static String move(){
        StringBuilder moves = new StringBuilder("");
        Iterator<Zone> it = myEmpire.getZones().iterator();
        while (it.hasNext()){
            Zone zone = it.next();
            HashSet<Pod> myPods = zone.getPods(myEmpire);
            if(myPods.size() > 0){
                moves.append(zone.movePods());
            }
        }
        if(moves.length() == 0) moves.append("WAIT");
        return moves.toString();
    }

    public static String landNeutralZones(){
//        System.err.println("buyablePods = " + myEmpire.buyablePods());
        Iterator<Zone> it = world.area.getMostProductivesZones().iterator();
        StringBuilder outputLanding = new StringBuilder();
        int nbLanding = 0;
        while (it.hasNext() && myEmpire.getPlatinum() >= 20) {
            Zone nextZone = it.next();
            if(nextZone.ownerId == -1) {
                outputLanding.append("1 " + nextZone.zId + " ");
                nbLanding++;
                myEmpire.setPlatinum(myEmpire.getPlatinum()-20);
//                nextZone.print("land ");² Q<
            }
        }
        System.err.println("NEUTRAL ZONES LANDING : " + nbLanding);
        return outputLanding.toString();
    }

    public static String landOwnedZones(){
        int buyablePods = myEmpire.buyablePods();
        System.err.println("buyablePods = " + buyablePods);
        TreeSet<Zone> mostProductiveZones = world.area.getMostProductivesZones();
        Iterator<Zone> it = mostProductiveZones.iterator();
        StringBuilder outputLanding = new StringBuilder();
        int nbLanding = 0;

        System.err.println("NEUTRAL ZONES LANDING : " + nbLanding);
        System.err.println("nbLanding : " + nbLanding);

        int minForces = 2;
        while (nbLanding < buyablePods) {
            System.err.println("minForces : " + minForces);
            it = mostProductiveZones.iterator();
            while (it.hasNext() && nbLanding < buyablePods) {
                Zone nextZone = it.next();
//                    nextZone.print("land ");
                int forcesBalance = nextZone.forcesBalance();
                System.err.println("forcesBalance = " + forcesBalance);
                if (nextZone.ownerId == myEmpire.getId() && forcesBalance < minForces && nextZone.isBorder()) {
                    outputLanding.append("1 " + nextZone.zId + " ");
                    nbLanding++;
                }
//                    System.err.println("nbLanding = " + nbLanding);
            }
            minForces++;
        }
        return outputLanding.toString();
    }

    public static String toStr(HashSet hashSet){
        Iterator it = hashSet.iterator();
        StringBuilder toStr = new StringBuilder();
        while (it.hasNext()){
            toStr.append(it.next().toString() + "\n");
        }
        return toStr.toString();
    }

    /** ---------------------------------------------------------------- */

    public static class Area implements IArea {
        public ArrayList<Zone> zones;

        public Area() {
            this.zones = new ArrayList<>();
        }

        public Area(ArrayList<Zone> zones){
            this.zones = zones;
        }

        protected Predicate<Zone> byId(int zId) {
            return z -> z.getOwnerId() == zId;
        }

        public int size(){
            return this.getZones().size();
        }
        public ArrayList<Zone> filterZones(ArrayList<Zone> zones, Predicate<Zone> predicate){
            return zones.stream().filter(predicate).collect(Collectors.toCollection(ArrayList<Zone>::new));
        }

        public void addArea(Area area){
            for(Zone zone:area.zones){
                if(!this.zones.contains(zone)) this.zones.add(zone);
            }
        }

        public void removeArea(Area area){
            for(Zone zone:area.zones){
                this.zones.remove(zone);
            }
        }

        public Area getInternalBorders(){
            Area internalBorders = new Area();
            for(Zone zone:zones){
                for(Zone neighbor:zone.neighbors()) {
                    if (!this.zones.contains(neighbor) && !internalBorders.zones.contains(zone)) internalBorders.zones.add(zone);
                }
            }
            return internalBorders;
        }

        public Area getExternalBorders(){
            Area externalBorders = new Area();
            for(Zone zone:zones){
                for(Zone neighbor:zone.neighbors()) {
                    if (!this.zones.contains(neighbor) && !externalBorders.zones.contains(neighbor)) externalBorders.zones.add(neighbor);
                }
            }
            return externalBorders;
        }

        public Area ourArea() {
            Area ourArea = new Area();
            for(Zone zone:zones){
                if (zone.getOwnerId() == myEmpire.id) ourArea.zones.add(zone);
            }
            return ourArea;
        }

        public Area enemyArea() {
            Area enemyArea = new Area();
            for(Zone zone:zones){
                if (zone.getOwnerId() != myEmpire.id) enemyArea.zones.add(zone);
            }
            return enemyArea;
        }

        public TreeSet<Zone> getMostProductivesZones(){
            TreeSet<Zone> zonesTreeSet = new TreeSet<Zone>(new Comparator<Zone>() {
                @Override
                public int compare(Zone a, Zone b) {
                    Integer aPlatinum = a.getPlatinum();
                    Integer bPlatinum = b.getPlatinum();
                    int result = bPlatinum.compareTo(aPlatinum);
                    if(result == 0) {
                        Integer aZid = a.zId;
                        Integer bZid = b.zId;
                        return aZid.compareTo(bZid);
                    }
                    else {
                        return result;
                    }
                }
            });
            zonesTreeSet.addAll(zones);
            return zonesTreeSet;
        }

        public String toString(){
            StringBuilder toStr = new StringBuilder();
            for(Zone zone:this.zones){
                toStr.append(zone.getzId() + " ");
            }
            return toStr.toString();
        }

        public void print(String title){
            System.err.println("AREA " + title + toString());
        }

        public ArrayList<Zone> getZones() {
            return zones;
        }

        public void setZones(ArrayList<Zone> zones) {
            this.zones = zones;
        }
    }

    public interface IArea{
        ArrayList<Zone> filterZones(ArrayList<Zone> zones, Predicate<Zone> predicate);

        void removeArea(Area area);
    }

    /** ---------------------------------------------------------------- */

    public static class World {
        private Area area;
        private Frontier[] frontiers;
        private Empire[] empires;
        private ArrayList<Continent> continents;

        public World(int frontierCount) {
            this.area = new Area();
            this.frontiers = new Frontier[frontierCount];
            this.empires = new Empire[playerCount];
            this.continents = new ArrayList<>();
        }

        @Override
        public String toString(){
            StringBuilder toStr = new StringBuilder("WORLD : " + area.zones.size() + " zones");
            for(int id = 0; id < playerCount; id++){
                toStr.append("\n" + this.empires[id].toString());
            }
            toStr.append("\nContinents : ");
            for(Continent continent:this.continents) {
                toStr.append(continent.area.zones.size() + " / ");
            }
            return toStr.toString();
        }

        public void print(String title){
            System.err.println(title + this.toString());
        }

        public Zone getZone(int zId) {
            return area.zones.get(zId); }

        public HashSet<Zone> getZonesEmpire(Empire empire) {
            HashSet<Zone> zonesHashSet = new HashSet<>(area.filterZones(area.zones,area.byId(empire.getId())));
            return zonesHashSet;
        }

        public void removeAllPods() {
            for(Empire empire:empires) {
                empire.pods.clear();
            }
        }

        public void createContinents() {
            Area worldCopy = new Area();
            worldCopy.zones.addAll(this.area.zones);
            while (worldCopy.zones.size() > 0){
                Continent continent = new Continent();
                continent.area = accessibleZones(worldCopy.zones.get(0));
                world.continents.add(continent);
                worldCopy.removeArea(continent.area);
            }
        }

        public Area accessibleZones(Zone zone){
            Area area = new Area();
            area.zones.add(zone);
            while (area.getExternalBorders().zones.size() > 0){
                area.addArea(area.getExternalBorders());
            }
//            area.print(" accessibleZones ");
            return area;
        }

        public Empire[] getEmpires() {
            return empires;
        }

        public Empire getEmpire(int id) { return this.empires[id]; }

        public void setEmpires(Empire[] empires) {
            this.empires = empires;
        }

        public Frontier[] getFrontiers() {
            return frontiers;
        }

        public void setFrontiers(Frontier[] frontiers) {
            this.frontiers = frontiers;
        }

        public Area getArea() {
            return area;
        }

        public void setArea(Area area) {
            this.area = area;
        }

        public ArrayList<Continent> getContinents() {
            return continents;
        }

        public void setContinents(ArrayList<Continent> continents) {
            this.continents = continents;
        }
    }

    /** ------------------------------------------------------------------ */

    public static class Continent {
        private Area area;

        public Continent(){
            this.area = new Area();
        }
    }

    /** ------------------------------------------------------------------ */

    public static class Path {
        private Area area;

        public Path(){
            this.area = new Area();
        }
    }

    /**------------------------------------------*/


    public static class Zone implements Comparable<Zone> {
        private int zId;
        int ownerId;
        int platinum;

        public Zone(int zId, int platinum) {
            this.zId = zId;
            this.platinum = platinum;
            this.ownerId = -1;
        }

        public Zone(){
            this.zId = 0;
        }

        public Continent continent(){
            Continent continent = world.continents.stream().filter(c -> c.area.zones.contains(this))
                    .collect(Collectors.toCollection(ArrayList<Continent>::new)).get(0);
            return continent;
        }

        public int compareTo(Zone z){
            return (this.zId) - (z.zId);
        }

        @Override
        public String toString(){
            StringBuilder toStr = new StringBuilder("Zone " + zId + ": owner " + ownerId + ", platinum: " + platinum + ", pods : ");
            for(int i = 0; i < playerCount; i++){
                if(this.getPods(world.getEmpire(i)).size() > 0) {
                    toStr.append("E" + i + ": " + this.getPods(world.getEmpire(i)).size() + " ");
                }
            }
            return toStr.toString();
        }

        public void print(String title){
            System.err.println(title + this.toString());
        }

        public HashSet<Pod> getPods(Empire empire){
            return empire.getPods().stream().filter(p -> p.getZone() == this).collect(Collectors.toCollection(HashSet<Pod>::new));
        }

        public int forcesBalance(){
            int myForces = this.getPods(myEmpire).size();
            int bestEnemyForces = 0;
            for(Empire empire:world.empires){
                if(!empire.isMyEmpire && this.getPods(empire).size() > bestEnemyForces) {
                    bestEnemyForces = this.getPods(empire).size();
                }
            }
            return myForces - bestEnemyForces;
        }

        public boolean isBorder() {
            boolean isBorder = false;
            for (Frontier frontier:world.getFrontiers()){
                if((frontier.getZone1().getOwnerId() != frontier.getZone2().getOwnerId())
                        && (frontier.getZone1() == this || frontier.getZone2() == this)){
                    isBorder = true;
                }
            }
            return isBorder;
        }

        public ArrayList<Zone> neighbors(){
            ArrayList<Zone> zones = new ArrayList<>();
            for(Frontier frontier:world.getFrontiers()){
                if(frontier.getZone1() == this) zones.add(frontier.getZone2());
                if(frontier.getZone2() == this) zones.add(frontier.getZone1());
            }
            return zones;
        }

        public ArrayList<Zone> enemyNeighbors(){
            ArrayList<Zone> enemies = new ArrayList<>();
            Iterator<Zone> it = neighbors().iterator();
            while (it.hasNext()){
                Zone zone = it.next();
                if(zId == 26) {
                    System.err.println("zId : " + zId + " neighbor : " + zone.getzId());
                }
                if(zone.getOwnerId() != getOwnerId()) enemies.add(zone);
            }
            return enemies;
        }

        public Zone target() {
            TreeSet<Zone> bestTargets = new TreeSet<>();
            Area neighborhood = new Area(this.neighbors());
            if(neighborhood.enemyArea().size() > 0) {
                bestTargets = neighborhood.enemyArea().getMostProductivesZones();
            }
            else {
                bestTargets = this.continent().area.enemyArea().getMostProductivesZones();
            }
            Iterator<Zone> it = bestTargets.iterator();
            Zone target = (it.hasNext()) ? it.next() : this;
            target.print("Zone " + zId + " TARGETS ");
            return target;
        }

        public Area path(Zone target) {
            Area path = new Area();
            path.zones.add(this);
//            Zone zoneTest = world.getZone(1);
//            path.zones.add(zoneTest);
//            target = world.getZone(5);
            Area areaPathsTraveled = new Area();
            areaPathsTraveled.zones.add(this);
//            areaPathsTraveled.zones.add(zoneTest);
            ArrayList<Area> possiblePaths = new ArrayList<>();
            possiblePaths.add(path);
            Area currentPath;
            boolean foundTarget = false;
            while (areaPathsTraveled.getExternalBorders().zones.size() > 0 && !foundTarget) {
                Iterator<Zone> it1 = areaPathsTraveled.getInternalBorders().zones.iterator();
                while(it1.hasNext() && !foundTarget) {
                    Zone border = it1.next();
                    Iterator<Zone> it2 = border.neighbors().iterator();
                    while(it2.hasNext() && !foundTarget) {
                        Zone neighbor = it2.next();
                        if(!areaPathsTraveled.zones.contains(neighbor)){
                            currentPath = possiblePaths.stream().filter(p -> p.zones.contains(border))
                                    .collect(Collectors.toCollection(ArrayList<Area>::new)).get(0);
                            Area newPath = new Area();
                            newPath.zones.addAll(currentPath.zones);
                            newPath.zones.add(neighbor);
                            possiblePaths.add(newPath);
                            areaPathsTraveled.zones.add(neighbor);
                            if(neighbor.getzId() == target.getzId()) {
                                foundTarget = true;
                                return newPath;
                            }
                        }
                    }
                }
            }
            return path;
        }

        public String movePods(){
            Zone target = this.target();
            Area path = path(target());
            path.print("Path from " + zId + " to " + target.getzId() + " : ");
            StringBuilder movement = new StringBuilder("");
            if(zId != target.getzId()) {
                Zone nextZone = path.zones.get(1);
                nextZone.print(" next zone ");
                movement.append(this.getPods(myEmpire).size() + " " + this.getzId() + " " + nextZone.getzId() + " ");
            }
            return movement.toString();
        }

        public int getzId() {
            return zId;
        }

        public void setzId(int zId) {
            this.zId = zId;
        }

        public int getOwnerId() {
            return ownerId;
        }

        public void setOwnerId(int ownerId) {
            this.ownerId = ownerId;
        }

        public int getPlatinum() {
            return platinum;
        }

        public void setPlatinumSource(int platinum) {
            this.platinum = platinum;
        }
    }

    /** ------------------------------------------------------ */

    public static class Frontier {
        Zone zone1;
        Zone zone2;

        public Frontier(Zone zone1,Zone zone2){
            this.zone1 = zone1;
            this.zone2 = zone2;
        }

        public boolean isInsideEmpire(Empire empire) {
            return zone1.getOwnerId() == zone2.getOwnerId() && zone2.getOwnerId() == empire.getId();
        }

        public boolean isInsideEmpire() {
            return zone1.getOwnerId() == zone2.getOwnerId();
        }

        public boolean isBorderEmpire(Empire empire){
            return !this.isInsideEmpire() && (zone1.getOwnerId() == empire.getId() || zone2.getOwnerId() == empire.getId());
        }

        public boolean isBorderEmpire(){
            return !this.isInsideEmpire();
        }

        @Override
        public String toString(){
            return "Frontier " + zone1.zId + " - " + zone2.zId;
        }

        public int compareTo(Frontier z){
            return (this.zone1.zId) - (z.zone1.zId);
        }

        public void print(String title){
            System.err.println(title + this.toString());
        }

        public Zone getZone1() {
            return zone1;
        }

        public void setZone1(Zone zone1) {
            this.zone1 = zone1;
        }

        public Zone getZone2() {
            return zone2;
        }

        public void setZone2(Zone zone2) {
            this.zone2 = zone2;
        }
    }

    public static class Empire {
        private HashSet<Pod> pods;
        private int platinum;
        private int id;
        private boolean isMyEmpire;
        private Area area;

        public Empire(int id){
            this.id = id;
            this.pods = new HashSet<>();
            isMyEmpire = false;
            platinum = 0;
        }

        public HashSet<Pod> getPods() {
            return pods;
        }

        public void setPods(HashSet<Pod> pods) {
            this.pods = pods;
        }

        public void addPod(Pod pod){ this.pods.add(pod); }

        public void addPods(Zone zone, int nbPods){
            for(int i = 0; i < nbPods; i++){
                Pod pod= new Pod(zone,this);
                this.addPod(pod);
            }
        }

        public int buyablePods() {
            double buyablePods = (double)(this.platinum/20);
            buyablePods = Math.floor(buyablePods);
            return (int)buyablePods;
        }

        public HashSet<Frontier> getFrontiers(){
            HashSet<Frontier> frontiers = Arrays.asList(world.getFrontiers()).stream()
                    .filter(frontier -> { return frontier.isBorderEmpire(this); }  )
                    .collect(Collectors.toCollection(HashSet<Frontier>::new));
            return frontiers;
        }

        public HashSet<Zone> getZones(){
            return  world.getZonesEmpire(this);
        }

        public HashSet<Zone> getInnerBorders(){
            HashSet<Zone> innerBorders = new HashSet<>();
            HashSet<Frontier> frontiers = getFrontiers();
            Iterator<Frontier> it = frontiers.iterator();
            while (it.hasNext()){
                Frontier frontier = it.next();
                Zone innerBorder = (frontier.getZone1().getOwnerId() == id) ? frontier.getZone1() : frontier.getZone2();
                if(!innerBorders.contains(innerBorder)) {
                    innerBorders.add(innerBorder);
                }
            }
            return innerBorders;
        }

        @Override
        public String toString(){
            StringBuilder toStr = new StringBuilder("Empire " + id + ": ");
            toStr.append(world.getZonesEmpire(this).size() + " zones;");
            toStr.append(platinum + " platinum");
            if(isMyEmpire) toStr.append(" My Empire");
            return toStr.toString();
        }

        public int getPlatinum() {
            return platinum;
        }

        public void setPlatinum(int platinum) {
            this.platinum = platinum;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public boolean isMyEmpire() {
            return isMyEmpire;
        }

        public void setIsMyEmpire(boolean myEmpire) {
            this.isMyEmpire = myEmpire;
        }

        public Area getArea() {
            return area;
        }

        public void setArea(Area area) {
            this.area = area;
        }
    }

    public static class Pod {
        Zone zone;
        Empire empire;

        public Pod(Zone zone, Empire empire){
            this.zone = zone;
            this.empire = empire;
        }

        public Zone getZone() {
            return zone;
        }

        public void setZone(Zone zone) {
            this.zone = zone;
        }

        public Empire getEmpire() {
            return empire;
        }

        public void setEmpire(Empire empire) {
            this.empire = empire;
        }
    }
}