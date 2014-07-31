/* global error, Arena, MoralityCalculator, Evolution, randomColor */

/*
    XXX
    - workerify?
    - a fair bit of rearchitecting and refactoring would really not hurt
*/


// error messages
window.error = function (msg) {
    var $content;
    if (Array.isArray(msg)) {
        $content = $("<ul></ul>");
        msg.forEach(function (m) {
            $("<li></li>").text(m).appendTo($content);
        });
    }
    else {
        $content = $(document.createTextNode(msg));
    }
    $("#msg-error")
        .find("span.message").empty().append($content).end()
        .show()
    ;
};
function makeBotOptionsShower ($list, $prms) {
    return function () {
        $prms.empty();
        var botDef = window.bots[$list.val()].configuration;
        for (var k in botDef) {
            if (botDef[k].type === Number) {
                var $lbl = $("<label></label>")
                                .text(" " + k + ": ")
                                .appendTo($prms)
                ;
                $("<input type='number' min='0' max='0.999' step='0.05' class='form-control input-sm input-thin'>")
                    .attr({ name: k, value: botDef[k].default || "", placeholder: k })
                    .appendTo($lbl)
                    ;
            }
            else if (botDef[k].type === Boolean) {
                var $inp = $("<input type='checkbox'>").attr({ name: k });
                if (botDef[k].default === true) $inp.attr("checked", "checked");
                $("<label></label>")
                    .text(" " + k + ": ")
                    .append($inp)
                    .appendTo($prms)
                ;
            }
            else {
                error("Unknown field type: " + botDef[k].type);
            }
        }
    };
}
function botFromAdd ($list, $prms) {
    var bot = { type: $list.val() };
    $prms.find("input").each(function () {
        var $inp = $(this)
        ,   val
        ;
        if (!bot.params) bot.params = {};
        if ($inp.attr("type") === "radio" || $inp.attr("type") === "checkbox") val = $inp.is(":checked");
        else if ($inp.attr("type") === "number") val = 1 * $inp.val();
        else val = $inp.val();
        bot.params[$inp.attr("name")] = val;
    });
    return bot;
}

// TOURNAMENTS
var $lu = $("#lineup")
,   defaultLineup =     [
        { type: "all_d" }
    ,   { type: "all_c" }
    ,   { type: "random",                   params: { cooperate: 0.5 } }
    ,   { type: "pavlov" }
    ,   { type: "tit_for_tat" }
    ,   { type: "tit_for_two_tats" }
    ,   { type: "two_tits_for_tat" }
    ,   { type: "suspicious_tit_for_tat" }
    ,   { type: "generous_tit_for_tat",     params: { generous: 0.1 } }
    ,   { type: "generous_tit_for_tat",     params: { generous: 0.3 } }
    ,   { type: "joss",                     params: { sneaky: 0.1 } }
    ,   { type: "joss",                     params: { sneaky: 0.3 } }
    ,   { type: "majority",                 params: { soft: true } }
    ,   { type: "majority",                 params: { soft: false } }
    ,   { type: "tester" }
    ,   { type: "friedman" }
    ,   { type: "eatherly" }
    ,   { type: "champion" }
    ,   { type: "random",                   params: { cooperate: 0.8 } }
    ,   { type: "random",                   params: { cooperate: 0.2 } }
    ]
;

function loadLastLineup () {
    if (localStorage.lastLineup) return JSON.parse(localStorage.lastLineup);
    return defaultLineup;
}

function saveLineup (lineup) {
    localStorage.lastLineup = JSON.stringify(lineup);
}

