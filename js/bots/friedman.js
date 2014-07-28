
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.friedman = function () {
        return new env.BotPlayer(
                "Friedman"
            ,   "FRIEDMAN is the permanent retaliator. It cooperates until its "        +
                "partner defects, after which FRIEDMAN defects for the rest of the "    +
                "interaction."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    var hasDefected = pastMoves.some(function (turn) { return turn[1] === "D"; });
                    return hasDefected ? "D" : "C";
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
