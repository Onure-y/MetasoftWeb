socket = io();
socket.connect();
const audio = new Audio("/static/alert4.wav");

const rooms = document.querySelectorAll(".room");
const patientsContainer = document.querySelector(".patients-container");
const mainContent = document.querySelector(".main-content");
const ldsHeart = document.querySelector(".lds-heart-container");

// Sira nesnesini burada yaratiyorum
let patientsQueue = new Queue();

//responsiveVoice.speak("Onur Emre YILDIRIM", "Turkish Female");

socket.on('connect', async function() {
    while(true) {
        var data = window.data;
        if(typeof data !== "undefined") {
            for(let i=0; i< rooms.length;i++) {
                    rooms[i].style.backgroundColor = '#fff';
                    patientsContainer.style.opacity = 1;
                    for(let key in data.ekran[i]) {
                        try {
                            document.getElementById(key).innerHTML = data.ekran[i][key];
                        }catch(err){
                            console.log(err)
                        }

                    }
                    await sleep(5000);
                    rooms[i].style.backgroundColor = '#D6D6D6';
                    patientsContainer.style.opacity = 0;
                    await sleep(1000);
            }
        }
        else {
            await sleep(1000)
        }
    }

})

socket.on('json', async function(msg) {
    window.data = msg;
    await init();
    sendNextPatientScreen(msg);
})

socket.on("disconnect", (reason) => {
    onDisconnect();
});


const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve,ms));

function init() {
    ldsHeart.style.display = "none";
    mainContent.style.display = "block";
}

function onDisconnect() {
    ldsHeart.style.display = "block";
    mainContent.style.display = "none";
}

function dateandtime() {
    let today = new Date();
    let time = today.toLocaleTimeString();
    document.getElementById("time").textContent = time;
    let date = ("0" + today.getDate()).slice(-2) + '.' + ("0" + (today.getMonth() + 1)).slice(-2) + '.' + today.getFullYear();
    document.getElementById("date").textContent = date;
}

function sendNextPatientScreen(msg) {
    patientsQueue.enqueue(msg.cagir);
    for(let i=0; i<patientsQueue.length;i++) {
         if ( typeof patientsQueue.peek() !== "undefined")
            {
                audio.play();
                $('#myModal').modal('show')
                responsiveVoice.speak(`${patientsQueue.peek()} Lütfen içeri giriniz`, "Turkish Female",{volume: 5});
                document.getElementById("cagir").innerHTML = patientsQueue.dequeue();
                setTimeout(function()
                    {
                        $('#myModal').modal('hide')
                    }, 5000);
            }
    }

}

// Sira Yapisini bir class olarak tanimliyorum ki ileride cagirilan hastalarin verilerine
// Kolayikla erisebileyim
setInterval(dateandtime, 1000);
