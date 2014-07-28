
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.joss = function (sneaky) {
        if (sneaky == null) sneaky = 0.1;
        return new env.BotPlayer(
                "Joss (" + sneaky + ")"
            ,   "JOSS defaults to cooperation on the first turn, and "              +
                "thereafter mirrors its partner's previous move, except after its " +
                "partner cooperates JOSS defects with some probability to see what "+
                "it can get away with every once in a while."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    var theirLastMove = pastMoves[pastMoves.length - 1][1];
                    if (theirLastMove === "C" && Math.random() < sneaky) return "D";
                    return theirLastMove;
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
