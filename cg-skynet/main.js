/**
 * Created by gilles on 25/04/17.
 */


class Network {

    constructor() {
        this.nodes = [];
        this.links = [];
        this.skynet = null;
    }

    addNode(node) {
        this.nodes.push(node);
    }

    addLink(link) {
        this.links.push(link);
    }

    getGateways() {
        return this.nodes.filter((node) => {
            return node.gateway == true;
        })
    }

    init() {
        for(let node of this.nodes) {
            node.virtuallyReached = false;
            if(node.gateway) {
                let linksNode = node.getLinks(this);
                node.safe = true;
                node.resistance = 10000;
                for (let link of linksNode) {
                    if (!link.broken && !node.nextNode(link).gateway) {
                        node.safe = false;
                        node.resistance = 0;
                    }
                }
            }
        }
        for(let link of this.links) {
            if(!link.broken) link.virtuallyBroken = false;
            link.resistance = 0;
            link.breakable = link.severable();
        }
        this.createTunnels()
    }

    /** When we have the above situation, we must create a "tunnel" between 0 and 3, because of the danger with the double-link to gateway inside the network
     *          0
     *        /  \
     *       1-G-2
     *       \  /
     *        3
     */
    createTunnels(){
        let gateways = this.getGateways().filter((gateway) => {
            return gateway.getLinks(this).length == 2;
        });
        for(let node of gateways){
            let linkLeft = node.getLinks(this)[0];
            let linkRight = node.getLinks(this)[1];
            let nodeLeft = node.nextNode(linkLeft);
            let nodeRight = node.nextNode(linkRight);
            let nextNodesLeft = [];
            for (let link of nodeLeft.getLinks(this)){
                nextNodesLeft.push(nodeLeft.nextNode(link));
            }
            let connexions = [];
            for (let link of nodeRight.getLinks(this)){
                let nextNodeRight = nodeRight.nextNode(link);
                if(nextNodesLeft.includes(nextNodeRight) && !nextNodeRight.gateway){
                    connexions.push(nextNodeRight);
                }
            }
            if(connexions.length == 2) {
                let linkTunnel = new Link(connexions[0],connexions[1]);
                this.addLink(linkTunnel);
            }
        }
    }

    getWeakestLink(){
        let minResistance = 100;
        let weakestLink = null;
        let weakestLinks = this.links.filter((link) => {
            return link.breakable && !link.broken;
        });
        for(let link of weakestLinks){
            if(link.resistance < minResistance) {
                weakestLink = link;
                minResistance = link.resistance;
            }
        }
        return weakestLink;
    }

    getNode(index) {
        return this.nodes.filter((node) => {
            return node.index == index;
        })[0];
    }

    /** Find every link which can be broken and which have not been broken by a path created before **/
    virtuallyBrokableLinks(){
        return this.links.filter((link) => {
            return link.virtuallyBroken == false && link.breakable == true;
        })
    }

    /** each turn on dijkstra's-like algorithm, we increase resistances of links which have not been reached by last paths **/
    increaseResistances(){
        for(let node of this.getGateways()){
            if(!node.virtuallyReached) {
                node.resistance++;
            }
        }
        let linksNotVirtuallyBroken = this.links.filter((link) => {
            return !link.virtuallyBroken && link.breakable;
        });
        for(let link of linksNotVirtuallyBroken){
            link.resistance += 1;
        }
    }

    /** If path arrives in breakable link, decrease his resistance, and propagate danger if multiple gateways linked to same node **/
    decreaseResistances(node,path){
        let breakableLinks = node.getLinks(this).filter((linkToGateway) => {
           return linkToGateway.breakable && !linkToGateway.broken;
        });

        for(let breakableLink of breakableLinks){
            breakableLink.resistance = breakableLink.resistance - breakableLinks.length;
            if(breakableLink.N1 == this.skynet || breakableLink.N2 == this.skynet) { /** direct contact with Skynet, cut this link without other calculation **/
                breakableLink.resistance = breakableLink.resistance - 10;
            }
            if(breakableLinks.length > 1) { /**  multiple links involve to decrease their resistance **/
                breakableLink.resistance = breakableLink.resistance - 1 - 0.1*(breakableLinks.length - 1) ; /** use 0.1*(...) to decrease resistance of nodes between mulitple gateways **/
            }

        }
        let danger = breakableLinks.length - 1;
        if((danger > 0) && !node.virtuallyReached){ /** nodes before dangerous point must have lower resistance **/
            this.propagateDanger(path,danger);
        }
    }

    /** danger coming from nodes connected to multiple gateways but be propagaten to every node nearer from Skynet **/
    propagateDanger(path,danger){
        for(let i = path.nodes.length-2; i >= 0; i--){ /** we begin with the last node before path's end **/
            /** If path.nodes[i] linked to gateway, propagate danger **/
            if(path.nodes[i].getLinksToGateways(this).length > 0) {
                let linksToGateways = path.nodes[i].getLinksToGateways(this);
                for(let link of linksToGateways){
                    link.resistance = link.resistance - danger;
                }
            }
            else {
                break;
            }
        }
    }

    printResistances(){
        let printLinks = "Links resistance :";
        let linksNotVirtuallyBroken = this.links.filter((link) => {
            return link.breakable && !link.broken;
        });
        linksNotVirtuallyBroken.sort((a,b) => {
            return a.resistance - b.resistance;
        });
        for(let link of linksNotVirtuallyBroken){
            printLinks += link.N1.index + '-' + link.N2.index + ' R ' + Math.round(link.resistance*100)/100 + ' / ';
        }
        printErr(printLinks);
    }

