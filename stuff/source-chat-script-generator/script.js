$("#script-mode").change(() => {
    var mode = $("#script-mode option:selected").text();

    if (mode == "Key Press Cycle") {
        $("#bind-key").prop("disabled", false);
    } else {
        $("#bind-key").prop("disabled", true)
    }
});

$("#submit").click(() => {
    var MODE = $("#script-mode option:selected").text();
    var BIND_KEY = $("#bind-key").val().toUpperCase();
    var INPUT_TEXT = $("#input-lines").val();
    var CLEAN_TEXT = $("#use-cleaning").prop("checked");

    var $out = $("#generated-script");

    if(CLEAN_TEXT) {
        INPUT_TEXT = INPUT_TEXT.replace(/(  +)|(\t\t+)/g, " ");
    }
    INPUT_TEXT = INPUT_TEXT.replace(/\n\n+/g, "\n");

    if(MODE == "Key Press Cycle") {
        if(!BIND_KEY || BIND_KEY.length != 1 || !BIND_KEY.match(/[A-Z0-9]/)) {
            return $("#bind-key").effect("shake");
        } else if(!INPUT_TEXT) {
            return $("#input-lines").effect("shake");
        }

        var outVal = `bind ${BIND_KEY} s_print;\nalias s_print s_0;`;

        inputArray = INPUT_TEXT.split("\n");
        inputArray.forEach((line, index) => {
            outVal += `\nalias s_${index} "say ${line.replace(/"/g, "'").replace(/;/g, "")}; alias s_print s_${index}";`
        });

        $out.val(outVal);
    } else {
        var outVal = "//NOT SUPPORTED YET\n//DO NOT USE\n\n" + script_strings.waitSetup + "\n\n" + script_strings.waitTest;

        $out.val(outVal);
    }
});