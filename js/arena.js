/*
    The arena which runs tournaments of bots
    Ported from https://github.com/tscizzle/IPD_Morality/
***************************************************************************************************/

var isNode = typeof exports !== "undefined";
(function (global, env) {
    function Arena () {}
    Arena.prototype = {
        /*  Based on a probability of continuing each step, generate
            interaction lengths for the bot pairs

            ARGS:
            - w: probability of interaction continuing at each step
            - numMeetings: number of interaction_lengths needed to be
            generated

            RETURNS:
            - interaction_lengths: a list of integers representing how
            long each meeting between bots will be (if the list is n
            long, it is because each bot pair meets n times)
        */
        generateInteractionLengths: function (w, numMeetings) {
            var interactionLengths = []
            ,   i = 0
            ;
            while (i < numMeetings) {
                var meetingLength = 1;
                while (true) {
                    if (Math.random() > w) break;
                    meetingLength++;
                }
                interactionLengths.push(meetingLength);
                i++;
            }
            return interactionLengths;
        }
        /*  Two bots paired together interacting

            ARGS:
            - bot1, bot2: instances of BotPlayer (presumably subclasses
            of BotPlayer), representing the two participating bots
            - interaction_length: how many turns bot1 and bot2 play in
            this interaction

            RETURNS:
            - past_moves: list of every move that occurred during the
            interaction
        */
    ,   botInteraction:  function (bot1, bot2, interactionLength, payoffs, w) {
            // Temptation (tricks the other), Reward (mutual cooperation)
            // Punishment (mutual defection), Sucker (got tricked)
            if (!payoffs) payoffs = { T: 5, R: 3, P: 1, S: 0 };
            if (typeof w === "undefined") w = 0.995;
            var pastMoves1 = []
            ,   pastMoves2 = []
            ,   i = 0
            ;
            while (i < interactionLength) {
                var bot1Move = bot1.getNextMove(pastMoves1, payoffs, w)
                ,   bot2Move = bot2.getNextMove(pastMoves2, payoffs, w)
                ;
                pastMoves1.push([bot1Move, bot2Move]);
                pastMoves2.push([bot2Move, bot1Move]);
                i++;
            }
            return pastMoves1;
        }
        /*  Make sure the inputs to runTournament make sense and if they do not,
            say why in the list 'errors'

            ARGS:
            - botList: list of bots to participate in the tournament
            - w: probability of interaction continuing at each step
            - numMeetings: number of times each bot is paired with each
            other bot
            - payoffs: defines the scores for each Prisoner's Dilemma situation

            RETURNS:
            - errors: list or error messages to let the user know what is wrong
            with the inputs, if anything
            
        */
    ,   validateTournamentInputs:   function (botList, numMeetings, payoffs, w) {
            var errors = [];
            botList.forEach(function (bot) {
                if (!bot instanceof env.BotPlayer)
                    errors.push("botList must be a list of BotPlayer objects");
            });
            if (numMeetings < 1) errors.push("numMeetings must be at least 1");
            if (!(payoffs.T > payoffs.R && payoffs.R > payoffs.P && payoffs.P > payoffs.S))
                errors.push("payoffs must obey T > R > P > S");
            if (2 * payoffs.R <= (payoffs.T + payoffs.S))
                errors.push("payoffs must obey 2 * R > T + S");
            if (w < 0 || w > 1) errors.append("w must be a number between 0 and 1");
            return errors;
        }
        /*  Main method, partners each bot with each other bot with
            w probability of ending each turn (length of interactions
            is determined (using w) before any pairings, so all
            pairings use the same list of interaction lengths)

            ARGS:
            - botList: list of bots to participate in the tournament
            - numMeetings: number of times each bot is paired with each
            other bot
            - progress: a callback that takes a string to update the UI with progress
            - payoffs: defines the scores for each Prisoner's Dilemma situation
            - w: probability of interaction continuing at each step

            RETURNS:
            - tourney_res: TournamentResults object with all the info
            
        */
    ,   runTournament:  function (botList, numMeetings, progress, payoffs, w) {
            if (!payoffs) payoffs = { T: 5, R: 3, P: 1, S: 0 };
            if (typeof w === "undefined") w = 0.995;
            var errors = this.validateTournamentInputs(botList, numMeetings, payoffs, w);
            if (errors.length) return env.error(errors);
            var interactions = {}
            ,   interactionLengths = this.generateInteractionLengths(w, numMeetings)
            ;
            for (var i = 0, n = botList.length; i < n; i++) botList[i].tournamentID = i;
            var numBots = botList.length;
            for (var i = 0, n = numBots; i < n; i++) {
                for (var j = 0, o = numBots; j < o; j++) {
                    var bot1 = botList[i]
                    ,   bot2 = botList[j]
                    ,   meetingResultsList = []
                    ;
                    for (var m = 0, p = numMeetings; m < p; m++) {
                        meetingResultsList
                            .push(this.botInteraction(bot1, bot2, interactionLengths[m], payoffs, w));
                        progress(bot1.name + " vs " + bot2.name + ": meeting " + (m+1) + "/" +
                                 numMeetings + " with " + interactionLengths[m] + " interactions done.");
                    }
                    interactions[bot1.tournamentID + "-" + bot2.tournamentID] = meetingResultsList;
                }
            }
            return new env.TournamentResults(botList, interactions, payoffs);
        }
    };
    
    
    global.Arena = Arena;
}(isNode ? exports : window, isNode ? require("./index") : window));
