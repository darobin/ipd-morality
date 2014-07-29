
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.tester = function () {
        return new env.BotPlayer(
                "Tester"
            ,   "TESTER initially defects to test what the other player will do. "      +
                "If the other player defects ever, TESTER apologizes by cooperating "   +
                "and then mirrors the partner's moves thereafter. If the other "        +
                "player does not retaliate, TESTER cooperates twice but then defects "  +
                "on and off every other turn."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "D";
                    var partnerMoves = [];
                    for (var i = 0, n = pastMoves.length; i < n; i++) partnerMoves.push(pastMoves[i][1]);
                    if (!pastMoves.theirDefections) {
                        if (pastMoves.length < 3) return "C";
                        return pastMoves[pastMoves.length - 1][0] === "C" ? "D" : "C";
                    }
                    else {
                        if (pastMoves.theirDefections < 2) return "C";
                        else return partnerMoves[partnerMoves.length - 1];
                    }
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
