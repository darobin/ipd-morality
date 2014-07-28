
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.tit_for_two_tats = function () {
        return new env.BotPlayer(
                "Tit-For-Two-Tats"
            ,   "TIT_FOR_TWO_TATS defects if and only if its partner has "  +
                "defected for the past two turns."
            ,   function (pastMoves) {
                    if (pastMoves.length < 2) return "C";
                    if (pastMoves[pastMoves.length - 1][1] === "D" && 
                        pastMoves[pastMoves.length - 2][1] === "D") return "D";
                    return "C";
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
