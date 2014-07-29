/* global error, Arena, MoralityCalculator */

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

// TOURNAMENTS
var $lu = $("#lineup");

function loadLastLineup () {
    if (localStorage.lastLineup) return JSON.parse(localStorage.lastLineup);
    return [
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
    ];
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
    var $tn = $("#tournament")
    ,   lineup = loadLastLineup()
    ;
    $tn.show();
    $lu.empty();
    lineup.forEach(addToLineup);
}

// loading data
var $botlist = $("#bot-type")
,   $botprms = $("#bot-prms")
;
$botlist.empty();
$botprms.empty();
for (var type in window.bots) {
    $("<option></option>").text(type).attr("value", type).appendTo($botlist);
}
$botlist.change(function () {
    $botprms.empty();
    var botDef = window.bots[$botlist.val()].configuration;
    for (var k in botDef) {
        if (botDef[k].type === Number) {
            var $lbl = $("<label></label>")
                            .text(" " + k + ": ")
                            .appendTo($botprms)
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
                .appendTo($botprms)
            ;
        }
        else {
            error("Unknown field type: " + botDef[k].type);
        }
    }
});

$("body").on("click", "#lineup .del", function (ev) {
    $(ev.target).parent().remove();
});
$("#add-bot").submit(function (ev) {
    ev.preventDefault();
    var bot = { type: $botlist.val() };
    $botprms.find("input").each(function () {
        var $inp = $(this)
        ,   val
        ;
        if (!bot.params) bot.params = {};
        if ($inp.attr("type") === "radio" || $inp.attr("type") === "checkbox") val = $inp.is(":checked");
        else if ($inp.attr("type") === "number") val = 1 * $inp.val();
        else val = $inp.val();
        bot.params[$inp.attr("name")] = val;
    });
    addToLineup(bot);
});

$("#run").submit(function (ev) {
    ev.preventDefault();
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
    ,   results = arena.runTournament(bots, numMeetings)
    ,   morality = new MoralityCalculator(results)
    ;
    console.log(results);
    console.log("##################");
    console.log(morality);
});

showTournament();
