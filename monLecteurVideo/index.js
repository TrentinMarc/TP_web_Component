
import './lib/webaudio-controls.js';

var ctx = window.AudioContext || window.webkitAudioContext;
var audioCtx, pannerNode, source;

window.onload = function() {
    audioCtx = new ctx();

    source = audioCtx.createMediaElementSource(document.querySelector("#player").getVideoPlayer());
    
    pannerNode = new StereoPannerNode(audioCtx, { pan : 0});

    source.connect(pannerNode).connect(audioCtx.destination);

    pannerNode.connect(audioCtx.destination);
};


const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

let style = `
.block{
  padding-top: 5;
  padding-bottom: 5;
}
`;
let template = /*html*/`
  <video id="videoPlayer">
      <br>
  </video>
  <br>
  <div class="block"> <button id="playPause">PLAY</button> </div>
  <div class="block"><button id="info">GET INFO</button></div>
  <div class="block"><button id="avance10">+10s</button></div>
  <div class="block"><label for="speedSlider"> Vitesse </label><input type="range" min="0.25" max="5" value="1" step="0.25" id="speedSlider" /><output id="speedOutput"> x 1</output></div>
  <div class="block"><label for="pannerSlider">Balance</label>
        <input type="range" min="-1" max="1" step="0.1" value="0" id="pannerSlider" /></div>

<div class="block"><webaudio-knob id="volume" min=0 max=1 value=0.5 step="0.01" 
         tooltip="%s" diameter="100" src="./assets/Aqua.png" sprites="100"></webaudio-knob></div>
   `;

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
    getVideoPlayer(){
        return this.shadowRoot.querySelector("#videoPlayer");
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
            pannerNode.pan.value = event.target.value;
        }

        this.shadowRoot.querySelector("#avance10").onclick = (event) => {
            this.avance10s();
        }
        this.shadowRoot.querySelector("#speedSlider").oninput = (event) => {
            this.changeSpeed(event);
        }
        
        this.shadowRoot.querySelector("#videoPlayer").onplay = (event) => {
           audioCtx.resume();
        }
    }    
    // API de mon composant
    play() {
        this.player.play();
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
    
    changeSpeed(event){
        const slider = event.target;
        const speedValue = slider.value;
        this.player.playbackRate = speedValue;
        const outputSpeed = this.shadowRoot.querySelector("#speedOutput");
        outputSpeed.value = "x " + speedValue;
    }
}

customElements.define("my-player", MyVideoPlayer);
