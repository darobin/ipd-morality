
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.majority = function (soft) {
        if (soft == null) soft = true;
        if (typeof soft === "string") soft = soft === "true";
        return new env.BotPlayer(
                "Majority (" + (soft ? "soft" : "hard") + ")"
            ,   "MAJORITY cooperates as long as its partner has cooperated more "       +
                "than it has defected (if partner has cooperated and defected equal "   +
                "amounts, MAJORITY cooperates if it is soft and defects if it is "      +
                "hard)."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    var defectionRatio = pastMoves.theirDefections / pastMoves.length;
                    if (defectionRatio < 0.5) return "C";
                    if (defectionRatio > 0.5) return "D";
                    return soft ? "C" : "D";
                }
            )
        ;
    };
    env.bots.majority.configuration = {
        soft:   { type: Boolean, default: true }
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