function addToLineup (bot) {
    var $lbl = $("<span class='label label-info'></span>").text(bot.type).attr("data-type", bot.type);
    if (bot.params) {
        var botDef = window.bots[bot.type].configuration
        ,   prms = []
        ;
        for (var k in botDef) {
            var val = typeof bot.params[k] !== "undefined" ? bot.params[k] : botDef[k].default;
            prms.push(k + "=" + val);
            $lbl.attr("data-" + k, val);
        }
        $lbl.append(document.createTextNode(" "));
        $("<span class='prm'></span>").text("(" + prms.join(",") + ")").appendTo($lbl);
    }
    $lbl.append(document.createTextNode(" "));
    $("<button class='btn btn-xs del'><span aria-hidden='true'>&times;</span><span class='sr-only'>Delete</span></button>")
        .appendTo($lbl);
    $lbl.appendTo($lu);
    $lu.append(document.createTextNode(" "));
    return $lbl;
}

function showTournament () {
    var lineup = loadLastLineup();
    $lu.empty();
    lineup.forEach(addToLineup);
}

// loading data
var $botlist = $("#bot-type")
,   $botprms = $("#bot-prms")
,   $progress = $("#progress")
,   $progMsg = $progress.find("span")
,   $run = $("#run")
;
$botlist.empty();
$botprms.empty();
for (var type in window.bots) {
    $("<option></option>").text(type).attr("value", type).appendTo($botlist);
}
$botlist.change(makeBotOptionsShower($botlist, $botprms));

$("body").on("click", "#lineup .del", function (ev) {
    $(ev.target).parent().remove();
});
$("#add-bot").submit(function (ev) {
    ev.preventDefault();
    var bot = botFromAdd($botlist, $botprms);
    addToLineup(bot);
});

$("#default-lineup").click(function () {
    saveLineup(defaultLineup);
    showTournament();
});

function updateProgress (str) {
    $progMsg.text(str);
}

$run.submit(function (ev) {
    ev.preventDefault();
    $run.attr("disabled", "disabled");
    updateProgress("Preparing...");
    $progress.show();
    var lineup = [];
    $lu.find("span.label").each(function () {
        var bot = {};
        for (var i = 0, n = this.attributes.length; i < n; i++) {
            var attr = this.attributes[i];
            if (!/^data-/.test(attr.name)) continue;
            if (attr.name === "data-type") bot.type = attr.value;
            else {
                if (!bot.params) bot.params = {};
                var val = attr.value;
                if (/^\d+(\.\d+)?$/.test(val)) val = 1 * val;
                bot.params[attr.name.replace("data-", "")] = val;
            }
        }
        lineup.push(bot);
    });
    saveLineup(lineup);
    var numMeetings = 1 * $("#num-meetings").val() || 5
    ,   bots = []
    ;
    lineup.forEach(function (b) {
        var botFunc = window.bots[b.type]
        ,   botArgs = []
        ;
        if (!b.params) b.params = {};
        for (var k in botFunc.configuration) {
            botArgs.push(b.params[k] != null ? b.params[k] : botFunc.configuration[k].default);
        }
        bots.push(botFunc.apply(window.bots, botArgs));
    });
    
    
    
    var arena = new Arena()
    ,   arenaDone = function (results) {
            var morality = new MoralityCalculator(results)
            ,   $restabs = $("#result-tables")
            ,   data = {
                    Score:          [results.sortedBotList(), "score", "int"]
                ,   Cooperation:    [morality.botsSortedByCoopRate(), "coopRate", "float"]
                ,   "Good Partner": [morality.botsSortedByGoodPartner(), "goodPartner", "float"]
                ,   "EigenJesus":   [morality.botsSortedByEigenJesus(), "eigenJesus", "float"]
                ,   "EigenMoses":   [morality.botsSortedByEigenMoses(), "eigenMoses", "float"]
                }
            ;
            // console.log(results);
            // console.log("##################");
            // console.log(morality);
            $restabs.empty();
            var $tmpl = $([
                '<div class="col-lg-2 col-sm-6 col-xs-12">'
            ,   '  <div class="panel panel-default">'
            ,   '    <div class="panel-heading"><h3 class="panel-title">XXX</h3></div>'
            ,   '    <table class="table table-striped table-condensed">'
            ,   '      <thead><tr><th>bot</th><th>#</th></tr></thead>'
            ,   '      <tbody></tbody>'
            ,   '    </table>'
            ,   '  </div>'
            ,   '</div>'
            ].join("\n"));
            for (var type in data) {
                var $tab = $tmpl.clone();
                $tab.find("h3").text(type);
                data[type][0].forEach(function (entry) {
                    var val = entry[data[type][1]]
                    ,   isInt = data[type][2] === "int"
                    ;
                    val = isNaN(val) ? "-" : (isInt ? val : val.toFixed(3));
                    $("<tr></tr>")
                        .append($("<td></td>").text(entry.name))
                        .append($("<td></td>").text(val))
                        .appendTo($tab.find("tbody"))
                    ;
                });
                $tab.appendTo($restabs);
            }
            updateProgress("Done!");
            setTimeout(function () {
                $run.removeAttr("disabled");
                $progress.hide();
            }, 500);
        }
    ;
    arena.runTournament(bots, numMeetings, arenaDone, updateProgress);
});

