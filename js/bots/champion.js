
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.champion = function () {
        return new env.BotPlayer(
                "Champion"
            ,   "CHAMPION cooperates for about 1/20 of the expected length of "         +
                "interaction, mirrors its partner's previous move for about 3/40 of "   +
                "the expected length of interaction, and then cooperates unless all "   +
                "three of the following conditions are true: its partner defected "     +
                "last turn, its partner cooperated less than 60% of the time, and "     +
                "a randomly generated number between 0 and 1 is less than its "         +
                "partner's defection rate."
            ,   function (pastMoves, payoffs, w) {
                    var numTurns = pastMoves.length
                    ,   expectedLength = 1/1 - w
                    ;
                    if (numTurns <= expectedLength/20) return "C";
                    if (expectedLength/20 < numTurns && numTurns < ((5/40) * expectedLength))
                        return pastMoves[pastMoves.length - 1][1];
                    if (numTurns >= (5/40) * expectedLength) {
                        var theirLastMove = pastMoves[pastMoves.length - 1][1];
                        var theirDefectionRate = pastMoves.theirDefections / numTurns
                        ,   r = Math.random()
                        ;
                        return (theirLastMove === "D" && theirDefectionRate > Math.max(0.4, r)) ? "D" : "C";
                    }
                    throw new Error("Should not have reached this point");
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
