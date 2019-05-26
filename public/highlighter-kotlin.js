const K_KEYWORDS = ['const', 'var', 'val', 'companion', 'object', 'interface', 'class', 'data', 'private', 'public', 'internal', 'open', 'abstract', 'fun', 'enum', 'sealed', 'return', 'while', 'if', 'true', 'false','else','when','is','lateinit','override','by','lazy','delegate'];
const K_SYMBOLS = /[!@#\$%\^&\*\(\)_\+\-=\[\]{};'\:"\|<>\?,\.\/`']/
const K_LETTERS = /[a-zA-Z]/
const K_NUMBERS = /[0-9]/

function highlight_kotlin(code) {
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
                    output += "<span class=\"kotlin-code-comment\">" + currentSelection + "</span>";
                    output += nextLetter;
                    building = "";
                    currentSelection = "";
                } else {
                    currentSelection += nextLetter;
                }
            }
            break;
            case "keyword": {
                if (K_LETTERS.test(nextLetter)) {
                    currentSelection += nextLetter;
                } else {
                    if (K_KEYWORDS.includes(currentSelection)) {
                        output += "<span class=\"kotlin-code-keyword\">" + currentSelection + "</span>";
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
                } else if (K_LETTERS.test(nextLetter)) {
                    building = "keyword"
                    currentSelection = nextLetter
                } else if (K_SYMBOLS.test(nextLetter)) {
                    output += "<span class=\"kotlin-code-symbol\">" + nextLetter + "</span>";
                } else {
                    output += nextLetter;
                }
            }
        }
    }

    return output;
}