showTournament();

// EVOLUTION
var defaultPopulation = {
    majority_soft:              {
        type:   "majority"
    ,   params: { soft: true }
    ,   number: 5
    }
,   champion:                   {
        type:   "champion"
    ,   number: 5
    }
,   generous_tit_for_tat_03:    {
        type:   "generous_tit_for_tat"
    ,   params: { generous: 0.3 }
    ,   number: 5
    }
,   all_c:                      {
        type:   "all_c"
    ,   number: 1
    }
,   all_d:                      {
        type:   "all_d"
    ,   number: 1
    }
,   friedman:                   {
        type:   "friedman"
    ,   number: 5
    }
,   joss_01:                    {
        type:   "joss"
    ,   params: { sneaky: 0.1 }
    ,   number: 3
    }
};

var $pop = $("#population")
,   currentPopulation
;

function loadLastPopulation () {
    if (localStorage.lastPopulation) return JSON.parse(localStorage.lastPopulation);
    return JSON.parse(JSON.stringify(defaultPopulation));
}

function savePopulation (population) {
    localStorage.lastPopulation = JSON.stringify(population);
}

function showPopulation () {
    $pop.empty();
    Object.keys(currentPopulation)
            .sort()
            .forEach(function (k) {
                var $tr = $("<tr></tr>")
                ,   def = currentPopulation[k]
                ;
                $("<th></th>").text(k).appendTo($tr);
                var prms = def.params ?
                                Object.keys(def.params)
                                        .map(function (pk) { return pk + "=" + def.params[pk]; })
                                        .join(",")
                                : "-";
                $("<td class='botprms'></td>").text(prms).appendTo($tr);
                $("<td></td>")
                    .append($("<input type='number' class='form-control input-sm input-thin number' min='1'>").attr("value", def.number))
                    .appendTo($tr);
                $("<td><button class='btn btn-xs del btn-danger'><span aria-hidden='true'>&times;</span><span class='sr-only'>Delete</span></button></td>")
                    .appendTo($tr);
                $tr.attr("data-type", def.type);
                $tr.attr("data-key", k);
                if (def.params) {
                    for (var pk in def.params) $tr.attr("data-" + pk, def.params[pk]);
                }
                $tr.appendTo($pop);
            });
}

$("#default-population").click(function () {
    savePopulation(defaultPopulation);
    currentPopulation = loadLastPopulation();
    showPopulation();
});

$("body").on("click", "#population .del", function (ev) {
    var key = $(ev.target).parents("tr").first().attr("data-key");
    delete currentPopulation[key];
    showPopulation();
});

$("body").on("change", "#population .number", function (ev) {
    var key = $(ev.target).parents("tr").first().attr("data-key");
    currentPopulation[key].number = $(ev.target).val();
});

var $poplist = $("#bot-pop-type")
,   $popprms = $("#bot-pop-prms")
,   $evoprog = $("#evolution-progress")
,   $evoProgMsg = $evoprog.find("span")
,   $evolve = $("#run-evolution")
,   $popStart = $("#pop-start")
,   $popNow = $("#pop-now")
,   $avgUtility = $("#avg-utility")
,   $avgMorality = $("#avg-morality")
,   $graph = $("#graph")
;
$poplist.empty();
$popprms.empty();
for (var type in window.bots) {
    $("<option></option>").text(type).attr("value", type).appendTo($poplist);
}
$poplist.change(makeBotOptionsShower($poplist, $popprms));

