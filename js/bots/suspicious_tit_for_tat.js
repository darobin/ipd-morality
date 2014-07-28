
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.suspicious_tit_for_tat = function () {
        return new env.BotPlayer(
                "Suspicious Tit-For-Tat"
            ,   "SUSPICIOUS_TIT_FOR_TAT defaults to defection on the first turn, " +
                "and thereafter mirrors its partner's previous move."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "D";
                    return pastMoves[pastMoves.length - 1][1];
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
