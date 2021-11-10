/**
 * Created by gilles on 12/05/17.
 */

class Game {

    constructor(){
        this.samples = [];
        this.ourRobot = null;
        this.enemyRobot = null;
        this.projects = [];
        this.available = [];
        this.available['A'] = 0;
        this.available['B'] = 0;
        this.available['C'] = 0;
        this.available['D'] = 0;
        this.available['E'] = 0;
    }

    addSample(sample){
        //printErr('add Sample');
        this.samples.push(sample);
    }


    print(){
        printErr('Available : A ' + this.available['A'] + ' B ' + this.available['B'] + ' C ' + this.available['C'] + ' D ' + this.available['D'] + ' E ' + this.available['E']);
        for (let gamer = 0; gamer < 2; gamer++) {
            let msg = '';
            for (let sample of this.samples.filter((sample) => {
                return sample.carriedBy == gamer;
            })) {
                msg += sample.sampleId + ' / ';
            }
            printErr('GAME Samples R' + gamer + ' : ' + msg);
        }
        for(let project of this.projects){
            project.print();
        }
    }
}

class Robot {

    constructor(gamer){
        this.target = 'START_POS';
        this.eta = 0;
        this.score = 0;
        this.storageA = 0;
        this.storageB = 0;
        this.storageC = 0;
        this.storageD = 0;
        this.storageE = 0;
        this.expertiseA = 0;
        this.expertiseB = 0;
        this.expertiseC = 0;
        this.expertiseD = 0;
        this.expertiseE = 0;
        this.samples = [];
        this.booked = [];
        this.booked['A'] = 0;
        this.booked['B'] = 0;
        this.booked['C'] = 0;
        this.booked['D'] = 0;
        this.booked['E'] = 0;
        this.filledSamples = [];
    }

    reInit(inputs){
        this.target = inputs[0];
        this.eta = parseInt(inputs[1]);
        this.score = parseInt(inputs[2]);
        this.storageA = parseInt(inputs[3]);
        this.storageB = parseInt(inputs[4]);
        this.storageC = parseInt(inputs[5]);
        this.storageD = parseInt(inputs[6]);
        this.storageE = parseInt(inputs[7]);
        this.expertiseA = parseInt(inputs[8]);
        this.expertiseB = parseInt(inputs[9]);
        this.expertiseC = parseInt(inputs[10]);
        this.expertiseD = parseInt(inputs[11]);
        this.expertiseE = parseInt(inputs[12]);
    }

    totalBooked() {
        return this.booked['A'] + this.booked['B'] + this.booked['C'] + this.booked['D'] + this.booked['E'];
    }

    expertise() {
        return this.expertiseA + this.expertiseB + this.expertiseC + this.expertiseD + this.expertiseE;
    }

    phase() {
        let expertise = this.expertise();
        if(expertise < 8) { return 1; }
        else if(expertise >= 8 && expertise < 12) { return 2;}
        else return 3;
    }

    minProfit(){ /** Use this method if you want to throw samples with low profitability **/
        if(this.phase() == 1) { return 0;}
        else if(this.phase() == 2) { return 2;}
        else { return 5;}
    }

    addSamples(game){
        this.samples = game.samples.filter((sample) => {
            return sample.carriedBy == 0;
        })
    }

    cost(sample,nameMolecule){
        let cost = 0;
        let costAttribute = 'cost' + nameMolecule;
        cost += sample[costAttribute];
        return cost;
    }

    needMolecule(){
        let needMolecule = false;
        for(let sample of this.samples){
            if(this.needMoleculeSample(sample)){
                needMolecule = true;
                break;
            }
        }
        return needMolecule;
    }

    needMoleculeSample(sample){
        let needMoleculeSample = (this.filledSamples[sample.sampleId] != true &&
            ( this.needMoleculeSampleNameMolecule(sample,'A')
            || this.needMoleculeSampleNameMolecule(sample,'B')
            || this.needMoleculeSampleNameMolecule(sample,'C')
            || this.needMoleculeSampleNameMolecule(sample,'D')
            || this.needMoleculeSampleNameMolecule(sample,'E'))
        );
        // printErr('needMoleculeSample ' + sample.sampleId + ' : ' + needMoleculeSample);
        return needMoleculeSample;
    }