$("#add-pop").submit(function (ev) {
    ev.preventDefault();
    var bot = botFromAdd($poplist, $popprms)
    ,   name = bot.type
    ;
    if (bot.params) {
        var n = [name];
        for (var k in bot.params) {
            if (typeof bot.params[k] === "boolean") {
                if (bot.params[k]) n.push(k);
            }
            else n.push((bot.params[k] + "").replace(/\W/g, ""));
        }
        name = n.join("_");
    }
    if (currentPopulation[name]) return alert("Bot must be unique in the population, " + name + " is already there.");
    currentPopulation[name] = {
        type:   bot.type
    ,   number: 2
    };
    if (bot.params) currentPopulation[name].params = bot.params;
    showPopulation();
});

currentPopulation = loadLastPopulation();
showPopulation();

function updateEvoProgress (str) {
    $evoProgMsg.text(str);
}
var SVG_NS = "http://www.w3.org/2000/svg";
function graph ($el, generation, totalPop, pop, colours, steps) {
    var width = $el.width() / steps + 2
    ,   height = $el.height()
    ,   g = document.createElementNS(SVG_NS, "g")
    ,   offset = 0
    ;
    g.setAttribute("transform", "translate(" + (width * generation) + ", 0)");
    for (var k in pop) {
        var rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("fill", colours[k]);
        rect.setAttribute("x", 0);
        rect.setAttribute("y", offset);
        rect.setAttribute("width", width);
        var h = (pop[k] / totalPop) * height;
        rect.setAttribute("height", h);
        offset += h;
        rect.setAttribute("data-label", k + " (pop: " + pop[k] + ")");
        g.appendChild(rect);
    }
    $el.append(g);
}

$("body").on("mouseover", "rect[data-label]", function (ev) {
    $("#caption").text($(ev.target).attr("data-label"));
});

$evolve.submit(function (ev) {
    ev.preventDefault();
    $evolve.attr("disabled", "disabled");
    updateEvoProgress("Evolving");
    $evoprog.show();
    $graph.empty();
    savePopulation(currentPopulation);
    var numMeetings = 1 * $("#evolution-meetings").val() || 5
    ,   importance = 1 * $("#importance").val() || 0.5
    ,   steps = 1 * $("#evolution-steps").val() || 50
    ,   morality = $("#morality").val()
    ,   evolution = new Evolution(currentPopulation, morality, importance, steps, numMeetings)
    ,   startPopulation = 0
    ,   colours = randomColor({ count: Object.keys(currentPopulation).length })
    ,   colourMap = {}
    ,   startPopStruct = {}
    ;
    for (var k in currentPopulation) {
        startPopulation += 1 * currentPopulation[k].number;
        colourMap[k] = colours.shift();
        startPopStruct[k] = 1 * currentPopulation[k].number;
    }
    $popStart.text(startPopulation);
    graph($graph, 0, startPopulation, startPopStruct, colourMap, steps);
    evolution.run(
        function (type, obj) {
            console.log(obj);
            if (type === "msg") return updateEvoProgress(obj);
            else {
                // reporting with each generation
                $popNow.text(obj.totalPopulation);
                $avgUtility.text((obj.totalUtility / obj.totalPopulation).toFixed(2));
                // XXX this is not a useful metric, it will always be very close to 1. Need the eigenvalue.
                $avgMorality.text((obj.totalMorality / obj.totalPopulation).toFixed(2));
                graph($graph, obj.generation, obj.totalPopulation, obj.populationStructure, colourMap, steps);
            }
        }
    ,   function () {
            updateEvoProgress("Done!");
            setTimeout(function () {
                $evolve.removeAttr("disabled");
                $evoprog.hide();
            }, 500);
        }
    );
});
