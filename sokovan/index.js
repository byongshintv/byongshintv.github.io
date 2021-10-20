let charEmoji = {
    " ": "⬜",
    "#": "🔥",
    ".": "🕳️",
    "$": "🧀",
    "*": "⛳",
    "+": "🐱",
    "@": "🐭"
};


let $ = document.querySelector.bind(document);
let $$ = (selector) => [...document.querySelectorAll(selector)];


function initCanvas(width, height) {
    if (width === false) return;
    if (typeof width === "string") {
        let map = Map.encode(width);
        let html = map.map(row => row.map(cell => `<span class="tile" data-charid="${cell}">${charEmoji[cell]}</span>`).join("")).join("<br />");
        $("#input").innerHTML = html;
        $("#width").value = map[0].length;
        $("#height").value = map.length;
    } else {
        width ||= $("#width").value * 1;
        height ||= $("#height").value * 1;
        let row = `<span class="tile" data-charid="#">${charEmoji["#"]}</span>`.repeat(width) + "<br />"
        $("#input").innerHTML = row.repeat(height)
    }

    initCanvasEvent()
}

let isMouseDown = (() => {
    let isMouseDown = false;
    document.addEventListener("mousedown", () => {
        isMouseDown = true
    })
    document.addEventListener("touchstart", () => {
        isMouseDown = true
    })
    document.addEventListener("mouseup", () => {
        isMouseDown = false;
    })
    document.addEventListener("touchend", () => {
        isMouseDown = false;
    })
    return () => isMouseDown;
})();


function initCanvasEvent() {
    let tileClickEvent = function (e) {
        e.preventDefault();
        if (!isMouseDown() && e.type === "mousemove") return;
        let $btn = $(".charbtn.active");
        let charId = $btn.dataset.charid;
        let emoji = $btn.innerText;
        this.dataset.charid = charId;
        this.innerText = emoji;
    }

    $$(".tile").map(ele => {
        ele.addEventListener("click", function (e) {
            e.preventDefault();
        })

        ele.addEventListener("mousemove", tileClickEvent)
        ele.addEventListener("mousedown", tileClickEvent)
        ele.addEventListener("touchmove", tileClickEvent)
    })
}

function encodeCanvas() {
    let emojis = $("#input").innerText
    Object.entries(charEmoji).forEach(([id, emo]) => emojis = emojis.replaceAll(emo, id));
    return emojis.split("\n").map(v => v.split(""))
}

async function solveMap(data = `########\n###.####\n### ####\n###$ $.#\n#. $@###\n####$###\n####.###\n########`, onStep = () => {}){
    return new Promise((res,rej) => {
        const worker = new Worker("stratgy.js");
        worker.postMessage({command:"solvemap",data})
        worker.onmessage = ({data})=>{
            let [command, datas] = data;
            if(command === "step") onStep(datas);
            else if(command = "complete") res(datas);
        };

    })
}

