
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.random = function (cooperate) {
        if (cooperate == null) cooperate = 0.5;
        return new env.BotPlayer(
                "Random (" + cooperate + ")"
            ,   "RANDOM chooses randomly between cooperation and defection with "   +
                "some specified probability for each, independent of its partner's "+
                "moves."
            ,   function () {
                    return Math.random() < cooperate ? "C" : "D";
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
