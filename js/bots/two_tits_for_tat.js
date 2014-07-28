
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.two_tits_for_tat = function () {
        return new env.BotPlayer(
                "Two-Tits-For-Tat"
            ,   "TWO_TITS_FOR_TAT cooperates unless its partner defects in which "  +
                "case TWO_TITS_FOR_TAT retaliates with two defections."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    if (pastMoves.length === 1) return pastMoves[pastMoves.length - 1][1];
                    if (pastMoves[pastMoves.length - 1][1] === "D" ||
                        pastMoves[pastMoves.length - 2][1] === "D") return "D";
                    return "C";
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
