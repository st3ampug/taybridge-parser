const tr = require("./text-responses.js");
var logger = require("./mylogger.js");

module.exports = {
    whatIsTheWeather,
    predictBridgeStatus
}

// To export

function whatIsTheWeather(today, currenthour) {
    logger.LOG(today);
    logger.LOG(currenthour);
    const nextts = getNextTimeStep(currenthour);
    const ws = today.timesteps[nextts].wind_speed;
    const gs = today.timesteps[nextts].wind_gust;
    const t = today.timesteps[nextts].temperature;
    const v = today.timesteps[nextts].visibility;

    var txt = tr.Weather.Intro;
    if(resolveVisibility(v).length > 0) {
        txt += tr.Weather.Visibility + resolveVisibility(v) + ", ";
        txt += addPause(1);
    }
    txt += tr.Weather.Temperature + t.value + " " + tr.Weather.Units.Temp + ", " + addPause(1);
    txt += tr.Weather.WindSpeed + ws.value + " " + tr.Weather.Units.Speed + ", " + addPause(1);
    txt += "and " + tr.Weather.GustSpeed + gs.value + " " + tr.Weather.Units.Speed;

    logger.LOG("Returning weather text:");
    logger.LOG(txt);

    return txt;
}

function predictBridgeStatus(today, currenthour) {
    const nextts = getNextTimeStep(currenthour);
    const gs = today.timesteps[nextts].wind_gust;
    const v = today.timesteps[nextts].visibility;
    logger.LOG(gs);

    var txt = tr.Weather.Prediction.Default + tr.Weather.Visibility + resolveVisibility(v);
    logger.LOG(txt);

    if(gs.value >= 80) {
        logger.LOG("over 75");
        txt = tr.Weather.Prediction.Over80 + addPause(1) + addInVisibilityInfo(v);
    }
    if(gs.value >= 60) {
        logger.LOG("over 55");
        txt = tr.Weather.Prediction.Over60 + addPause(1) + addInVisibilityInfo(v);
    }
    if(gs.value >= 40) {
        logger.LOG("over 45");
        txt = tr.Weather.Prediction.Over45 + addPause(1) + addInVisibilityInfo(v);
    }

    logger.LOG(txt);
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
    logger.LOG("Resolving visibility for: " + v.value);

    var txt = "";
    switch (v.value) {
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
    }

    return txt;
}

function addPause(num) {
    return "<break time='" + num + "s'/>"
}

function addInVisibilityInfo(v) {
    if(v.value == "MO" || v.value == "PO" || v.value == "VP")
        return tr.Weather.Prediction.VisibilityAddition + resolveVisibility(v);
}