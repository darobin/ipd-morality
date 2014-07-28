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
                    var bot2ID = botList[j].tournamentID
                    ,   interactions = tr.interactions[bot1ID + "-" + bot2ID]
                    ,   totalTurns = interactions.reduce(function (prev, cur) { return prev.length + cur.length; }, 0)
                    ,   bot1Coops = 0
                    ,   bot2Coops = 0
                    ;
                    interactions.forEach(function (meetings) {
                        meetings.forEach(function (turn) {
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
                bigManScores[botID] = bigManScores[botID] / botList.length - 1;
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
    };
    global.MoralityCalculator = MoralityCalculator;
}(isNode ? exports : window, isNode ? require("./index") : window));

/*
    #####
    # Getter methods
    #####

    def get_coop_rate_by_id(self, bot_id):
        return self.cooperation_rates[bot_id]

    def get_good_partner_by_id(self, bot_id):
        return self.bigger_man_scores[bot_id]

    def get_eigenjesus_by_id(self, bot_id):
        return self.eigenjesus_scores[bot_id]

    def get_eigenmoses_by_id(self, bot_id):
        return self.eigenmoses_scores[bot_id]

    def get_bots_sorted_by_coop_rate(self):
        bot_list = self.tourney_res.botList
        def get_coop_rate(bot):
            return self.get_coop_rate_by_id(bot.tournament_id)
        return sorted(bot_list, key=get_coop_rate, reverse=True)

    def get_bots_sorted_by_good_partner(self):
        bot_list = self.tourney_res.botList
        def get_good_partner(bot):
            return self.get_good_partner_by_id(bot.tournament_id)
        return sorted(bot_list, key=get_good_partner, reverse=True)

    def get_bots_sorted_by_eigenjesus(self):
        bot_list = self.tourney_res.botList
        def get_eigenjesus(bot):
            return self.get_eigenjesus_by_id(bot.tournament_id)
        return sorted(bot_list, key=get_eigenjesus, reverse=True)

    def get_bots_sorted_by_eigenmoses(self):
        bot_list = self.tourney_res.botList
        def get_eigenmoses(bot):
            return self.get_eigenmoses_by_id(bot.tournament_id)
        return sorted(bot_list, key=get_eigenmoses, reverse=True)
*/

/*
    Haven't ported the stringifier so far since the intent is to use HTML reporting
    def __str__(self):
        # get the bots in order of their score
        sorted_bots = self.tourney_res.get_sorted_bot_list()

        headers = [
            "Tournament ID",
            "Bot Name",
            "Cooperation Rate",
            "Not Worse Partner",
            "Recursive Jesus",
            "Recursive Moses"
        ]
        num_cols = len(headers)

        # find a good column width to use for formatting the output
        long_header = max([len(h) for h in headers])
        long_name = max(
            [len(bot.name) for bot in self.tourney_res.get_bot_list()]
        )+1
        col = max([long_header, long_name])
        col_str = str(col)
        format_str = (("{: <"+col_str+"} ")*num_cols)[:-1]
        hr = "-"*(num_cols*col)

        # construct output string
        headers_str = format_str.format(*headers)
        output = "\n"+hr+"\n"+headers_str+"\n"+hr+"\n"
        for bot in sorted_bots:
            t_id = bot.tournament_id
            name = self.tourney_res.get_name_by_id(t_id)
            coop_rate = self.cooperation_rates[t_id]
            big_man_score = self.bigger_man_scores[t_id]
            eigenjesus = self.eigenjesus_scores[t_id]
            eigenmoses = self.eigenmoses_scores[t_id]
            row = format_str.format(str(t_id), name,\
             str(coop_rate), str(big_man_score),
             str(eigenjesus), eigenmoses)
            output += row+"\n"
        return output
*/
