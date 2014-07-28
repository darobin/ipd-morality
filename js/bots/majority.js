
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.majority = function (soft) {
        if (soft == null) soft = true;
        return new env.BotPlayer(
                "Majority (" + (soft ? "soft" : "hard") + ")"
            ,   "MAJORITY cooperates as long as its partner has cooperated more "       +
                "than it has defected (if partner has cooperated and defected equal "   +
                "amounts, MAJORITY cooperates if it is soft and defects if it is "      +
                "hard)."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    var theirDefections = 0;
                    pastMoves.forEach(function (turn) { if (turn[1] === "D") theirDefections++; });
                    var defectionRatio = theirDefections / pastMoves.length;
                    if (defectionRatio < 0.5) return "C";
                    if (defectionRatio > 0.5) return "D";
                    return soft ? "C" : "D";
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
