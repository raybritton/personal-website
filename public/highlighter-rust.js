const R_KEYWORDS = ['match', 'let', 'mut', 'if', 'loop', 'continue', 'struct', 'impl', 'trait', 'for', 'in', 'fn', 'use', 'extern', 'crate'];
const R_SYMBOLS = /[!@#\$%\^&\*\(\)_\+\-=\[\]{};'\:"\|<>\?,\.\/`']/
const R_LETTERS = /[a-zA-Z]/
const R_NUMBERS = /[0-9]/

function highlight_rust(code) {
    var output = "";
    var building = "";
    var currentSelection = "";
    var nonWhitespaceFound = false

    for (i = 0; i < code.length; i++) {
        var nextLetter = code[i];
        if (!nonWhitespaceFound) {
            if (nextLetter == " " || nextLetter == "    " || nextLetter == '\n') {
                continue;
            }
            nonWhitespaceFound = true;
        }
        switch (building) {
            case "comment": {
                if (nextLetter == '\n') {
                    output += "<span class=\"rust-code-comment\">" + currentSelection + "</span>";
                    output += nextLetter;
                    building = "";
                    currentSelection = "";
                } else {
                    currentSelection += nextLetter;
                }
            }
            break;
            case "keyword": {
                if (R_LETTERS.test(nextLetter)) {
                    currentSelection += nextLetter;
                } else {
                    if (R_KEYWORDS.includes(currentSelection)) {
                        output += "<span class=\"rust-code-keyword\">" + currentSelection + "</span>";
                    } else {
                        output += currentSelection;
                    }
                    building = "";
                    currentSelection = "";
                    output += nextLetter;
                }
            } 
            break;
            default: {
                if (nextLetter == '/' && code[i+1] == '/') {
                    building = "comment"
                    currentSelection = nextLetter
                } else if (R_LETTERS.test(nextLetter)) {
                    building = "keyword"
                    currentSelection = nextLetter
                } else if (R_SYMBOLS.test(nextLetter)) {
                    output += "<span class=\"rust-code-symbol\">" + nextLetter + "</span>";
                } else {
                    output += nextLetter;
                }
            }
        }
    }

    return output;
}