
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.eatherly = function () {
        return new env.BotPlayer(
                "Eatherly"
            ,   "EATHERLY defaults to cooperation, but keeps track of how many "    +
                "times the other player has defected, so after a defection by the " +
                "other player, EATHERLY can defect with probability equal to the "  +
                "ratio of its partner's defections to the total number of moves so far."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    if (pastMoves[pastMoves.length - 1][1]) return "C";
                    var theirDefections = 0;
                    pastMoves.forEach(function (turn) { if (turn[1] === "D") theirDefections++; });
                    var defectionRatio = theirDefections/pastMoves.length;
                    return (Math.random() < defectionRatio) ? "D" : "C";
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("./index.js") : window));
