const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const outputGrid = document.getElementById('output-grid')
// const copyBtn = document.getElementById('copy-button')
// const friendUrl = document.getElementById('friend-url')
const URL = "../new/";
let model, webcam, labelContainer, maxPredictions;
let show = 0;
let f = 0;
const myPeer = new Peer({ host: 'rps-trial2.herokuapp.com', secure: true, port: 443 })
//console.log(myPeer)
let myVideoStream;
let myId;
let myScore = 0;
let oppoScore = 0;
let myAns;
var count = 0;
let p1=document.getElementById('rock').cloneNode(true);
p1.id="rock2"
let p2=document.getElementById('paper').cloneNode(true);
p2.id="paper2"
let p3=document.getElementById('scissor').cloneNode(true);
p3.id="scissor2"

const myVideo = document.createElement('video')
const myMessage = document.createElement('div')
const myMessage2 = document.createElement('div')
const alonePLayerSupport = document.createElement('div');
alonePLayerSupport.innerHTML = `<h2>Copy the below link and send it to your friend to invite them to the game</h2>
<input type="text" id="friendUrl"></input>
<button id='copy-button' onclick='copyText()'>Copy</button>
`
let x=document.createElement('h2')
x.innerText="Output:"
let y=document.createElement('h2')
y.innerText="Output:"
myMessage.append(x)
myMessage.id="me"
myMessage2.append(y)

myVideo.muted = true;
const peers = {}