    print(name) {
        let printNodes = "";
        for(let node of this.nodes) {
            printNodes += node.index + ' ';
            if(node.gateway) {
                printNodes += ' G ';
            }
            else {
                printNodes += ' NG ';
            }
            printNodes += ' R ' + node.resistance + ' / ';
        }
        let printLinks = "";
        for(let link of this.links) {
            printLinks += link.N1.index + '-' + link.N2.index + ' R ' + link.breakable + ' ';
        }
        printErr(name);
        printErr('Nodes : ' + printNodes);
        printErr('Links : ' + printLinks);
    }
}


class Node {
    constructor(index) {
        this.index = index;
        this.gateway = false;
        this.resistance = 0;
        this.virtuallyReached = false;
        this.gatewayNeighbors = [];
    }

    nextNode(link){
        let nextNode = null;
        if(link.N1.index == this.index) { nextNode = link.N2; }
        if(link.N2.index == this.index) { nextNode = link.N1; }
        return nextNode;
    }

    getLinks(network){
        return network.links.filter((link) => {
            return link.N1.index == this.index || link.N2.index == this.index;
        })
    }

    getLinksNotBroken(network){
        let linksNode = this.getLinks(network);
        return linksNode.filter((link) => {
            return (!link.virtuallyBroken && !link.broken);
        })
    }

    getLinksToGateways(network) {
        let links = this.getLinks(network);
        let linksNotBroken = links.filter((link) => {
            return !link.broken && link.breakable;
        });
        return linksNotBroken;
    }

    setGateway(isGateway){
        this.gateway = isGateway;
    }

    print(name){
        printErr('Node ' + name + ' ' +this.index + ' G ' + this.gateway + ' GN ' + this.gatewayNeighbors.length + ' R ' + this.resistance);
    }
}

class Path {

    constructor() {
        this.nodes = [];
    }

    addNodesToPath(nodes) {
        for(let node of nodes)        {
            this.nodes.push(node);
        }
    }

    lastNode() {
        return this.nodes[this.nodes.length-1];
    }

    print(name){
        let msg = "";
        for(let node of this.nodes){
            msg += node.index ;
        }
        printErr('Path ' + name + ' ' + msg);
    }
}

class Link {
    constructor(N1,N2) {
        this.N1 = N1;
        this.N2 = N2;
        this.breakable = false;
        this.broken = false;
        this.virtuallyBroken = false;
        this.resistance = 0;
    }

    cut(){
        this.breakable = false;
        this.broken = true;
        print(this.N1.index + ' ' + this.N2.index);
    }

    severable(){
        return (this.N1.gateway || this.N2.gateway);
    }

    print(name){
        printErr('Link ' + name + ' '  + this.N1.index + '-' + this.N2.index + ' R ' + this.resistance + ' breakable ' + this.breakable + ' VB ' + this.virtuallyBroken);
    }
}


/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

let inputs = readline().split(' ');
let network = new Network();
let N = parseInt(inputs[0]); // the total number of nodes in the level, including the gateways
let L = parseInt(inputs[1]); // the number of links
let E = parseInt(inputs[2]); // the number of exit gateways

for(let i = 0; i < N; i++){
    let node = new Node(i);
    network.addNode(node);
}


for (let i = 0; i < L; i++) {
    let inputs = readline().split(' ');
    let N1 = parseInt(inputs[0]); // N1 and N2 defines a link between these nodes
    let N2 = parseInt(inputs[1]);
    let Node1 = network.getNode(N1);
    let Node2 = network.getNode(N2);
    let link = new Link(Node1, Node2);
    network.addLink(link);
}

for (let i = 0; i < E; i++) {
    let EI = parseInt(readline()); // the index of a gateway node
    network.getNode(EI).setGateway(true);
}

for(let i = 0; i < L; i++){
    network.links[i].breakable = network.links[i].severable();
}

let turn = 0;
// game loop
while (true) {
    turn++;
    let SI = parseInt(readline()); // The index of the node on which the Skynet agent is positioned this turn
    network.init(); /** init or re-init network **/
    network.skynet = network.getNode(SI);
    /** we'll find all paths comingfrom sourcePath = skynet position **/
    let sourcePath = new Path();
    sourcePath.nodes.push(network.skynet);
    let paths = [];
    paths[0] = [sourcePath];
    let breakableLinks = network.virtuallyBrokableLinks();
    let d = 0;
    while(breakableLinks.length > 0 && d < 100){  /** Dijkstra-like algorithm : we start from Skynet and find all the paths from it **/
        d++;
        network.increaseResistances(); /** when distance increases, resistance of unreached links increases too **/
        paths[d] = [];
        for(let path of paths[d-1]) { /** we use the last nodes of paths with length=d-1 to add new nodes and construct paths with length = d **/
            let lastNode = path.lastNode();
            if(!lastNode.gateway) { /** not a gateway, we continue to build our paths **/
                let linksLastNode = lastNode.getLinksNotBroken(network); /** we find the links where we can go now **/
                for (let link of linksLastNode) {
                    let nextNode = lastNode.nextNode(link); /** we find unreached node **/
                    let newPath = new Path();
                    newPath.addNodesToPath(path.nodes); /** we create a path with length d **/
                    newPath.nodes.push(nextNode);
                    link.virtuallyBroken = true; /** we virtually break the link to don't use it with other paths **/
                    paths[d].push(newPath);
                }
                if(!lastNode.virtuallyReached) { /** we arrive for first time on this gateway, so decrease resistances of this link and last links of this path **/
                    network.decreaseResistances(lastNode, path);
                    lastNode.virtuallyReached = true;
                }
            }
        }
        breakableLinks = network.virtuallyBrokableLinks(); /** we re-init breakableLinks after the loop, so breakableLinks.length decreases **/
    }
    let weakestLink = network.getWeakestLink();
    weakestLink.print('weakestLink');
    network.printResistances();
    weakestLink.cut();
}