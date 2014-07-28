
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