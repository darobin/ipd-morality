
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.tit_for_tat = function () {
        return new env.BotPlayer(
                "Tit-For-Tat"
            ,   "TIT_FOR_TAT defaults to cooperation on the first turn, and "   +
                "thereafter mirrors its partner's previous move."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    return pastMoves[pastMoves.length - 1][1];
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
