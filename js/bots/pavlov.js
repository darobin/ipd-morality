
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.pavlov = function () {
        return new env.BotPlayer(
                "Pavlov"
            ,   "PAVLOV defaults to cooperation on the first turn, and "                +
                "thereafter cooperates if and only if both players made the same "      +
                "choice last turn. This is known as 'win-stay, lose-shift', because "   +
                "PAVLOV repeats its own last move after it receives T or R (the good "  +
                "scores) and changes its move after it receives P or S (the bad "       +
                "scores), like a reflex demonstrated in Pavlov's dog experiment."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    if (pastMoves[pastMoves.length - 1][0] === pastMoves[pastMoves.length - 1][1])
                        return "C";
                    return "D";
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
