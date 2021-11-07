
import './lib/webaudio-controls.js';

var ctx = window.AudioContext || window.webkitAudioContext;
var audioCtx, pannerNode, source, analyser;
var filters = [];
var width, height;
var dataArray, bufferLength, canvas, canvasContext;

function visualize2() {
    canvasContext.save();
    canvasContext.fillStyle = "rgba(0, 0, 0, 0.05)";
    canvasContext.fillRect (0, 0, width, height);

    analyser.getByteFrequencyData(dataArray);
    var nbFreq = dataArray.length;
    
    var SPACER_WIDTH = 5;
    var BAR_WIDTH = 2;
    var OFFSET = 100;
    var CUTOFF = 23;
    var HALF_HEIGHT = height/2;
    var numBars = 1.7*Math.round(width / SPACER_WIDTH);
    var magnitude;
  
    canvasContext.lineCap = 'round';

    for (var i = 0; i < numBars; ++i) {
       magnitude = 0.3*dataArray[Math.round((i * nbFreq) / numBars)];
        
       canvasContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
       canvasContext.fillRect(i * SPACER_WIDTH, HALF_HEIGHT, BAR_WIDTH, -magnitude);
       canvasContext.fillRect(i * SPACER_WIDTH, HALF_HEIGHT, BAR_WIDTH, magnitude);

    }
    
    // Draw animated white lines top
    canvasContext.strokeStyle = "white";
    canvasContext.beginPath();

    for (i = 0; i < numBars; ++i) {
        magnitude = 0.3*dataArray[Math.round((i * nbFreq) / numBars)];
          if(i > 0) {
            //console.log("line lineTo "  + i*SPACER_WIDTH + ", " + -magnitude);
            canvasContext.lineTo(i*SPACER_WIDTH, HALF_HEIGHT-magnitude);
        } else {
            //console.log("line moveto "  + i*SPACER_WIDTH + ", " + -magnitude);
            canvasContext.moveTo(i*SPACER_WIDTH, HALF_HEIGHT-magnitude);
        }
    }
    for (i = 0; i < numBars; ++i) {
        magnitude = 0.3*dataArray[Math.round((i * nbFreq) / numBars)];
          if(i > 0) {
            //console.log("line lineTo "  + i*SPACER_WIDTH + ", " + -magnitude);
            canvasContext.lineTo(i*SPACER_WIDTH, HALF_HEIGHT+magnitude);
        } else {
            //console.log("line moveto "  + i*SPACER_WIDTH + ", " + -magnitude);
            canvasContext.moveTo(i*SPACER_WIDTH, HALF_HEIGHT+magnitude);
        }
    }    
    canvasContext.stroke();
    
    canvasContext.restore();
  
  requestAnimationFrame(visualize2);
}
function buildAudioGraph(){
    source = audioCtx.createMediaElementSource(document.querySelector("#player").getVideoPlayer());

     // Create an analyser node
  analyser = audioCtx.createAnalyser();
  
  // Try changing for lower values: 512, 256, 128, 64...
  analyser.fftSize = 512;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  
  // create the equalizer. It's a set of biquad Filters


    // Set filters
    [60, 170, 350, 1000, 3500, 10000].forEach(function(freq, i) {
      var eq = audioCtx.createBiquadFilter();
      eq.frequency.value = freq;
      eq.type = "peaking";
      eq.gain.value = 0;
      filters.push(eq);
    });

   // Connect filters in serie
   source.connect(filters[0]);
   for(var i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i+1]);
    }
    //   analyser.connect(audioCtx.destination);
    
    pannerNode = new StereoPannerNode(audioCtx, { pan : 0});
    
    filters[filters.length - 1].connect(pannerNode);

    pannerNode.connect(analyser);

    analyser.connect(audioCtx.destination);
    // source.connect(pannerNode).connect(audioCtx.destination);

    // pannerNode.connect(audioCtx.destination);
}
window.onload = function() {
    audioCtx = new ctx();
    canvas = document.querySelector("#player").getCanvas();
  width = canvas.width;
  height = canvas.height;
  canvasContext = canvas.getContext('2d');
    buildAudioGraph();
    requestAnimationFrame(visualize2);
    
};


