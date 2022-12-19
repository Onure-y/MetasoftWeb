socket = io();
socket.connect();
const audio = new Audio("/static/alert4.wav");

const roomsContainer = document.querySelectorAll(".query-room");
const patientsContainer = document.querySelector(".patients-container");
const mainContent = document.querySelector(".main-content");
const ldsHeart = document.querySelector(".lds-heart-container");

// Hasta çağırma ekranının aktif olup olmadığını kontrol ettiğim değer
let isProgressing = false;

// Hasta çağırma ekranında peş peşe gelen verileri sıraya sokmak için önceden oluşturulmuş
// Classtaki veriden nesne oluşturulması
window.patientsQueue = new Queue();

// Client tarafına akan oda verileri 1 den fazla olmasından dolayı ekranda bunları işleyebilmem
// icing global bir veri oluşturuyorum
window.rooms = {};

//  Client ile Server arasında bağlantı sağlandığında çalışan fonksiyon
socket.on('connect', async function() {
//  Sonsuz bir while döngüsü yaratıyorum ki bağlantı koptuğunda ekranda ki kontrolü sağlıyabileyim
    while(true) {
//      Burada yarattığım veri ekranda gözükücek ve maksimum 4 olan oda
//      containerların iteratoru ve loop sonra erdiğinde animasyonu kontrol etmek için oluşturdum
        let roomsContainerIterator = 0;
//      Socketten gelen oda verileri boşmu onu kontrol ediyorum ki boşa for loopuna girmesin
        if(Object.keys(rooms).length != 0) {
//          Oda verilerini döndürüyorum
            for(let roomData in rooms) {
                roomsContainer[roomsContainerIterator].style.backgroundColor = '#fff';
                patientsContainer.style.opacity = 1;
                for(let key in rooms[roomData]) {
                    try {
//                      Oda verilerinin içinde gelen aynı id ismine sahip verilerin içine yazıyorum
                        document.getElementById(key).innerHTML = rooms[roomData][key];
                    }catch(err) {
                    console.log(err)
                    }
                }
//              Ekranda birden çok oda olmasından dolayı belli saniyeler aralıklarıyla animasyon oynaması lazım
//              Bu nedenle aşağıdaki ms(milisaniye) değer kadar oda verilerini ekranda kalır
                await sleep(5000);
                if(Object.keys(rooms).length !==1) {
//                  Oda animasyonu aslinda teknik olarak verilerin opacity sini 0 yapip loop basa dondugunde verileri
//                  tekrar gerekli HTML lere yazdikdan sonra opacity sini 1 yapmak.
                    patientsContainer.style.opacity = 0;
                }
//              Buradaki bekleme süresi ise 2 sayfa arasındaki geçişte veriler hemen ekrana gelmesin kısa bir fade-out
//              animasyonu ile ekrana gelmesi için yaptığım bir bekleme süresi
                await sleep(1000);
                roomsContainer[roomsContainerIterator].style.backgroundColor = '#D6D6D6';
                roomsContainerIterator++;
            }
        }
        else {
//          Buradaki bekleme süresi ise eğer veri hiç gelmemişse sonsuz bir while döngüsünde clientin donmaması için beklenilen süre
            await sleep(2000);
        }

    }
})
//  Client tarafına veri geldiğinde çalışır
socket.on('json', async function(msg) {
//  Oda sayisi maksimum 4 olmasından dolayı oluşabilecek bir fazla veri girişi hatasını ortadan kaldırmak için bir sorgu
    if(Object.keys(rooms).length <= 4) {
//      Ekrana gelen verileri önceden tanımladığım oda objesine koyuyorum ki yukarıdaki loop döngüsünde çalışabilsin
//      roomContainer değişkeni ise ekrandaki odaların html dökümanlarını tutuyor. O odanın verisi gelmedikçe ekranda gözükmemesini sağlıyorum
        rooms[msg['oda']] = msg['ekran'];
        roomsContainer[Object.keys(rooms).length-1].classList.remove('room-inactive');
        roomsContainer[Object.keys(rooms).length-1].classList.add('room');
        roomsContainer[Object.keys(rooms).length-1].innerHTML = firstLetterToUpperCase(msg['oda']);
    }
    await init();
//  Eğer clienti veri varken yenilersek arka-uçta çağırılan kişinin verisini tutmadığımızdan
//  buradaki veri undefined olucaktur bu nedenle burda sorgu yapıyorum
    if(typeof msg.cagir !== "undefined") {
//      Buarada önceden oluşturduğum sıra nesnesine çağırılacak hastanın verisini ekliyorum
        patientsQueue.enqueue(msg.cagir);
    }
//  Bu fonksiyon her veri geldiğinde çalışmasından dolayı her çağırıldığında hastayı üst üste çağırmaktan kaçınmak için
//  eğer işlem devam ediyorsa sadece yukarıda sıradaki hastayı ekliyorum fonksiyon çalıştığı için sorun çıkmıyor
    if(!isProgressing) {
        console.log(patientsQueue.peek());
        sendNextPatientScreen();
    }
})

//  Client ile Server arasında ki bağlantı koptuğunda çalışan fonksiyon
socket.on("disconnect", (reason) => {
    onDisconnect();
});

//  Programın bir çok yerinde kullanmış olduğum, belli zaman aralıklarla bekletmek istediğim yapılarda kullandığım bir sleep fonksiyonu
const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve,ms));

function init() {
    ldsHeart.style.display = "none";
    mainContent.style.display = "block";
}

function onDisconnect() {
    ldsHeart.style.display = "block";
    mainContent.style.display = "none";
}

//  Ekrana devamlı olarak zamanı yazan fonksiyon
function dateandtime() {
    let today = new Date();
    let time = today.toLocaleTimeString();
    document.getElementById("time").textContent = time;
    let date = ("0" + today.getDate()).slice(-2) + '.' + ("0" + (today.getMonth() + 1)).slice(-2) + '.' + today.getFullYear();
    document.getElementById("date").textContent = date;
}

//  Odanin isim verilerini ilk harfini büyüğe çevirmeye yarayan fonksiyon
function firstLetterToUpperCase(str) {
    const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    return str2;
}

//  Siradaki hastayı çağıran fonksiyon
async function sendNextPatientScreen() {
    isProgressing = true;
//  Hastaları sıra nesnesiyle çağırdığım için aslında basitçe sıra nesnesi bitene kadar ekrana animasyonla hastaları çağırıyorum
    while(patientsQueue.length !== 0 && typeof patientsQueue.peek() !== "undefined") {
        audio.play();
        $('#myModal').modal('show')
//      Ekrandaki hastanın ismiyle çağırım yaparken kullandığım 3.parti bir yazılım
//      Text to Speech (Yazıdan ses çevirme işlemi) yaparak hastanın ismini okumasını sağlıyor
//      !**** Malesef sadece internet bağlantısı olduğunda çalışıyor ****!
//        responsiveVoice.speak(`${patientsQueue.peek()} Lütfen içeri giriniz`, "Turkish Female",{volume: 5});
        document.getElementById("cagir").innerHTML = patientsQueue.peek();
        await sleep(4000);
        $('#myModal').modal('hide');
        patientsQueue.dequeue();
        await sleep(1000);
    }
    isProgressing = false;
}
setInterval(dateandtime, 1000);
