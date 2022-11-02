socket = io();
socket.connect();
const audio = new Audio("/static/alert4.wav");
let dataStartValue = 0;
var flowControl = true;

socket.on('connect', async function() {
    document.getElementById("reconnecting").classList.add("d-none");
    flowControl = true;

    while(flowControl) {
        var data = window.data;
        if(typeof data !== "undefined"){
            try{
                for(let i=0; i<data.ekran.length;i++) {
                    for(let key in data.ekran[i]) {
                        try{
                        document.getElementById(key).innerHTML = data.ekran[i][key];
                        } catch (err) {}
                    }
                    await waitForAnimation(5000,800);
                }
            } catch(e) {
                console.log(e);
            }
        }
        else {
            await sleep(1000);
        }
    }
    document.getElementById("page-content").classList.add("page-content-opacity-0");
});


socket.on('json', async function(msg) {
    window.data = msg;

    if ( typeof msg.cagir !== "undefined")
    {
          audio.play();
               $('#myModal').modal('show')
               document.getElementById("cagir").innerHTML = msg.cagir;
               setTimeout(function()
               {
                    $('#myModal').modal('hide')
               }, 5000);
    }

        var allPatients = 0;
        for(let i=0; i<msg.ekran.length;i++) {
            for(let key in msg.ekran[i]) {
                if(key.includes("_2")) {
                allPatients++;
                }
            }
        }
        document.getElementById("all-patients").innerHTML = allPatients;

});

         const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve,ms));

         async function waitForAnimation(estimatedTime,animationTime) {
            await sleep(estimatedTime);
            document.getElementById("page-content").classList.add("page-content-opacity-0");
            document.getElementById("page-content").classList.remove("page-content-opacity-1");
            await sleep(animationTime);
            document.getElementById("page-content").classList.remove("page-content-opacity-0");
            document.getElementById("page-content").classList.add("page-content-opacity-1");
         }



socket.on("disconnect", (reason) => {
    document.getElementById("reconnecting").classList.remove("d-none");
    flowControl = false;
});


const myModalEl = document.getElementById("myModal")
myModalEl.addEventListener("shown.bs.modal", function () {
});


function dateandtime() {
    let today = new Date();
    let time = today.toLocaleTimeString();
    document.getElementById("clock").textContent = time;
    let date = ("0" + today.getDate()).slice(-2) + '.' + ("0" + (today.getMonth() + 1)).slice(-2) + '.' + today.getFullYear();
    document.getElementById("date").textContent = date;

}
setInterval(dateandtime, 1000);



