/*
    Where evolution takes place
***************************************************************************************************/

var isNode = typeof exports !== "undefined";
(function (global, env) {
    var moralityData = {
            cooperation:    { meth: "botsSortedByCoopRate", calc: "calculateCooperationStuff", field: "coopRate" }
        ,   eigenjesus:     { meth: "botsSortedByEigenJesus", calc: "calculateEigenJesus", field: "eigenJesus" }
        ,   eigenmoses:     { meth: "botsSortedByEigenMoses", calc: "calculateEigenMoses", field: "eigenMoses" }
        }
    ,   mapWithValue = function (list, field) {
            return list.map(function (item) { return [item, item[field]]; });
        }
    ,   normalise = function (list, field, min, max) {
            var delta = max - min;
            for (var i = 0, n = list.length; i < n; i++) {
                list[i][field] = (list[i][field] - min) / delta;
            }
        }
    ;
    
    function Evolution (population, morality, importance, steps, numMeetings) {
        this.population = JSON.parse(JSON.stringify(population));
        this.morality = morality;
        this.importance = importance;
        this.steps = steps;
        this.numMeetings = numMeetings;
    }
    Evolution.prototype = {
        run:    function (progress, done) {
            var generations = 0
            ,   evolve = function () {
                    env.setImmediate(function () {
                        var bots = this.makeLineup()
                        ,   arena = new env.Arena()
                        ,   arenaDone = function (results) {
                                // IMPORTANT NOTE
                                //  I completely made up the fitness and breeding algorithm below.
                                //  The odds are very good that it suffers from internal distortion.
                                //  Overall, I have no effing clue whatsoever what I'm doing, I'm 
                                //  writing this hacker-style, plugging things into one another to
                                //  find what happens.
                                //  Conclusion: do NOT use this code in order to plan a perfect
                                //  society.
                                var mc = new env.MoralityCalculator();
                                mc[moralityData[this.morality].calc](results);
                                var utilityList = mapWithValue(results.sortedBotList(), "score")
                                ,   moralityList = mapWithValue(mc[moralityData[this.morality].meth]()
                                                            ,   moralityData[this.morality].field)
                                ,   maxUtility = utilityList[0][1] * 1.053 // the highest is fitness 0.95
                                ,   minUtility = utilityList[utilityList.length - 1][1]
                                ,   maxMorality = moralityList[0][1] * 1.053 // idem
                                ,   minMorality = moralityList[moralityList.length - 1][1]
                                ,   breedingAdults = []
                                ;
                                console.log("minUtility", minUtility, "maxUtility", maxUtility, "minMorality", minMorality, "maxMorality", maxMorality);
                                minUtility -= (maxUtility - minUtility) / 9; // the lowest is fitness 0.10
                                minMorality -= (maxMorality - minMorality) / 9; // the lowest is fitness 0.10
                                utilityList.forEach(function (botInfo) {
                                    breedingAdults[botInfo[0].tournamentID] = { bot: botInfo[0], utility: botInfo[1] };
                                });
                                moralityList.forEach(function (botInfo) {
                                    breedingAdults[botInfo[0].tournamentID].morality = botInfo[1];
                                });
                                normalise(breedingAdults, "utility", minUtility, maxUtility);
                                normalise(breedingAdults, "morality", minMorality, maxMorality);
                                console.log("breedingAdults{utility, morality}", breedingAdults[0].utility, breedingAdults[0].morality);

                                // time to sex things up!
                                for (var i = 0, n = breedingAdults.length; i < n; i++) {
                                    var grownUp = breedingAdults[i];
                                    // we get a fitness between 0.5 and 1.5; that's how much the individual
                                    // contributes to its next generation's population
                                    grownUp.fitness = (grownUp.utility * (1 - this.importance)) +
                                                      (grownUp.morality * this.importance) +
                                                      0.5
                                                      ; // ooooh la la!
                                }
                                console.log("breedingAdults.fitness", breedingAdults[0].fitness);
                                
                                // it's a great band, really
                                var newPopStructure = {};
                                for (var i = 0, n = breedingAdults.length; i < n; i++) {
                                    var grownUp = breedingAdults[i]
                                    ,   popType = grownUp.bot.popType
                                    ;
                                    if (!newPopStructure[popType]) newPopStructure[popType] = 0;
                                    newPopStructure[popType] += grownUp.fitness;
                                }
                                console.log("newPopStructure", newPopStructure);
                                
                                // let's bring in Malthus
                                var oldPopNumber = 0
                                ,   newPopNumber = 0
                                ;
                                for (var k in this.population) oldPopNumber += 1 * this.population[k].number;
                                for (var k in newPopStructure) newPopNumber += 1 * newPopStructure[k];
                                // this allows for some population size drift, but I'm guessing not much
                                var normFactor = oldPopNumber / newPopNumber;
                                for (var k in newPopStructure) newPopStructure[k] = Math.round(newPopStructure[k] * normFactor);
                                console.log("normFactor", normFactor, oldPopNumber, newPopNumber, newPopStructure);
                                
                                // and watch those kids popping out
                                for (var k in newPopStructure) {
                                    // SURPRISE! YOU'RE DEAD!
                                    if (newPopStructure[k] === 0) delete this.population[k];
                                    else this.population[k].number = newPopStructure[k];
                                }
                                progress("pop", newPopStructure);
                                generations++;
                                if (generations >= this.steps) return done();
                                progress("msg", "Generation: " + generations);
                                evolve();
                            }.bind(this)
                        ;
                        arena.runTournament(bots, this.numMeetings, arenaDone, function (msg) { progress("msg", msg); });
                    }.bind(this));
                }.bind(this)
            ;
            evolve();
        }
    ,   makeLineup: function () {
            var bots = []
            ,   lineup = []
            ;
            for (var k in this.population) {
                var def = this.population[k]
                ,   bot = { type: def.type, popType: k };
                if (def.params) bot.params = def.params;
                for (var i = 0, n = def.number; i < n; i++) lineup.push(bot);
            }
            lineup.forEach(function (b) {
                var botFunc = window.bots[b.type]
                ,   botArgs = []
                ;
                if (!b.params) b.params = {};
                for (var k in botFunc.configuration) {
                    botArgs.push(b.params[k] != null ? b.params[k] : botFunc.configuration[k].default);
                }
                var newBot = botFunc.apply(window.bots, botArgs);
                newBot.popType = b.popType;
                bots.push(newBot);
            });
            return bots;
        }
    };
    
    global.Evolution = Evolution;
}(isNode ? exports : window, isNode ? require("./index") : window));