    needMoleculeSampleNameMolecule(sample,nameMolecule){
/*        printErr('needMoleculeSampleNameMolecule ' + nameMolecule + ' SId' + sample.sampleId + ' Cost ' + sample['cost' + nameMolecule] + ' St ' + this['storage' + nameMolecule]
            + ' Xp ' + this['expertise' + nameMolecule] + ' Bk ' + this.booked[nameMolecule]);*/
        let nmsnm = sample['cost' + nameMolecule] > this['storage' + nameMolecule] + this['expertise' + nameMolecule] - this.booked[nameMolecule];
        return nmsnm;
    }

    storage(){
        return this.storageE + this.storageD + this.storageC + this.storageB + this.storageA;
    }

    full(){
        return((this.storage() >= 10) || !this.needMolecule());
    }

    takeMolecule(game) {
        let available = game.available;
        let samples = this.samples.sort((a,b) => { /** We order samples by decreasing profit */
            return a.profitability(this,game) <= b.profitability(this,game);
        });
        samples = samples.filter((sample) => { /** We choose only samples which need a molecule */
            return (this.needMoleculeSample(sample) && sample.willBeEnable(game, available));
        });
        if(samples.length == 0) {
            return null;
        }
        else {
            samples[0].print('samples[0]',game,this);
            let chosenMolecule = this.chooseMoleculeForSample(samples[0]);
            printErr('chosenMolecule = ' + chosenMolecule);
            this['storage' + chosenMolecule] += 1;
            if(!this.needMoleculeSample(samples[0])){
                this.bookMolecules(samples[0]);
            }
            return chosenMolecule;
        }
    }

    chooseMoleculeForSample(sample){
        if (this.needMoleculeSampleNameMolecule(sample,'A')) {
            return 'A';
        }
        else if (this.needMoleculeSampleNameMolecule(sample,'B')) {
            return 'B';
        }
        else if (this.needMoleculeSampleNameMolecule(sample,'C')) {
            return 'C';
        }
        else if (this.needMoleculeSampleNameMolecule(sample,'D')) {
            return 'D';
        }
        else if(this.needMoleculeSampleNameMolecule(sample,'E')) {
            return 'E';
        }
        else {
            return null;
        }
    }

    bookMolecules(sample){
        printErr('bookMolecules sample ' + sample.sampleId);
        this.booked['A'] += Math.max(sample.costA - this.expertiseA,0);
        this.booked['B'] += Math.max(sample.costB - this.expertiseB,0);
        this.booked['C'] += Math.max(sample.costC - this.expertiseC,0);
        this.booked['D'] += Math.max(sample.costD - this.expertiseD,0);
        this.booked['E'] += Math.max(sample.costE - this.expertiseE,0);
        this.filledSamples[sample.sampleId] = true;
    }

    unBookMolecules(){
        this.booked['A'] = 0;
        this.booked['B'] = 0;
        this.booked['C'] = 0;
        this.booked['D'] = 0;
        this.booked['E'] = 0;
        this.filledSamples = [];
    }


    sampleToReject(game){
        let __self = this;
        let orderedSamples = this.samples.sort((a,b) => {
            return a.profitability(__self,game) - b.profitability(__self,game);
        });
        return (orderedSamples[0].profitability(__self,game) < this.minProfit()) ? orderedSamples[0] : false;
    }

    fullSample(sample){
        return(this.storageE >= sample.costE - this.expertiseE
        && this.storageD >= sample.costD - this.expertiseD
        && this.storageC >= sample.costC - this.expertiseC
        && this.storageB >= sample.costB - this.expertiseB
        && this.storageA >= sample.costA - this.expertiseA);
    }

    fullSamples(game) {
        let __self = this;
        let fullSamples = this.samples.filter((sample) => {
            return __self.fullSample(sample);
        });
        return fullSamples;
    }

    printSamples(name,game){
        printErr('Samples our robot : ' + name);
        for(let sample of this.samples){
            sample.print('takeMolecule',game,this);
        }
    }

    print(name,game){
        let msgSamples = ' S[';
        for(let sample of this.samples){
            msgSamples += sample.sampleId + '/';
        }
        msgSamples = msgSamples.substr(0,msgSamples.length - 1) + ']';
        printErr('ROBOT ' + name + ' T ' + this.target + msgSamples  + ' ETA ' + this.eta  + ' S ' + this.score  + ' A ' +
            this.storageA + ' B ' + this.storageB + ' C ' + this.storageC + ' D ' + this.storageD + ' E ' + this.storageE);
        for(let sample of this.samples){
            sample.print(sample.sampleId,game,this);
        }
    }
}

class Sample {

