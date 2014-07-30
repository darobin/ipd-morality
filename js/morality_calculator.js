/*
    Make various morality related calculations on the results of an IPD tournament.
    Ported from https://github.com/tscizzle/IPD_Morality/
***************************************************************************************************/

var isNode = typeof exports !== "undefined";
(function (global) {
    var clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    /*  Wraps up morality functions and calculations
        Calculate the cooperation matrix of the given tournament results

        ARGS:
        - tourney_res: TournamentResults object holding the results of the
        tournament to be morally analyzed
    */
    function MoralityCalculator (tournamRes) {
        this.tournamentResults = tournamRes;
        this.cooperationMatrix = null;
        this.biggerManScores = null;
        this.cooperationRates = null;
        this.calculateCooperationStuff();
        this.eigenJesusScores = null;
        this.eigenMosesScores = null;
        this.calculateNetworkMorality();
    }
    MoralityCalculator.prototype = {
        /*  Calculate the cooperation rate for each bot in each bot pair and store
            these in an instance variable

            STORES:
            - cooperation_matrix: numpy array, cooperation_matrix[i][j] is i's
            cooperation rate when partnered with j
            - bigger_man_scores: a bot's bigger_man_score is the fraction of
            partnerships in which that bot cooperated at least as much as its
            partner
            - cooperation_rates: the fraction of each bot's total moves that are
            cooperations
        */
        calculateCooperationStuff:  function () {
            var tr = this.tournamentResults
            ,   botList = tr.botList
            ,   botIDList = botList.map(function (bot) { return bot.tournamentID; })
            ,   coopMatrix = botList.map(function () {
                                return botList.map(function () { return 0; });
                            })
            ,   bigManScores = {}
            ,   coopRates = {}
            ;
            botIDList.forEach(function (bID) { bigManScores[bID] = 0; });
            botList.forEach(function (_, i) {
                var bot1ID = botList[i].tournamentID;
                botList.slice(i).forEach(function (_, j) {
                    j += i;
                    var bot2ID = botList[j].tournamentID
                    ,   interactions = tr.interactions[bot1ID + "-" + bot2ID]
                    ,   totalTurns = 0
                    ,   bot1Coops = 0
                    ,   bot2Coops = 0
                    ;
                    interactions.forEach(function (meetings) {
                        meetings.forEach(function (turn) {
                            totalTurns++;
                            if (turn[0] === "C") bot1Coops++;
                            if (turn[1] === "C") bot2Coops++;
                        });
                    });
                    var bot1Rate = bot1Coops / totalTurns
                    ,   bot2Rate = bot2Coops / totalTurns;
                    coopMatrix[bot1ID][bot2ID] = bot1Rate;
                    coopMatrix[bot2ID][bot1ID] = bot2Rate;
                    if (bot1ID !== bot2ID) {
                        if (bot1Rate >= bot2Rate) bigManScores[bot1ID]++;
                        if (bot2Rate >= bot1Rate) bigManScores[bot2ID]++;
                    }
                });
            });
            botList.forEach(function (_, i) {
                var botID = botList[i].tournamentID
                ,   botCoopRates = coopMatrix[botID]
                ;
                coopRates[botID] = botCoopRates.reduce(function (prev, cur) { return prev + cur; }, 0) / botCoopRates.length;
                bigManScores[botID] = bigManScores[botID] / (botList.length - 1);
            });
            this.cooperationMatrix = coopMatrix; // this is normally np.array
            this.biggerManScores = bigManScores;
            this.cooperationRates = coopRates;
        }
        /*  Starts with every node at a constant amount of 'worth' and iterates
            using C to update every node's 'worth' until converging on the principle
            eigenvector

            ARGS:
            - C: C is a numpy array in [0, 1]^(nxn) where values represent the
            'votes' between nodes like in PageRank

            RETURNS:
            - pev: pev is the principle eigenvector of C, representing the end
            values of each node. normalize to add to n
        */
    ,   principalEigenvector:   function (C, iters) {
            var numVals = C[0].length
            ,   currentVals = C[0].map(function () { return 1; })
            ,   pos = 0
            ;
            while (pos < iters) {
                // dot
                var resVals = [];
                for (var i = 0, n = C.length; i < n; i++) {
                    var line = C[i]
                    ,   lineRes = []
                    ;
                    for (var j = 0, m = line.length; j < m; j++) {
                        lineRes.push(line[j] * currentVals[j]);
                    }
                    resVals.push(lineRes.reduce(function (prev, cur) { return prev + cur; }, 0));
                }
                currentVals = resVals;
                pos++;
            }
            var totalVal = currentVals.reduce(function (prev, cur) { return prev + cur; }, 0)
            ,   pev = clone(currentVals)
            ;
            for (var i = 0, n = currentVals.length; i < n; i++) {
                pev[i] = (numVals/totalVal) * currentVals[i];
                // rare degenerate case
                if (isNaN(pev[i])) pev[i] = 1;
            }
            return pev;
        }
        /*  Calculate and store the morality metrics of network jesus and network
            moses for each bot

            ARGS:
            - coop_matrix: numpy array, coop_matrix[i][j] is i's cooperation rate
            when partnered with j

            STORES:
            - eigenjesus_scores: list of recursively defined morality scores
            (cooperating with cooperaters is worth more), cooperating always helps
            - eigenmoses_scores: list of recursively defined morality scores
            (cooperating with cooperaters is worth more), cooperating with a
            defector actually counts against you
        */
    ,   calculateNetworkMorality:   function () {
            this.eigenJesusScores = this.principalEigenvector(this.cooperationMatrix, 100);
            var coopDefectMatrix = clone(this.cooperationMatrix)
                                        .map(function (line) {
                                            return line.map(function (cell) {
                                                return (cell - 0.5) * 2;
                                            });
                                        });
            this.eigenMosesScores = this.principalEigenvector(coopDefectMatrix, 100);
        }
        // Various simple getters
    ,   coopRateByID:       function (id) { return this.cooperationRates[id]; }
    ,   goodPartnerByID:    function (id) { return this.biggerManScores[id]; }
    ,   eigenJesusByID:     function (id) { return this.eigenJesusScores[id]; }
    ,   eigenMosesByID:     function (id) { return this.eigenMosesScores[id]; }
    ,   sortedBotList:  function (sortCB, key) {
            return this.tournamentResults.botList
                        .slice()
                        .map(function (bot) {
                            bot[key] = sortCB(bot.tournamentID);
                            return [bot, bot[key]];
                        }.bind(this))
                        .sort(function (a, b) {
                            if (a[1] > b[1]) return -1;
                            if (a[1] < b[1]) return 1;
                            return 0;
                        })
                        .map(function (entry) { return entry[0]; })
            ;
        }
    ,   botsSortedByCoopRate:   function () {
            return this.sortedBotList(function (id) { return this.coopRateByID(id); }.bind(this), "coopRate");
        }
    ,   botsSortedByGoodPartner:   function () {
            return this.sortedBotList(function (id) { return this.goodPartnerByID(id); }.bind(this), "goodPartner");
        }
    ,   botsSortedByEigenJesus:   function () {
            return this.sortedBotList(function (id) { return this.eigenJesusByID(id); }.bind(this), "eigenJesus");
        }
    ,   botsSortedByEigenMoses:   function () {
            return this.sortedBotList(function (id) { return this.eigenMosesByID(id); }.bind(this), "eigenMoses");
        }
    };
    global.MoralityCalculator = MoralityCalculator;
}(isNode ? exports : window, isNode ? require("./index") : window));
