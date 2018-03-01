const tr = require("./text-responses.js");

module.exports = {
    whatIsTheWeather
}

// To export

function whatIsTheWeather(today, currenthour) {
    const nextts = getNextTimeStep(currenthour);

    const ws = today.timesteps[nextts].wind_speed;
    const gs = today.timesteps[nextts].wind_gust;
    const t = today.timesteps[nextts].temperature;
    const v = today.timesteps[nextts].visibility;

    var txt = tr.Weather.Intro;
    if(resolveVisibility(tr.Weather.Visibility).length > 0) {
        txt += tr.Weather.Visibility + resolveVisibility(tr.Weather.Visibility) + ", ";
        txt += addPause(1);
    }
    txt += tr.Weather.Temperature + t.value + " " + tr.Weather.Units.Temp + ", " + addPause(1);
    txt += tr.Weather.WindSpeed + t.value + " " + tr.Weather.Units.Speed + ", " + addPause(1);
    txt += "and " + tr.Weather.GustSpeed + t.value + " " + tr.Weather.Units.Speed;

    return txt;
}

// Private

function getNextTimeStep(h) {
    if(h < 9) return 0;
    if(h < 12) return 1;
    if(h < 15) return 2;
    if(h < 18) return 3;

    //default is the end of day, last timestep
    return 4;
}

function resolveVisibility(v) { 
    var txt = "";
    switch (v) {
        case "VP":
            txt = "very poor";
            break;
        case "PO":
            txt = "poor";
            break;
        case "MO":
            txt = "moderate";
            break;
        case "GO":
            txt = "good";
            break;
        case "VG":
            txt = "very good";
            break;    
        case "EX":
            txt = "excellent";
            break;
    
        default:
            break;

    return txt;
    }
}

function addPause(num) {
    return "<break time='" + num + "s'/>"
}