    constructor(sampleId,carriedBy,rank,expertiseGain,health,costA,costB,costC,costD,costE){
        this.sampleId = sampleId;
        this.carriedBy = carriedBy;
        this.rank = rank;
        this.expertiseGain = expertiseGain;
        this.health = health;
        this.costA = costA;
        this.costB = costB;
        this.costC = costC;
        this.costD = costD;
        this.costE = costE;
    }

    cost(robot){
        let cost = Math.max(0,this.costA - robot.expertiseA) + Math.max(0,this.costB - robot.expertiseB)
            +  Math.max(0,this.costC - robot.expertiseC) + Math.max(0,this.costD - robot.expertiseD)
            + Math.max(0,this.costE - robot.expertiseE);
        // printErr('COST ' + cost);
        return cost;
    }

    willBeEnable(game,available){
        if(this.enable(game.ourRobot,available)){
            return true;
        }
        else {
            if(game.enemyRobot.target == 'LABORATORY'){ /** Maybe should we wait to can fill our samples ? */
                printErr('Enemy goes to Laboratory !');
                this.print('willBeEnable',game,game.ourRobot);
                printErr(game.zzz[0]);
            }
        }
    }

    enable(robot,available){
        let enable = (
            this.costA - robot.expertiseA - robot.storageA + robot.booked['A'] <= available['A']  &&
            this.costB - robot.expertiseB - robot.storageB + robot.booked['B'] <= available['B'] &&
            this.costC - robot.expertiseC - robot.storageC + robot.booked['C'] <= available['C'] &&
            this.costD - robot.expertiseD - robot.storageD + robot.booked['D'] <= available['D'] &&
            this.costE - robot.expertiseE - robot.storageE + robot.booked['E'] <= available['E'] &&
            this.cost(robot) <= 10 - robot.totalBooked()
        );
/*        printErr('enable A : Cost ' + this.costA + ' Exp ' + robot.expertiseA + ' Avl ' + game.available['A']);
        printErr('enable B : Cost ' + this.costB + ' Exp ' + robot.expertiseB + ' Avl ' + game.available['B']);
        printErr('enable C : Cost ' + this.costC + ' Exp ' + robot.expertiseC + ' Avl ' + game.available['C']);
        printErr('enable D : Cost ' + this.costD + ' Exp ' + robot.expertiseD + ' Avl ' + game.available['D']);
        printErr('enable E : Cost ' + this.costE + ' Exp ' + robot.expertiseE + ' Avl ' + game.available['E']);
        printErr('Cost robot : ' + this.cost(robot) + ' totalBooked : ' + robot.totalBooked());
        printErr('enable sample ' + this.sampleId + ' : ' + enable);*/
        return enable;
    }

    profitability(robot,game){
        if(!this.enable(robot,game.available)){
            return 0;
        }
        else {
            let profit = this.health / this.cost(robot);
            return profit;
        }
    }

    print(name,game,robot){
        printErr('SAMPLE ' + name + ' id ' + this.sampleId  + ' by ' + this.carriedBy  + ' rank ' + this.rank  + ' health ' + this.health
            + ' PR ' + this.profitability(robot,game) + ' A ' + this.costA + ' B ' + this.costB  + ' C ' + this.costC   + ' D ' + this.costD
            + ' E ' + this.costE )
    }
}

class Project {

    constructor(){
        this.id = 0;
        this.molecules = [];
    }

    print(){
        printErr('PROJECT ' + this.id + ' A ' + this.molecules['A'] + ' B ' + this.molecules['B'] + ' C ' + this.molecules['C']
            + ' D ' + this.molecules['D'] + ' E ' + this.molecules['E'])
    }
}

/**
 * Bring data on patient samples from the diagnosis machine to the laboratory with enough molecules to produce medicine!
 **/


let game = new Game();
let projectCount = parseInt(readline());
for (let i = 0; i < projectCount; i++) {
    let inputs = readline().split(' ');
    let project = new Project();
    project.id = i;
    project.molecules['A'] = parseInt(inputs[0]);
    project.molecules['B'] = parseInt(inputs[1]);
    project.molecules['C'] = parseInt(inputs[2]);
    project.molecules['D'] = parseInt(inputs[3]);
    project.molecules['E'] = parseInt(inputs[4]);
    game.projects.push(project);
}

let ourRobot = new Robot(0);
let enemyRobot = new Robot(1);
let turn = 0;
game.ourRobot = ourRobot;
game.enemyRobot = enemyRobot;

