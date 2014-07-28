
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.all_d = function () {
        return new env.BotPlayer(   "All D"
                                ,   "ALL_D defects unconditionally."
                                ,   function () { //pastMoves, payoffs, w
                                        return "D";
                                    }
                                )
        ;
    };
}(isNode ? exports : window, isNode ? require("./index.js") : window));
