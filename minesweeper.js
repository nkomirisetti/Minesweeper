$(document).ready(function () {
    $('#submitButton').click(prep);
    $('#minefield').fadeOut(1);
});

var prep = function(){
    $('#settings').fadeOut(1000, function(){
        main()
    });
}

var main = function () {
    $('#minefield').empty();


    var grid = [];
    var isGameLost = false;
    var isGameStart = false;
    var seconds = 0;

    // get values from input boxes
    var intRows = Number($('#heightBox').val());
    var intCols = Number($('#lengthBox').val());
    var intMines = Number($('#minesBox').val());
    var flagCount;

    if (intRows < 8 || intRows > 30) {
        alert(intRows + " is an invalid input for the number of rows");
        return;
    }
    if (intCols < 8 || intCols > 40) {
        alert(intCols + " is an invalid input for the number of columns");
        return;
    }
    if (intMines < 1 || intMines > ((intRows * intCols) - 1)) {
        alert(intMines + " is an invalid input for the number of mines");
        return;
    }
    flagCount = intMines;

    $('#minefield').fadeIn(1000);


    setInterval(function () {
        if (isGameStart && !isGameLost) {
            seconds++;
            $('#totalTime').html(seconds);
        }
    }, 1000);


    function updateGrid() {
        var correctTiles = 0;
        for (var y = 0; y < intRows; y++) { // gets mine location
            for (var x = 0; x < intCols; x++) {

                switch ($('input[x=' + x + ' ][y=' + y + ']').attr('id')) {
                    case "nonCleared":
                        setText(x, y, '🤔');
                        break;
                    case "isFlagged":
                        if ($('input[x=' + x + ' ][y=' + y + ']').attr('isMine') === "true") {
                            correctTiles++;
                        }
                        setText(x, y, '🚩');
                        break;
                    case "cleared":
                        setText(x, y, '0️⃣');
                        break;
                    case "showsNumber":
                        setText(x, y, $('input[x=' + x + ' ][y=' + y + ']').attr('adjacentMineCount'));
                        break;
                }
            }
        }

        // update mines label
        $('#minesLabel').html(flagCount);
        // check if win condition is met
        if (correctTiles === intMines) {
            gameWin();
        }
    }

    function setText(x, y, text) {
        $('input[x=' + x + ' ][y=' + y + ']').attr('value', text);
    }

    function gameLose() {
        isGameLost = true;

        for (var y = 0; y < intRows; y++) { // gets mine location
            for (var x = 0; x < intCols; x++) {
                if ($('input[x=' + x + ' ][y=' + y + ']').attr('isMine') === "true") {
                    setText(x, y, '💣');
                } else if ($('input[x=' + x + ' ][y=' + y + ']').attr('adjacentMineCount') === "0") {
                    setText(x, y, '0️⃣');
                } else {
                    setText(x, y, $('input[x=' + x + ' ][y=' + y + ']').attr('adjacentMineCount'));
                }
            }
        }
        alert("Aw you lost😢");

    }

    function gameWin() {
        $('#scores').append("   • " + seconds + " <br>");
        isGameLost = true;
        alert("Aye you won😎");
    }

    function clear(x, y) {
        if ($('input[x=' + horizontal + ' ][y=' + vertical + ']').attr('id') === "cleared"
            || $('input[x=' + horizontal + ' ][y=' + vertical + ']').attr('id') === "showsNumber"
            || $('input[x=' + horizontal + ' ][y=' + vertical + ']').attr('isMine') === "true") {
            //|| !$('input[x=' + horizontal + ' ][y=' + vertical + ']').attr('adjacentCount') === "0") {
            return;
        }
        for (var horizontal = x - 1; horizontal < x + 2; horizontal++) {
            for (var vertical = y - 1; vertical < y + 2; vertical++) {
                var tile = $('input[x=' + horizontal + ' ][y=' + vertical + ']');
                if ((tile.attr('id') === "nonCleared" || tile.attr('id') === "isFlagged") && tile.attr('isMine') === "false") {
                    if (tile.attr('adjacentMineCount') === "0") {
                        tile.attr('id', 'cleared');
                        clear(horizontal, vertical)
                    } else {
                        tile.attr('id', 'showsNumber');
                    }
                }
            }
        }
    }

    function tileClick(tile, type) {
        isGameStart = true;
        if (isGameLost) {
            return;
        }
        // flagging code
        if (type.shiftKey) {
            if (tile.attr('id') === "nonCleared") {
                tile.attr('id', "isFlagged");
                flagCount--;
            } else if (tile.attr('id') === "isFlagged") {
                tile.attr('id', "nonCleared");
                flagCount++;
            }
        } else if (tile.attr('isMine') === "true") {
            gameLose();
            return;
        } else if ((tile.attr('id') === "nonCleared" || tile.attr('id') === "isFlagged")) {
            if (tile.attr('adjacentMineCount') === "0") {
                clear(Number(tile.attr('x')), Number(tile.attr('y')));
            } else {
                tile.attr('id', 'showsNumber');
            }
        } else if (tile.attr('id') === "showsNumber") {
            for (var xLoc = Number(tile.attr('x')) - 1; xLoc < Number(tile.attr('x') + 2); xLoc++) {
                for (var yLoc = Number(tile.attr('y')) - 1; yLoc < Number(tile.attr('y')) + 2; yLoc++) {
                    if ($('input[x=' + xLoc + ' ][y=' + yLoc + ']').attr('id') === "nonCleared") {
                        tileClick($('input[x=' + xLoc + ' ][y=' + yLoc + ']'), event);
                    }
                }
            }

        }

        updateGrid();
    }

    // create mine locations
    var minesLocations = [];
    var minesToPlace = intMines;
    while (minesToPlace > 0) {
        var random = Math.floor(Math.random() * intCols * intRows);
        if (!minesLocations.includes(random)) {
            minesLocations.push(random);
            minesToPlace--;
        }
    }

    // create grid
    for (var i = 0; i < intRows; i++) { // first iterate over rows
        for (var j = 0; j < intCols; j++) { // then interate through each column to add each button
            var tile;
            if (minesLocations.includes(i * intCols + j)) {  // place mines if iterated location matches actual location
                tile = $('<input type="button" class="tile" id="nonCleared" value="🤔" adjacentMineCount="0" x = ' + j + ' y=' + i + ' isMine=' + true + ' /> ')
                    .click(function (e) {
                        tileClick($(this), e);
                    });
            } else {
                tile = $('<input type="button" class="tile" id="nonCleared" value="🤔" adjacentMineCount="0" x = ' + j + ' y=' + i + ' isMine=' + false + ' /> ')
                    .click(function (e) {
                        tileClick($(this), e);
                    });
            }
            $("#minefield").append(tile);
        }
        // append line break
        $("#minefield").append("<br>");
    }

    // add number of adjacent mines
    for (var y = 0; y < intRows; y++) { // gets mine location
        for (var x = 0; x < intCols; x++) {
            if ($('input[x=' + x + ' ][y=' + y + ']').attr('isMine') === "true") {
                for (var lateral = x - 1; lateral < x + 2; lateral++) { // gets adjacent mines
                    for (var vertical = y - 1; vertical < y + 2; vertical++) {
                        // adds a number to adjacents
                        if (lateral > -1 && vertical > -1 && $('input[x=' + lateral + ' ][y=' + vertical + ']').attr('isMine') === "false") {
                            var adjacents = Number($('input[x=' + lateral + ' ][y=' + vertical + ']').attr('adjacentMineCount'));
                            $('input[x=' + lateral + ' ][y=' + vertical + ']').attr('adjacentMineCount', ++adjacents);
                        }
                    }
                }
            }
        }
    }
}