window.addEventListener('DOMContentLoaded', () => {
    //$("#inputMenu").innerHTML = Object.entries(charEmoji).map(([key,value]) => `<span class="charbtn" data-charid="${key}">${value}</span>`).join("")
    // 메뉴 아이콘 버튼 클릭시 active 
    $$("#inputMenu .charbtn").map(ele => ele.addEventListener("click", function () {
        $$("#inputMenu span").map(ele => ele.classList.remove("active"));
        this.classList.add("active");
    }))

    let defaultMap = `########\n###.####\n### ####\n###$ $.#\n#. $@###\n####$###\n####.###\n########`
    initCanvas(defaultMap);

    function instanceMove(command){
        let map = encodeCanvas();
        let moveAxis = keyAxis[command];
        let nextMap = move(map, moveAxis)
        if (!nextMap) return;
        initCanvas(Map.decode(nextMap))
    }
    document.addEventListener("keydown", ({ key }) => {
        if (!key.match(/Arrow.*/)) return;
        let command = key.replace("Arrow", "").toLowerCase()
        instanceMove(command)
    });

    $$("#gamepad .padbtn").forEach(ele => ele.addEventListener("mousedown",function(e){
        
        e.preventDefault();
        let command = this.dataset.direction
        instanceMove(command)
    }))
    var $gamepad = $("#gamepad");
    document.addEventListener("scroll", (e) => {
        console.log()
        if(this.scrollY >= 320){
            $gamepad.classList.add("hide");
        } else {
            $gamepad.classList.remove("hide");
        }
    });

    $$("#width, #height").forEach(ele => ele.addEventListener("keyup", function () {
        initCanvas();
    }))

    $("#zoom").addEventListener("input", function (e) {
        $("#input").style.zoom = this.value + "%"
    })


    $$(".templates .btn").forEach(ele => {
        ele.addEventListener("click", function () {
            window.scrollTo(0,0);
            initCanvas(this.dataset.map);

        })
    });

    let prevTimeLineEvent;
    let timeLineInterval;
    let howto
    let $timeline = $("#timeline");

    function timelinePause() {
        clearInterval(timeLineInterval);
        timeLineInterval = undefined;
        $("#timeline-play").innerText = "play_arrow"
    }


    let preloadWaitInterval;
    function startPreloadWait(){
        endPreloadWait();
        let i = 0;
        let messageList = [
            ["preload2.jpg","어... 너무 오래걸리는데요 이문제는 좀 어려운가봐요"],
            ["preload5.gif","컴퓨터가 힘들다는데 F5를 누르시는건 어떨까요?"],
            ["preload4.jpg","시발 안풀린다고 가라고"],
            ["preload3.jpg","니 컴사양으로 안된다고 ㅋㅋㅋㅋㅋㅋ"],
            ["preloader9.jpg","아 새끼 답답하네 ㅋㅋㅋㅋㅋㅋㅋㅋㅋ"],
            ["preload4.jpg","니 수준의 CPU 쓰레드로는 절대!!!!!!!"],
            ["preload5.gif","무슨일이 있어도!!!"],
            ["preload6.webp","안풀린다 게이야 ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ"],
            ["preload7.gif","<span style='font-size:1.2em'>ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ</span>"],
            ["preload8.gif","<span style='font-size:1.5em'>ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ</span>"],
        ]
        preloadWaitInterval = setInterval(function (){
            i++
            let nextMessage = messageList[((i-10) / 5) - 1];
            
            if(nextMessage === undefined) return;
            let [img, message] = nextMessage;
            
            $("#preloader-default").classList.add("hide")
            $("#preloader-additional").classList.remove("hide")
            $("#preloader-additional img").src = "assets/"+img;
            $("#preloader-additional p").innerHTML = message

        },1000)
    }
    function endPreloadWait(){
        clearInterval(preloadWaitInterval);
    }

    $("#start").addEventListener("click", async function () {
        clearInterval(timeLineInterval);
        timeLineInterval = undefined;
        $("#preloader").classList.remove("hide")
        $("#preloader-default").classList.remove("hide")
        $("#preloader-additional").classList.add("hide")
        startPreloadWait();
        howto = await solveMap(encodeCanvas(), (i) => { $("#preloader .count").innerText = i });
        endPreloadWait();
        
        $("#preloader").classList.add("hide")
        if (howto[0] === false) {
            M.toast({ html: "풀 수 없는 문제네요!" })
        }
        $timeline.classList.remove("hide")
        $timeline.max = howto.length - 1;
        $timeline.value = 0;
        $timeline.removeEventListener("input", prevTimeLineEvent)
        prevTimeLineEvent = function () {
            initCanvas(howto[this.value])
            timelinePause();
        }
        $timeline.addEventListener("input", prevTimeLineEvent);
        $("#timeline-play").click();
    })


    $("#timeline-play").addEventListener("click", () => {
        if (timeLineInterval) {
            timelinePause();
        } else {
            timeLineInterval = setInterval(function () {
                $timeline.value = $timeline.value * 1 + 1
                initCanvas(howto[$timeline.value]);
                if ($timeline.value == $timeline.max) {
                    timelinePause();
                }
            }, 300)
            $("#timeline-play").innerText = "pause"

        }

    });

    M.Range.init(document.querySelectorAll("input[type=range]"));
    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
})