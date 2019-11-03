var initCombinations = require('./combinations');

// Function init board
Array.matrix = function (m, n, initial) {
    var a, i, j, mat = [];
    for (i = 0; i < m; i++) {
        a = [];
        for (j = 0; j < n; j++) {
            a[j] = initial;
        }
        mat[i] = a;
    }
    return mat;
};

// Function get rival sign
getRivalSign = function (player) {
    return -player;
}

module.exports = function () {

    /**
     * Khởi tạo biến
     */
    var ring = 1;
    var boardSize = 20;
    var curState = Array.matrix(20, 20, 0);
    var botPlayer = getRivalSign(1);
    var combinations = initCombinations();
    var history = [JSON.parse(JSON.stringify(curState))];
    var currentStep = 0;

    /**
     * Các hàm bổ trợ tìm đường
     */

    var getChilds = function (parent, player) {
        var children = [];
        var candidates = [];

        // Duyệt bàn cờ để lấy các ô trống (candidates)
        for (var i = 0; i < boardSize; i++) {
            for (var j = 0; j < boardSize; j++) {

                // Nếu ô hiện tại đã đánh
                if (parent[i][j] != 0) {

                    // Kiểm tra 8 ô xung quanh
                    for (var k = i - ring; k <= i + ring; k++) {
                        for (var l = j - ring; l <= j + ring; l++) {

                            // Nếu ô xung quanh hiện tại hợp lệ
                            if (k >= 0 && l >= 0 && k < boardSize && l < boardSize) {

                                // Và trống
                                if (parent[k][l] == 0) {
                                    var curPoint = [k, l];

                                    // Kiểm tra nó chưa có trong danh sách ô trống (candidates) thì thêm vào
                                    var flag = isAllSatisfy(candidates, curPoint[0], curPoint[1]);
                                    if (flag) {
                                        candidates.push(curPoint);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Duyệt danh sách các ô trống
        for (var f = 0; f < candidates.length; f++) {

            // Khởi tạo bàn cờ tạm
            var tmp = Array.matrix(boardSize, boardSize, 0);

            // Sao chép bàn cờ gốc sang
            for (var m = 0; m < boardSize; m++) {
                for (var n = 0; n < boardSize; n++) {
                    tmp[m][n] = parent[m][n];
                }
            }

            // Lấp đầy các ô trống hiện tại bằng nước cờ của đối thủ
            tmp[candidates[f][0]][candidates[f][1]] = getRivalSign(player);

            // Đưa vào danh sách bàn cờ tương lai
            children.push({
                board: tmp,
                cell: candidates[f]
            });
        }
        return children;
    };

    var isAllSatisfy = function (candidates, pointX, pointY) {
        var counter = 0;
        for (var i = 0; i < candidates.length; i++) {
            if (pointX != candidates[i][0] || pointY != candidates[i][1]) counter++;
        }
        return counter == candidates.length;
    };

    var miniMax = function minimax(child, parent) {

        // Làm đơn giản, không đệ qui
        return heuristic(child, parent);
    };

    var getCombo = function (board, curPlayer, i, j, dx, dy) {
        var combo = [curPlayer];
        for (var m = 1; m < 5; m++) {
            var nextX1 = i - dx * m;
            var nextY1 = j - dy * m;
            if (nextX1 >= boardSize || nextY1 >= boardSize || nextX1 < 0 || nextY1 < 0) break;
            var next1 = board[nextX1][nextY1];
            if (next1 == getRivalSign(curPlayer)) {
                combo.unshift(next1);
                break;
            }
            combo.unshift(next1);
        }
        for (var k = 1; k < 5; k++) {
            var nextX = i + dx * k;
            var nextY = j + dy * k;
            if (nextX >= boardSize || nextY >= boardSize || nextX < 0 || nextY < 0) break;
            var next = board[nextX][nextY];
            if (next == getRivalSign(curPlayer)) {
                combo.push(next);
                break;
            }
            combo.push(next);
        }
        return combo;
    };

    var heuristic = function (futureBoard, currentBoard) {
        for (var i = 0; i < boardSize; i++) {
            for (var j = 0; j < boardSize; j++) {
                if (futureBoard[i][j] != currentBoard[i][j]) {
                    var curCell = futureBoard[i][j];
                    var playerVal = combinations.valuePosition(
                        getCombo(futureBoard, curCell, i, j, 1, 0),
                        getCombo(futureBoard, curCell, i, j, 0, 1),
                        getCombo(futureBoard, curCell, i, j, 1, 1),
                        getCombo(futureBoard, curCell, i, j, 1, -1)
                    );
                    futureBoard[i][j] = getRivalSign(curCell);
                    var oppositeVal = combinations.valuePosition(
                        getCombo(futureBoard, getRivalSign(curCell), i, j, 1, 0),
                        getCombo(futureBoard, getRivalSign(curCell), i, j, 0, 1),
                        getCombo(futureBoard, getRivalSign(curCell), i, j, 1, 1),
                        getCombo(futureBoard, getRivalSign(curCell), i, j, 1, -1)
                    );
                    futureBoard[i][j] = getRivalSign(curCell);
                    return 2 * playerVal + oppositeVal;
                }
            }
        }
        return 0;
    };

    /**
     * Thực hiện tác động lên bàn cờ
     */
    var getLogic = {};

    getLogic.reset = function () {
        currentStep = 0;
        curState = Array.matrix(20, 20, 0);
        history = [JSON.parse(JSON.stringify(curState))];
    };

    getLogic.rollBackTo = function (step) {

        // Bước hiện tại lượt luôn là của người chơi
        const flag_1 = currentStep % 2 == 0;

        // Kiểm tra xem bước cần quay về là lượt của ai
        const flag_2 = step % 2 == 0;
        const isBotMove = flag_1 != flag_2;

        // Nếu là lượt của bot thì lấy lại lượt 'sẽ' đi
        currentStep = step + (isBotMove ? 1 : 0);

        // Lấy trạng thái tại bước này
        curState = history[currentStep];

        return isBotMove;
    }

    getLogic.makeBotMove = function (x, y) {
        curState[x][y] = getRivalSign(botPlayer);
        history.push(JSON.parse(JSON.stringify(curState)));
        currentStep++;
    };

    getLogic.makePlayerMove = function (x, y) {

        // Đánh vào bàn cờ
        curState[x][y] = botPlayer;
        if (currentStep < history.length - 1) {
            history = history.slice(0, currentStep);
        }
        currentStep++;
        history.push(JSON.parse(JSON.stringify(curState)));

        // Tìm nước đi cho bot
        var botMove = [-1, -1];
        var candidateBoards = getChilds(curState, botPlayer);
        var maxChild = -1;
        var maxValue = Number.MIN_VALUE;
        var listCandidateCells = [];

        // Duyệt tất cả bàn cờ tương lai
        for (var k = 0; k < candidateBoards.length; k++) {

            // Tính minimax
            var curValue = miniMax(candidateBoards[k].board, curState);

            // Lấy danh sách các giá trị cao nhất
            if (maxValue == curValue) {
                listCandidateCells.push(k);
            } else if (maxValue < curValue) {
                maxValue = curValue;
                listCandidateCells = [k];
            }
        }
        // Sẽ có thể có nhiều bàn cờ có minimax cao nhất mà bằng nhau, nên ta có thể lấy ngẫu nhiên
        const random = 0;
        maxChild = listCandidateCells[random];

        // Cập nhật bàn cờ hiện tại
        if (candidateBoards[maxChild]) {
            botMove = candidateBoards[maxChild].cell;
            curState[botMove[0]][botMove[1]] = getRivalSign(botPlayer);
            currentStep++;
            history.push(JSON.parse(JSON.stringify(curState)));
        }

        return botMove;
    };

    return getLogic;
};