const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

let style = `
.block{
  padding-top: 5;
  padding-bottom: 5;
}

video{
    height: 500;
}
.a{
    display:ineline-block;
    width: 50wd;
    float: left;
    flex-direction: column;
    padding: 5;
}
.b{
    display: grid;
    padding: 5;
}
.grid-container{
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3,1fr);
  }
  
  .grid-item{
    border: 2px solid black;
    padding: 30px;
    display: grid;
    place-items: center;
  }
`;
let template = /*html*/`
<div class="a">
  <video id="videoPlayer">
      <br>
  </video>
  <div class="button-item"> <button id="playPause">PLAY</button> </div>
  <div class="button-item"><button id="info">GET INFO</button></div>
  <div class="button-item"><button id="avance10">+10s</button></div>
  <div class="button-item"><button id="recule10">-10s</button></div>
</div>
<div class="a">
<div class="b">
<canvas id="myCanvas" width=300 height=100></canvas>
<div class="controls">
    <label>60Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="sliderGain0"></input>
  <output id="outputgain0">0 dB</output>
  </div>
  <div class="controls">
    <label>170Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="sliderGain1"></input>
<output id="outputgain1">0 dB</output>
  </div>
  <div class="controls">
    <label>350Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="sliderGain2"></input>
<output id="outputgain2">0 dB</output>
  </div>
  <div class="controls">
    <label>1000Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="sliderGain3"></input>
<output id="outputgain3">0 dB</output>
  </div>
  <div class="controls">
    <label>3500Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="sliderGain4"></input>
<output id="outputgain4">0 dB</output>
  </div>
  <div class="controls">
    <label>10000Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="sliderGain5"></input>
<output id="outputgain5">0 dB</output>
  </div>
  </div>
  <div class="block"><h3> Vitesse </h3><input type="range" min="0.25" max="5" value="1" step="0.25" id="speedSlider" /><label for="speedSlider">Multiplicateur : </label><output id="speedOutput">1</output></div>
  <div class="block">
  <h3>Balance</h3>
  <label for="pannerSlider">Gauche : </label><output id="balanceG">50</output> %
  <input type="range" min="-1" max="1" step="0.1" value="0" id="pannerSlider" />

  
  
  <label for="pannerSlider">Droite : </label><output id="balanceD">50</output> %
  </div>

<div class="block">
<h3> Volume </h3>
<webaudio-knob id="volume" min=0 max=1 value=0.5 step="0.01" 
         tooltip="%s" diameter="100" src="./assets/Vintage_Knob.png" sprites="100"></webaudio-knob>
         <output id="outputVolume">50</output>%
</div>
</div>
</div>
   `;

//    <webaudio-slider id="pannerSlider" min=-1 max=1 value=0 step="0.1" 
//          tooltip="%s"  src="./assets/Gold1_WRGslider.png" sprites="100">
{/* <input type="range" min="-1" max="1" step="0.1" value="0" id="pannerSlider" /> */}
class MyVideoPlayer extends HTMLElement {
    constructor() {
        super();
        console.log("BaseURL = " + getBaseURL());

        this.attachShadow({ mode: "open" });
    }
    fixRelativeURLs() {
        // pour les knobs
        let knobs = this.shadowRoot.querySelectorAll('webaudio-knob, webaudio-switch, webaudio-slider');
        knobs.forEach((e) => {
            let path = e.getAttribute('src');
            e.src = getBaseURL() + '/' + path;
        });
    }
    changeGain(sliderVal,nbFilter) {
        var value = parseFloat(sliderVal);
        filters[nbFilter].gain.value = value;
        
        // update output labels
        var output = this.shadowRoot.querySelector("#outputgain"+nbFilter);
        output.value = value + " dB";
    }
    getVideoPlayer(){
        return this.shadowRoot.querySelector("#videoPlayer");
    }
    getCanvas(){
        return this.shadowRoot.querySelector("#myCanvas");
    }
    connectedCallback() {
        // Appelée avant affichage du composant
        //this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.shadowRoot.innerHTML = `<style>${style}</style>${template}`;
        
        this.fixRelativeURLs();
        
        

        this.player = this.shadowRoot.querySelector("#videoPlayer");
        // récupération de l'attribut HTML
        this.player.src = this.getAttribute("src");
        
        // pannerSlider = document.querySelector('#pannerSlider');
        // déclarer les écouteurs sur les boutons
        this.definitEcouteurs();

       
    }
    
