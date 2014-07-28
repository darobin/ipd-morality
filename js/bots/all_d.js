
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.all_d = function () {
        return new env.BotPlayer(   "All D"
                                ,   "ALL_D defects unconditionally."
                                ,   function () {
                                        return "D";
                                    }
                                )
        ;
    };
}(isNode ? exports : window, isNode ? require("../index") : window));
