class Synth {

    commandMap      = { 128: "UP", 144: "DOWN" };
    oscillatorMap   = {};

    _midi           = null;
    audioContext    = null;
    gainNode        = null;

    constructor() {
        navigator
            .requestMIDIAccess()
            .then(
                ( access ) => this.onAccess(access),
                ( message ) => alert(`Failed to get MIDI access - ${message}`)
            );
    }

    onAccess(access) {
        this._midi = access;
        this.assignNotesEvents();
    }

    assignNotesEvents() {
        const context = this;

        context._midi.inputs.forEach(input => {
            input.onmidimessage = (message) => context.onMIDIMessage(message);
        });
    }

    onMIDIMessage(message) {
        const [ rawCommand, key, velocity ] = message.data;
        const command = this.commandMap[rawCommand];

        const keyFreq = Math.pow(2, ( key - 69) / 12) * 440;
        const oscillator = this.getOscillator(keyFreq);
        
        if(command === "DOWN")  oscillator.gain.value = 0.33;
        else                    oscillator.gain.value = 0;


        console.log(`[${message.timeStamp}] - ${command} ${key} ${velocity}`)
    }

    getOscillator(frequency) {
        if(!this.audioContext)
            this.audioContext = new AudioContext();

        if(!this.oscillatorMap[frequency]){
            const oscillator    = this.audioContext.createOscillator();
            const gainNode      = this.audioContext.createGain();
            gainNode.gain.value = 0;
            
            // oscillator.type = "sine";
            // oscillator.type = "square";
            // oscillator.type = "sawtooth";
            oscillator.type = "triangle";
            oscillator.frequency.setTargetAtTime(frequency, this.audioContext.currentTime, 0);
            oscillator.connect(gainNode);
            oscillator.start();
            
            gainNode.connect(this.audioContext.destination);

            this.oscillatorMap[frequency] = gainNode;
        }

        return this.oscillatorMap[frequency];
    }
}

document.getElementById("button").onclick = () => { new Synth() }