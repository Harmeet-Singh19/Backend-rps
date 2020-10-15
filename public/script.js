const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const URL = "./new/";
let model, webcam, labelContainer, maxPredictions;
let show=0;
let f=0;
const myPeer = new Peer({host:'rps-trial2.herokuapp.com', secure:true, port:443})
//console.log(myPeer)
let myVideoStream;
let myId;
let myScore=0;
let oppoScore=0;
let myAns;

const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
 // console.log("vid")
  myPeer.on('call', call => {
   //// console.log("call answered")
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log("stream")
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    myId=socket.id
  //  console.log(userId)
    connectToNewUser(userId, stream)
  })
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", message => {
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom()
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
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
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const clearScore=()=>{
  myScore=0;
  oppoScore=0;
}
socket.on('otherstart',userId=>{
  //console.log("hello")
  var timeleft = 5;
var downloadTimer = setInterval(function(){
  if(timeleft <= 0){
    clearInterval(downloadTimer);
    document.getElementById("countdown").innerHTML = "Finished";

    show=1
   // console.log(f)
    if(f==0){
      init()
      f=1;
    }
  } else {
    document.getElementById("countdown").innerHTML = timeleft + " seconds remaining";
  }
  timeleft -= 1;
}, 1000);

})
socket.on('OpponentScore',ans=>{
  document.getElementById('oscore').innerHTML="Opponent had a " + ans
  myAns=myAns.toUpperCase()
  console.log(ans)
  console.log(myAns)
  if(myAns===ans){

  }
  else if(ans==="ROCK"){
    if(myAns==="PAPER"){
      myScore++;
    }
    else {
      oppoScore++;
    }
  }
  else if( ans==="PAPER"){
    if(myAns==="SCISSORS"){
      myScore++;
    }
    else {
      oppoScore++;
    }
  }
  else{
    if(myAns==="ROCK"){
      myScore++;
    }
    else {
      oppoScore++;
    }
  }
  document.getElementById("me").innerHTML="ME"+myScore
  document.getElementById("oppo").innerHTML="Oppo"+oppoScore
})

          async function setShow(){
            let sample
            console.log("hi")
            socket.emit('startcount',sample)
            

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
              const flip = false; // whether to flip the webcam
              webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
              await webcam.setup(); // request access to the webcam
              await webcam.play();
              window.requestAnimationFrame(loop);
              
              // append elements to the DOM
              
              labelContainer = document.getElementById("label-container");
              for (let i = 0; i < maxPredictions; i++) { // and class labels
                  labelContainer.appendChild(document.createElement("div"));
                  
              }
          }
  
          async function loop() {
              webcam.update(); // update the webcam frame
              await predict();
              window.requestAnimationFrame(loop);
          }
  
          // run the webcam image through the image model
          async function predict() {
              // predict can take in an image, video or canvas html element
              if(show==1){
              const prediction = await model.predict(webcam.canvas);
              let ans;
              let max=0
              for (let i = 0; i < maxPredictions; i++) {
                  const classPrediction =
                      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                  labelContainer.childNodes[i].innerHTML = classPrediction;
                  if(prediction[i].probability.toFixed(2)>max){
                    ans= prediction[i].className
                  }
                //  console.log(classPrediction);
              }
              show=0;
             // console.log("hi")
             myAns=ans
             ans=ans.toUpperCase();
             console.log(ans)
             socket.emit('Result',ans,ROOM_ID)
            }
          }