    definitEcouteurs() {
        console.log("ecouteurs définis")
        this.shadowRoot.querySelector("#playPause").onclick = () => {
            if(this.paused()){
                this.play();
                this.shadowRoot.querySelector("#playPause").innerHTML = "STOP";
            }
            else{
                this.pause();
                this.shadowRoot.querySelector("#playPause").innerHTML = "PLAY";
            }
        }

        this.shadowRoot.querySelector("#volume").oninput = (event) => {
            this.changeVolume(event);
        }

        this.shadowRoot.querySelector("#pannerSlider").oninput = (event) => {
            this.changeBalance(event);
        }

        this.shadowRoot.querySelector("#avance10").onclick = (event) => {
            this.avance10s();
        }
        this.shadowRoot.querySelector("#recule10").onclick = (event) => {
            this.recule10s();
        }
        this.shadowRoot.querySelector("#speedSlider").oninput = (event) => {
            this.changeSpeed(event);
        }
        
        this.shadowRoot.querySelector("#videoPlayer").onplay = (event) => {
           audioCtx.resume();
        }
        this.shadowRoot.querySelector("#sliderGain0").oninput = (event) => {
            this.changeGain(event.target.value, 0);
        }
        this.shadowRoot.querySelector("#sliderGain1").oninput = (event) => {
            this.changeGain(event.target.value, 1);
        }
        this.shadowRoot.querySelector("#sliderGain2").oninput = (event) => {
            this.changeGain(event.target.value, 2);
        }
        this.shadowRoot.querySelector("#sliderGain3").oninput = (event) => {
            this.changeGain(event.target.value, 3);
        }
        this.shadowRoot.querySelector("#sliderGain4").oninput = (event) => {
            this.changeGain(event.target.value, 4);
        }
        this.shadowRoot.querySelector("#sliderGain5").oninput = (event) => {
            this.changeGain(event.target.value, 5);
        }
        

        // this.shadowRoot.querySelector("#sliderGain0").oninput = (event) => {
        //     this.changeGain(event.target.value, 0);
        // }
    }    
    // API de mon composant
    play() {
        this.player.play();
    }
    changeBalance(event){
        const panValue = event.target.value;
        const outputGauche = this.shadowRoot.querySelector("#balanceG");
        const outputDroite = this.shadowRoot.querySelector("#balanceD");
        pannerNode.pan.value = panValue;
        console.log(event.target.value)
        if(panValue < 0){
            outputGauche.value = 50 + (panValue * 50);
            outputDroite.value = 50 - (panValue * 50);
        }else if(panValue > 0){
            outputGauche.value = 50 - (panValue * 50);
            outputDroite.value = 50 + (panValue * 50);
        }else{
            outputGauche.value = 50;
            outputDroite.value = 50;
        }
    }
    paused(){
        return this.player.paused;
    }
    
    pause() {
        this.player.pause();
    }
    changeVolume(event){
        const vol = parseFloat(event.target.value);
            this.player.volume = vol;
        const outputVolume = this.shadowRoot.querySelector("#outputVolume");
        outputVolume.value = vol * 100;
    }
    changeMasterGain(sliderVal) {
        var value = parseFloat(sliderVal);
        masterGain.gain.value =  value/10;
        
         // update output labels
        var output = document.querySelector("#masterGainOutput");
        output.value = value;
    }

    avance10s() {
        this.player.currentTime += 10;
    }
    
    recule10s() {
        this.player.currentTime -= 10;
    }
    
    changeSpeed(event){
        const slider = event.target;
        const speedValue = slider.value;
        this.player.playbackRate = speedValue;
        const outputSpeed = this.shadowRoot.querySelector("#speedOutput");
        outputSpeed.value = speedValue;
    }
}

customElements.define("my-player", MyVideoPlayer);
