
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.generous_tit_for_tat = function (generous) {
        if (generous == null) generous = 0.1;
        return new env.BotPlayer(
                "Generous Tit-For-Tat (" + generous + ")"
            ,   "GENEROUS_TIT_FOR_TAT defaults to cooperation on the first turn, "  +
                "and thereafter mirrors its partner's previous move, except after " +
                "its partner defects GENEROUS_TIT_FOR_TAT cooperates with some "    +
                "probability to forgive occasional mistakes and avoid unnecessary " +
                "mutual punishment."
            ,   function (pastMoves) {
                    if (!pastMoves.length) return "C";
                    var theirLastMove = pastMoves[pastMoves.length - 1][1];
                    if (theirLastMove === "D" && Math.random() < generous) return "C";
                    return theirLastMove;
                }
            )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