const callList = [];

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {

  addCopy(alonePLayerSupport)
  // console.log("vid")
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      if(!callList[call.peer]){
        //console.log(userVideoStream)
        addVideoStream(video, userVideoStream)
        addOutput(myMessage)
        addOutput(myMessage2)
        callList[call.peer] = call;
        }
    })
  })

  socket.on('user-connected', userId => {
    myId = socket.id
    //   console.log(peers)
    //console.log(peers.length)
    connectToNewUser(userId, stream)
    addOutput(myMessage)
    addOutput(myMessage2)
  })
  // input value
  let text = $("#chat_message");
  // when press enter send message
  $('html').keydown(function (e) {
    //console.log(text.val())
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val(),socket.id);
      text.val('')
    }
  });
  socket.on("createMessage", (message,userId) => {
    console.log(message)
    if(userId===socket.id){
    $("ul").append(`<li class="message"><b>Me:</b>${message}</li><br>`);
    }
    else{
      $("ul").append(`<li class="message"><b>Opponent:</b>${message}</li><br>`);
    }
    scrollToBottom()
  })
})
socket.on('full', userId => {
  alert('This room is full!')
  socket.emit('disconnect')
  window.location.replace('/')
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
  console.log(peers)
  videoGrid.removeChild(videoGrid.childNodes[2])
  myMessage.remove()
  myMessage2.remove();
  
  count=0;
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  //console.log("u")
  call.on('stream', userVideoStream => {
    if(!callList[call.peer]){
    //console.log(userVideoStream)
    addVideoStream(video, userVideoStream)
    callList[call.peer] = call;
    }
  })
  call.on('close', () => {
    video.remove()
    count=0
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  count++;

  if (count === 2) {
    document.getElementsByClassName('main')[0].style.fontFamily = "'Press Start 2P', cursive"
    alonePLayerSupport.remove();
  }

  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  let newvcard=document.createElement('div')
  newvcard.classList.add("video-card");
  newvcard.append(video)
  
  if(newvcard.childNodes[0].nodeName!=='video'){
  
  videoGrid.append(newvcard)
  
 // console.log(video)
  }
}

function addOutput(message) {
  
  outputGrid.append(message)

}
function addCopy(ele){
  document.getElementById('copy').append(ele)
  document.getElementById('friendUrl').value=document.URL
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-mic-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
  <path fill-rule="evenodd" d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
</svg>
    
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-mic-mute-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M12.734 9.613A4.995 4.995 0 0 0 13 8V7a.5.5 0 0 0-1 0v1c0 .274-.027.54-.08.799l.814.814zm-2.522 1.72A4 4 0 0 1 4 8V7a.5.5 0 0 0-1 0v1a5 5 0 0 0 4.5 4.975V15h-3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-3v-2.025a4.973 4.973 0 0 0 2.43-.923l-.718-.719zM11 7.88V3a3 3 0 0 0-5.842-.963L11 7.879zM5 6.12l4.486 4.486A3 3 0 0 1 5 8V6.121zm8.646 7.234l-12-12 .708-.708 12 12-.708.707z"/>
</svg>
    
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-camera-video-fill" fill="currentColor"
                     xmlns="http://www.w3.org/2000/svg">
                     <path fill-rule="evenodd"
                        d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z" />
                  </svg>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-camera-video-off-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925l-10-14 .814-.58 10 14-.814.58z"/>
</svg>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
const leaveMeeting = () => {
  window.location.replace('/');
  socket.emit('disconnect')
}

const clearScore = () => {
  myScore = 0;
  oppoScore = 0;
  document.getElementById("me").innerHTML = "ME" + myScore
  document.getElementById("oppo").innerHTML = "Oppo" + oppoScore
}
const copyText=()=>{
  const el = document.createElement('textarea');
  el.value = document.getElementById('friendUrl').value;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  console.log("copied")
}
socket.on('otherstart', userId => {
  console.log("hello")
  var timeleft = 5;
  document.getElementsByClassName("main")[0].blur()
  document.getElementById("countdown").style.zIndex=1
  document.getElementById("countdown").style.opacity=0.7
  var audio = new Audio("/gamepage/img/camera-shutter-click-01.mp3");
  
  var downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(downloadTimer);
      document.getElementById("countdown").style.opacity = 0;
      document.getElementById("countdown").style.zIndex=-1
      document.getElementById("countdown").innerHTML = 5 ;
      show = 1
      // console.log(f)
      if (f == 0) {
        init()
        f = 1;
      }
    }else if(timeleft===1){
      document.getElementById("countdown").style.fontSize="5rem"
      audio.play();
      document.getElementById("countdown").innerHTML = "Capturing..." ;

    }
     else  {
      document.getElementById("countdown").innerHTML = timeleft ;
    }
    timeleft -= 1;
  }, 1000);

})
socket.on('OpponentScore', ans => {
  
  //console.log(myAns)
  myAns = myAns.toUpperCase()
  //console.log(ans)
  //console.log(myAns)
  //console.log(document.getElementById('me').append(p1)) 
 
  if (myAns === ans) {
    myScore++;
    oppoScore++;
  }
  else if (ans === "ROCK") {
    if (myAns === "PAPER") {
      myScore++;
    }
    else {
      oppoScore++;
    }
  }
  else if (ans === "PAPER") {
    if (myAns === "SCISSORS") {
      myScore++;
    }
    else {
      oppoScore++;
    }
  }
  else {
    if (myAns === "ROCK") {
      myScore++;
    }
    else {
      oppoScore++;
    }
  }
  document.getElementById("score_player1").innerHTML =  myScore
  document.getElementById("score_player2").innerHTML =  oppoScore
})

async function setShow() {
  if(count===2){
  let sample
  console.log("hi")
  socket.emit('startcount', sample)
  }
  else{
    alert('Only one person is the lobby !')
  }

  /* show=1;
   if(f==1){
     init();
     f=0;
   }*/
}
// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // console.log("init")
  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  // await setShow()
  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM



}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  if (show == 1) {
    const prediction = await model.predict(webcam.canvas);
    let ans;
    let max = 0
    for (let i = 0; i < maxPredictions; i++) {
      const classPrediction =
        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    console.log(prediction[i])
      if (prediction[i].probability.toFixed(2) > max) {
        ans = prediction[i].className
      }
      //  console.log(classPrediction);
    }
    show = 0;
    // console.log("hi")
    myAns = ans
    ans = ans.toUpperCase();
    console.log(ans);
    socket.emit('Result', ans, ROOM_ID)
  }
}