// game loop
while (true) {
    turn ++;
    game.samples = [];
    for (let i = 0; i < 2; i++) {
        let inputs = readline().split(' ');
        if(i==0){
            game.ourRobot.reInit(inputs);
        }
        else {
            game.enemyRobot.reInit(inputs);
        }
    }
    ourRobot = game.ourRobot;
    enemyRobot = game.enemyRobot;
    let inputs = readline().split(' ');
    game.available['A'] = parseInt(inputs[0]);
    game.available['B'] = parseInt(inputs[1]);
    game.available['C'] = parseInt(inputs[2]);
    game.available['D'] = parseInt(inputs[3]);
    game.available['E'] = parseInt(inputs[4]);
    let sampleCount = parseInt(readline());
    for (let i = 0; i < sampleCount; i++) {
        let inputs = readline().split(' ');
        let sampleId = parseInt(inputs[0]);
        let carriedBy = parseInt(inputs[1]);
        let rank = parseInt(inputs[2]);
        let expertiseGain = inputs[3];
        let health = parseInt(inputs[4]);
        let costA = parseInt(inputs[5]);
        let costB = parseInt(inputs[6]);
        let costC = parseInt(inputs[7]);
        let costD = parseInt(inputs[8]);
        let costE = parseInt(inputs[9]);
        let sample = new Sample(sampleId,carriedBy,rank,expertiseGain,health,costA,costB,costC,costD,costE);
        game.addSample(sample);
    }
    game.print();
    ourRobot.addSamples(game);
    ourRobot.print('our',game);
    enemyRobot.print('enemy',game);
    if(ourRobot.eta > 0) {
        print('WAIT');
    }
    else {
        switch (ourRobot.target) {
            case 'SAMPLES':
                if (ourRobot.samples.length < 3) {
                    print('CONNECT ' + ourRobot.phase());
                }
                else {
                    print('GOTO DIAGNOSIS');
                }
                break;
            case 'DIAGNOSIS':
                let undiagnosedSamples = ourRobot.samples.filter((sample) => {
                    return sample.costA < 0;
                });
                if (undiagnosedSamples.length > 0) {
                    /** we make diagnosis **/
                    print('CONNECT ' + undiagnosedSamples[0].sampleId);
                }
                else { /** Diagnosis finished **/
                    switch (ourRobot.samples.length) {
                        case 0:
                            /** We rejected all samples **/
                            print('GOTO SAMPLES');
                            break;
                        case 1: /** We found the best sample **/
                            if (ourRobot.samples[0].profitability(ourRobot, game) <= ourRobot.minProfit()) {
                                print('CONNECT ' + ourRobot.samples[0].sampleId);
                            }
                            else {
                                print('GOTO MOLECULES');
                            }
                            break;
                        default:
                            if (ourRobot.sampleToReject(game)) {
                                print('CONNECT ' + ourRobot.sampleToReject(game).sampleId);
                            }
                            else {
                                print('GOTO MOLECULES');
                            }
                    }
                }
                break;
            case 'MOLECULES':
                if (ourRobot.full()) {
                    print('GOTO LABORATORY');
                }
                else {
                    let msg = 'filledSamples ';
                    for(let sampleId of ourRobot.filledSamples){
                        msg += sampleId + '/'
                    }
                    printErr(msg);
                    let molecule = ourRobot.takeMolecule(game);
                    if (molecule != null) {
                        print('CONNECT ' + molecule);
                    }
                    else {
                        //ourRobot.printSamples('MOLECULES',game);
                        if (ourRobot.fullSamples(game).length > 0) {
                            print('GOTO LABORATORY');
                        }
                        else {
                            print('GOTO SAMPLES');
                        }
                    }
                }
                break;
            case 'LABORATORY':
                if (ourRobot.fullSamples(game).length > 0) {
                    ourRobot.unBookMolecules();
                    print('CONNECT ' + ourRobot.fullSamples(game)[0].sampleId);
                }
                else {
                    let comeBackToMolecules = false;
                    if(ourRobot.samples.length > 0) { /** There are samples not full **/
                        for(let sample of ourRobot.samples) {
                            if (sample.profitability(ourRobot, game) >= ourRobot.minProfit()) {
                                comeBackToMolecules = true;
                                break;
                            }
                        }
                    }
                    if(comeBackToMolecules) {
                        print('GOTO MOLECULES');
                    }
                    else {
                        print('GOTO SAMPLES');
                    }
                }
                break;
            default:
                print('GOTO SAMPLES');
        }
    }
}
