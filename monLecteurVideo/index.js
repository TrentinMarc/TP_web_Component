
import './lib/webaudio-controls.js';

var audioCtx = window.AudioContext || window.webkitAudioContext;
var audioContext, canvasContext;

window.onload = function() {
    audioContext= new audioCtx();
    console.log(audioContext)
    // canvas = document.querySelector("#myCanvas");
    // width = canvas.width;
    // height = canvas.height;
    // canvasContext = canvas.getContext('2d');
    
    // buildAudioGraph();
    
    // requestAnimationFrame(visualize2);
};

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

let style = `
// ici des règles CSS
`;
let template = /*html*/`
  <video id="player" >
      <br>
  </video>
  <br>
  <button id="playPause">PLAY</button>
  <button id="info">GET INFO</button>
  <button id="avance10">+10s</button>
  <button id="vitesse4" >Vitesse 4x</button>
  
  <webaudio-knob id="volume" min=0 max=1 value=0.5 step="0.01" 
         tooltip="%s" diameter="100" src="./assets/Aqua.png" sprites="100"></webaudio-knob>
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
    connectedCallback() {
        // Appelée avant affichage du composant
        //this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.shadowRoot.innerHTML = `<style>${style}</style>${template}`;
        
        this.fixRelativeURLs();

        this.player = this.shadowRoot.querySelector("#player");
        // récupération de l'attribut HTML
        this.player.src = this.getAttribute("src");

        // déclarer les écouteurs sur les boutons
        this.definitEcouteurs();
    }

    definitEcouteurs() {
        console.log("ecouteurs définis")
        this.shadowRoot.querySelector("#playPause").onclick = () => {
            if(this.paused()){
                this.play();
                this.shadowRoot.querySelector("#playPause").innerHTML = "PAUSE";
            }
            else{
                this.pause();
                this.shadowRoot.querySelector("#playPause").innerHTML = "PLAY";
            }
        }

        this.shadowRoot.querySelector("#volume").oninput = (event) => {
            const vol = parseFloat(event.target.value);
            this.player.volume = vol;
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

    changeMasterGain(sliderVal) {
        var value = parseFloat(sliderVal);
        masterGain.gain.value =  value/10;
        
         // update output labels
        var output = document.querySelector("#masterGainOutput");
        output.value = value;
    }
}

customElements.define("my-player", MyVideoPlayer);
