/* global error */

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

function loadLastLineUp () {
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
    ,   lineup = loadLastLineUp()
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
            $("<input type='number' min='0' max='0.999' step='0.05' class='form-control input-sm'>")
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
        else val = $inp.val();
        bot.params[$inp.attr("name")] = val;
    });
    addToLineup(bot);
});

showTournament();

/*
    from Arena
    if __name__ == "__main__":

        import the_bots

        a = Arena()

        #----------#

        num_meetings = 5

        b1 = the_bots.ALL_D()
        b2 = the_bots.ALL_C()
        b3 = the_bots.RANDOM(p_cooperate=0.5)
        b4 = the_bots.PAVLOV()
        b5 = the_bots.TIT_FOR_TAT()
        b6 = the_bots.TIT_FOR_TWO_TATS()
        b7 = the_bots.TWO_TITS_FOR_TAT()
        b8 = the_bots.SUSPICIOUS_TIT_FOR_TAT()
        b9 = the_bots.GENEROUS_TIT_FOR_TAT(p_generous=0.1)
        b10 = the_bots.GENEROUS_TIT_FOR_TAT(p_generous=0.3)
        b11 = the_bots.JOSS(p_sneaky=0.1)
        b12 = the_bots.JOSS(p_sneaky=0.3)
        b13 = the_bots.MAJORITY(soft=True)
        b14 = the_bots.MAJORITY(soft=False)
        b15 = the_bots.TESTER()
        b16 = the_bots.FRIEDMAN()
        b17 = the_bots.EATHERLY()
        b18 = the_bots.CHAMPION()
        b19 = the_bots.RANDOM(p_cooperate=0.8)
        b20 = the_bots.RANDOM(p_cooperate=0.2)
        bot_list = [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13,\
         b14, b15, b16, b17, b18, b19, b20]

        t = a.runTournament(bot_list, num_meetings)
        print(t)

        mc = mc.MoralityCalculator(t)
        print(mc)
    
*/