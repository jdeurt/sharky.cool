function bpmToBps(bpm) {
    return bpm / 60;
}

function bpmToGifSpeed(bpm) {
    //0.25 speed = 1 bps
    let bps = bpm / 60;
    return bps * 0.25;
}