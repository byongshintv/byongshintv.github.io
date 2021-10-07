let map = `
########
###.####
### ####
###$ $.#
#. $@###
####$###
####.###
########
`.trim().split("\n").map(v => v.split(""));

let charMeta = {
    void:" ",
    wall:"#",
    goal:".",
    ball:"$",
    inned:"*",
    innedPlayer:"+",
    player:"@"
};
let keyAxis = {
    "up":[-1,0],
    "right":[0,1],
    "down":[1,0],
    "left":[0,-1],
}
function getPlayerAxis(map){
    let axises = []
    for (let i = 0; i < map.length; i++) {
        const row = map[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if(cell === charMeta.player || cell === charMeta.innedPlayer) axises.push( [i,j])
        }
    }
    if(axises.length === 1) return axises[0];
    return axises;
}

let Axis = {
    calc:(axis,adder) => ([axis[0] + adder[0], axis[1] + adder[1]]),
    get:(map,axis) => map?.[axis[0]]?.[axis[1]] || charMeta.wall,
    move:(map,moveAxis,targetAxis) => {
        let nextAxis = Axis.calc(targetAxis,moveAxis)
        let thisObject = Axis.get(map,targetAxis);
        let nextObject = Axis.get(map,nextAxis);

        /*
        if( nextObject === charMeta.wall ){
            return false;
        }
        */
        
        if( nextObject !== charMeta.goal && nextObject !== charMeta.void ){

            let nextStatus = Axis.move(map,moveAxis,nextAxis);
            if( nextStatus === false) return false;
            nextObject = Axis.get(map,nextAxis);
        }

        if( thisObject === charMeta.inned || thisObject === charMeta.ball){
            if(thisObject === charMeta.inned){
                Axis.set(map,targetAxis,charMeta.goal);
            } else {
                Axis.set(map,targetAxis, charMeta.void);
            }
            if(nextObject === charMeta.goal){
                Axis.set(map,nextAxis,charMeta.inned);
            } else {
                Axis.set(map,nextAxis,charMeta.ball)
            }
        } else if ( thisObject === charMeta.player || thisObject === charMeta.innedPlayer){
            if(thisObject === charMeta.innedPlayer){
                Axis.set(map,targetAxis,charMeta.goal);
            } else {
                Axis.set(map,targetAxis, charMeta.void);
            }
            if(nextObject === charMeta.goal){
                Axis.set(map,nextAxis,charMeta.innedPlayer);
            } else {
                Axis.set(map,nextAxis,charMeta.player)
            }
        }
    },
    set:(map,moveAxis,char) => {
        map[moveAxis[0]][moveAxis[1]] = char
    }
}

let Map = {
    decode : (map) => {
        return map.map(v => v.join("")).join("\n")
    },
    encode : (map) => {
        let rows = map.split("\n")
        let maxLength = Math.max.apply(null,rows.map(v => v.length));
        return rows.map(v => v.padEnd(maxLength," ").split(""))
    },
    isWin : (map) => {
        return map.every(row => row.every(v => v !== charMeta.ball));
    },
    isStucked : (map) => {
        let directions = Object.values(keyAxis);
        for (let [i,row] of Object.entries(map)) {
            for (let [j,cell] of Object.entries(row)) {
                if( cell !== charMeta.ball) continue;
                [i,j] = [i*1, j*1]
                let objs = directions.map(v =>  Axis.get(map,Axis.calc(v,[i,j])))
                if( [[0,1],[1,2],[2,3],[3,0]].some(([a,b]) => objs[a] === charMeta.wall && objs[b] === charMeta.wall) ){
                    return true;
                }
            }   
        }
        return false;
    },
    toKey: (map) => {
        return Map.decode(map);
    }

}
let movable = (map,nextAxis,moveAxis) => {
    let depth = 1;
    while(true){
        nextAxis = Axis.calc(nextAxis,moveAxis);
        let nextObject = Axis.get(map,nextAxis)

        if( nextObject === charMeta.wall) return false;
        if( nextObject === charMeta.void || nextObject === charMeta.goal) return true;
        if(depth >= 2) return false;
        depth++;
    }
}
let move = (map,moveAxis,playerAxis) => {
    map = JSON.parse(JSON.stringify(map))
    if(playerAxis === undefined) playerAxis = getPlayerAxis(map);
    if(Array.isArray(playerAxis[0])){
        for (const axis of playerAxis) {
            nextMap = move(map,moveAxis,axis);
            if(nextMap !== false) map = nextMap;
        }
        return map
    }
    if(!movable(map,playerAxis,moveAxis)){
        return false
    }
    Axis.move(map,moveAxis,playerAxis);

    return map
}

function startGame(){
    const readline = require("readline");
    let printMap = () => {
        console.clear();
        console.log(Map.decode(map));
        console.log(`isWin : ${Map.isWin(map)}`);
        console.log(`stucked : ${Map.isStucked(map)}`);
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    printMap();
    process.stdin.on("keypress", (key,keyData) => {
        let {sequence, name} = keyData;
        if( sequence === "\x03" ) {
            process.exit();
        }
        nextMap = move(map,keyAxis[name]);
        if(nextMap) map = nextMap 
        printMap();
    })
};

function bfs(map, options){
    if( !Array.isArray(map)) map = Map.encode(map)
    let memory = {[Map.toKey(map)]:null};
    let directions = Object.values(keyAxis);

    let solve = (originMap) => {
        let prevs = [originMap];
        let nexts = [];
        let gen = 0;
        while(true){
            for (const map of prevs) {
                let prevKey = Map.toKey(map);
                for (const weight of directions) {
                    let nextMap = move(map, weight ); // 움직임
                    if(nextMap === false) continue; //움직일 수 없었을 시 제외

                    let nextKey = Map.toKey(nextMap);
                    if( memory[nextKey] !== undefined ) continue; //이미 수행한 방법일 시 제외
                    if(Map.isStucked(nextMap) === true) continue; //이길 방법이 없을 시 제외
                    memory[nextKey] = prevKey;
                    if( Map.isWin(nextMap) ) return nextKey; //이겼을 시 종료
                    nexts.push(nextMap);
                    
                }  
            }
            if(prevs.length === 0) return false;

            prevs = nexts;
            nexts = [];
            gen++
            if(options?.onStep) options.onStep(gen)
        }

    }

    let printResult = (lastNode) => {
        let result = [lastNode];
        
        while(true){
            lastNode = memory[lastNode];
            if(!lastNode) break;
            result.unshift(lastNode);
        }

        return result;
    }
    let lastNode = solve(map);
    return printResult(lastNode)
}
//startGame()
//console.log(bfs(map).join("\n\n"))

onmessage = (arg)=>{
    let {command, data} = arg.data;
    if( command === "solvemap"){
        let options = {
            onStep: (v) => {postMessage(['step',v])}
        }
        let result = bfs(data, options)
        postMessage(['complete',result])
    }
};