
var isNode = typeof exports !== "undefined";
(function (global, env) {
    env.bots.all_c = function () {
        return new env.BotPlayer(   "All C"
                                ,   "ALL_C cooperates unconditionally."
                                ,   function () {
                                        return "C";
                                    }
                                )
        ;
    };
}(isNode ? exports : window, isNode ? require("./index.js") : window));
