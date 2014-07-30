/*
    Where evolution takes place
***************************************************************************************************/

var isNode = typeof exports !== "undefined";
(function (global, env) {
    function Evolution (population, morality, importance, steps, numMeetings) {
        this.population = population;
        this.morality = morality;
        this.steps = steps;
        this.numMeetings = numMeetings;
    }
    Evolution.prototype = {
        run:    function (progress, done) {
            
        }
    };
    
    global.Evolution = Evolution;
}(isNode ? exports : window, isNode ? require("./index") : window));
