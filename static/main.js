socket = io();
socket.connect();
const audio = new Audio("/static/alert4.wav");

const roomsContainer = document.querySelectorAll(".query-room");
const patientsContainer = document.querySelector(".patients-container");
const mainContent = document.querySelector(".main-content");
const ldsHeart = document.querySelector(".lds-heart-container");

let isProgressing = false;

window.patientsQueue = new Queue();
//window.rooms = new Rooms();

window.rooms = {};

// Sira nesnesini burada yaratiyorum

//responsiveVoice.speak("Onur Emre YILDIRIM", "Turkish Female");

socket.on('connect', async function() {

    while(true) {
        let roomsContainerIterator = 0;
        if(Object.keys(rooms).length != 0) {
            for(let roomData in rooms) {
                roomsContainer[roomsContainerIterator].innerHTML = firstLetterToUpperCase(roomData);
                roomsContainer[roomsContainerIterator].style.backgroundColor = '#fff';
                patientsContainer.style.opacity = 1;
                for(let key in rooms[roomData]) {
                    try {
                        document.getElementById(key).innerHTML = rooms[roomData][key];
                    }catch(err) {
                    console.log(err)
                    }
                }
                await sleep(5000);
                if(Object.keys(rooms).length !==1) {
                    patientsContainer.style.opacity = 0;
                }
                await sleep(1000);
                roomsContainer[roomsContainerIterator].style.backgroundColor = '#D6D6D6';
                roomsContainerIterator++;
            }
        }
        else {
            await sleep(2000);
        }

    }

//    while(true) {
//        var data = window.data;
//        if(rooms.length !== 0) {
//            for(let roomData in rooms.getRooms()) {
////                    roomsContainer[i].style.backgroundColor = '#fff';
////                    patientsContainer.style.opacity = 1;
//                    for(let key in roomData) {
//                        try {
//                            document.getElementById(key).innerHTML = roomData['ekran']['key'];
//                        }catch(err){
//                            console.log(err)
//                        }
//                    }
//                    await sleep(5000);
////                    if(length.length !== 1) {
////                        patientsContainer.style.opacity = 0;
////                    }
////                    rooms[i].style.backgroundColor = '#D6D6D6';
//                    await sleep(1000);
//            }
//        }
//        else {
//            await sleep(5000)
//        }
//    }

})

socket.on('json', async function(msg) {
    rooms[msg['oda']] = msg['ekran'];
    roomsContainer[Object.keys(rooms).length-1].classList.remove('room-inactive');
    roomsContainer[Object.keys(rooms).length-1].classList.add('room');
    roomsContainer[Object.keys(rooms).length-1].innerHTML = msg['oda'];
    await init();
    if(typeof msg.cagir !== "undefined") {
        patientsQueue.enqueue(msg.cagir);
    }
    console.log(patientsQueue);
    if(!isProgressing) {
        console.log(patientsQueue.peek());
        sendNextPatientScreen();
    }
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

function firstLetterToUpperCase(str) {
    const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    return str2;
}

async function sendNextPatientScreen() {
    console.log('started');
    isProgressing = true;
    console.log(patientsQueue.peek());
    while(patientsQueue.length !== 0 && typeof patientsQueue.peek() !== "undefined") {
        audio.play();
        $('#myModal').modal('show')
        //responsiveVoice.speak(`${patientsQueue.peek()} Lütfen içeri giriniz`, "Turkish Female",{volume: 5});
        document.getElementById("cagir").innerHTML = patientsQueue.peek();
        await sleep(4000);
        $('#myModal').modal('hide');
        patientsQueue.dequeue();
        await sleep(1000);
    }
    isProgressing = false;
}
setInterval(dateandtime, 1000);
