/*
    Wrapper to hold results of a tournament
    Ported from https://github.com/tscizzle/IPD_Morality/
***************************************************************************************************/

var isNode = typeof exports !== "undefined";
(function (global) {
    /*  Calculate the scores of the interactions and the total scores for the
        bots using the specified payoffs.

        ARGS:
        - botList: a list of BotPlayer objects where the index of botX in the
        list is the tournament id used in the argument interactions. basically,
        botList maps tournament id to bot
        - interactions: a dictionary with
            keys => (tournament_id1, tournament_id2)
            values => [meeting1, meeting2, ...]
        where meetingX is a list of tuples (bot1_move, bot2_move).
        For example:
        interactions = {
            (0, 1): [
                [('C', 'D'), ('D', 'D')],
                [('C', 'C'), ('C', 'D'), ('D', 'D')]
            ],
            ...
        }
        - payoffs: defines the scores for each Prisoner's Dilemma situation,
        which TournamentResults needs to correctly score each interaction
    */
    function TournamentResults (botList, interactions, payoffs) {
        this.botList = botList;
        this.interactions = interactions;
        this.payoffs = payoffs;
        this.numBots = botList.length;
        this.botInfoByID = {};
        botList.forEach(function (bot) {
            this.botInfoByID[bot.tournamentID] = {
                name:   bot.name
            ,   desc:   bot.desc
            ,   total:  0
            };
        }.bind(this));
        this.interactionLengths = [];
        var somePair = Object.keys(this.interactions)[0];
        this.interactions[somePair].forEach(function (interaction) {
            this.interactionLengths.push(interaction.length);
        }.bind(this));
        this.totalInteractions = this.numBots *
                                 this.interactionLengths.reduce(function (prev, cur) {
                                    return prev + cur;
                                 }, 0);
        this.interactionScores = {};
        this.calculateScores();
    }
    TournamentResults.prototype = {
        /*  Get the scores for each bot for a single turn

            ARGS:
            - actions: tuple (bot1_move, bot2_move)

            RETURNS:
            - scores: the score for each bot (bot1_score, bot2_score)
        */
        scoreTurn:  function (actions) {
            if (actions[0] === "C") {
                if (actions[1] === "C")         return [this.payoffs.R, this.payoffs.R];
                else if (actions[1] === "D")    return [this.payoffs.S, this.payoffs.T];
                else throw new Error("Invalid move: " + actions[1]);
            }
            else if (actions[0] === "D") {
                if (actions[1] === "C")         return [this.payoffs.T, this.payoffs.S];
                else if (actions[1] === "D")    return [this.payoffs.P, this.payoffs.P];
                else throw new Error("Invalid move: " + actions[1]);
            }
            else throw new Error("Invalid move: " + actions[0]);
        }
        /*  Get the scores for each bot pair meetings list and store in
            self.interaction_scores. Tally up the total score for each bot and store
            in self.bot_info_by_id['total']
        */
    ,   calculateScores:    function () {
            for (var botPair in this.interactions) {
                this.interactionScores[botPair] = [];
                for (var i = 0, n = this.interactions[botPair].length; i < n; i++) {
                    var meeting = this.interactions[botPair][i]
                    ,   meetingScores = [0, 0];
                    for (var j = 0, m = meeting.length; j < m; j++) {
                        var turnScores = this.scoreTurn(meeting[j]);
                        meetingScores[0] += turnScores[0];
                        meetingScores[1] += turnScores[1];
                    }
                    this.interactionScores[botPair].push(meetingScores);
                    var botPairSplit = botPair.split("-");
                    if (botPairSplit[0] === botPairSplit[1]) 
                        this.botInfoByID[botPairSplit[0]].total += meetingScores[0];
                    else {
                        this.botInfoByID[botPairSplit[0]].total += meetingScores[0];
                        this.botInfoByID[botPairSplit[1]].total += meetingScores[1];
                    }
                }
            }
        }
        /*  All sorts of convenience methods
        */
    ,   nameByID:   function (tID) { return this.botInfoByID[tID].name; }
    ,   descByID:   function (tID) { return this.botInfoByID[tID].desc; }
    ,   scoreByID:  function (tID) { return this.botInfoByID[tID].total; }
    ,   avgScoreByID:   function (tID) { return this.scoreByID(tID) / this.totalInteractions; }
    ,   winningID:  function () {
            return this.sortedBotList()[0].tournamentID;
        }
    ,   winningName:    function () { return this.nameByID(this.winningID()); }
    ,   interactionScore:   function (id1, id2, meeting) {
            return this.interactionScores[id1 + "-" + id2][meeting];
        }
    ,   interaction:    function (id1, id2, meeting) {
            return this.interactions[id1 + "-" + id2][meeting];
        }
    ,   sortedBotList:  function () {
            return this.botList
                        .slice()
                        .map(function (bot) {
                            bot.score = this.scoreByID(bot.tournamentID);
                            return [bot, bot.score];
                        }.bind(this))
                        .sort(function (a, b) {
                            if (a[1] > b[1]) return -1;
                            if (a[1] < b[1]) return 1;
                            return 0;
                        })
                        .map(function (entry) { return entry[0]; })
            ;
        }
    };
    
    
    global.TournamentResults = TournamentResults;
}(isNode ? exports : window, isNode ? require("./index") : window));
