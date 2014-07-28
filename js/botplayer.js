/*
    BotPlayer represents a bot in an IPD tournament
    Ported from https://github.com/tscizzle/IPD_Morality/
***************************************************************************************************/

/*
    All bots are BotPlayers. They create an instance of BotPlayer to represent themselves.
    The code here is different from the original Python. Instead of inheriting, bots just use this
    to define themselves. They pass a callback that defines the behaviour instead of overriding.
    
    getNextMove
    ARGS:
    pastMoves: array of tuples, where each tuple is the pair
        of choices made that turn by this bot and its partner
        [(myMove1, hisMove1), (myMove2, hisMove2), ...] and
        the moves are represented by 'C' for "Cooperate" or 'D'
        for "Defect". For example, [('C', 'D'), ('D', 'D'), ...]

    RETURNS:
    nextMove: 'C' for "Cooperate" or 'D' for "Defect"
*/

var isNode = typeof exports !== "undefined";
(function (global, env) {
    function BotPlayer (name, desc, nextMoveCB) {
        this.name = name;
        this.desc = desc || name;
        this.tournamentID = null;
        this.getNextMove = nextMoveCB.bind(this);
    }
    BotPlayer.prototype = {
        toString:   function () {
            return this.name;
        }
    };
    global.BotPlayer = BotPlayer;
    env.bots = {};
}(isNode ? exports : window, isNode ? require("./index") : window));
