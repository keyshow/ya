document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 9;
    const grid = document.getElementById('sudoku-grid');
    const timerElement = document.getElementById('timer');
    const resetButton = document.getElementById('reset-button');
    const checkButton = document.getElementById('check-button');
    const hintButton = document.getElementById('hint-button');
    const difficultySelect = document.getElementById('difficulty');

    let time = 0;
    let timerInterval;
    let solvedBoard = []; // 存储完整的数独答案

    // 难度对应的挖空数量
    const difficultyLevels = {
        easy: 30,   // 简单
        medium: 45, // 中等
        hard: 60    // 困难
    };

    // 初始化数独网格
    function initializeGrid() {
        for (let i = 0; i < gridSize; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;

                // 监听输入事件，动态分配颜色
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    if (/^[1-9]$/.test(value)) {
                        e.target.classList = `number-${value}`; // 分配颜色
                    } else {
                        e.target.classList = ''; // 清空颜色
                    }
                });

                cell.appendChild(input);
                row.appendChild(cell);
            }
            grid.appendChild(row);
        }
    }

    // 启动计时器
    function startTimer() {
        timerInterval = setInterval(() => {
            time++;
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            timerElement.textContent = `时间: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    // 停止计时器
    function stopTimer() {
        clearInterval(timerInterval);
    }

    // 重置游戏
    function resetGame() {
        stopTimer();
        time = 0;
        timerElement.textContent = '时间: 00:00';
        grid.innerHTML = '';
        initializeGrid();
        generateRandomSudoku();
        startTimer();
    }

    // 检查数字是否有效
    function isValid(board, row, col, num) {
        // 检查行
        for (let i = 0; i < gridSize; i++) {
            if (i !== col && board[row][i] === num) {
                return false;
            }
        }

        // 检查列
        for (let i = 0; i < gridSize; i++) {
            if (i !== row && board[i][col] === num) {
                return false;
            }
        }

        // 检查 3x3 宫
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = startRow + i;
                const currentCol = startCol + j;
                if (currentRow !== row && currentCol !== col && board[currentRow][currentCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // 使用递归回溯算法填充数独
    function solveSudoku(board) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= gridSize; num++) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveSudoku(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // 生成一个随机的数独谜题
    function generateRandomSudoku() {
        const board = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        solveSudoku(board); // 生成一个完整的数独
        solvedBoard = JSON.parse(JSON.stringify(board)); // 保存完整的答案

        // 根据难度选择挖空数量
        const difficulty = difficultySelect.value;
        const emptyCells = difficultyLevels[difficulty];

        // 随机挖空格子
        for (let i = 0; i < emptyCells; i++) {
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
            } else {
                i--; // 如果已经是空的，重新尝试
            }
        }

        // 将生成的数独填充到页面
        const inputs = grid.querySelectorAll('input');
        let index = 0;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const value = board[row][col];
                const input = inputs[index];
                input.value = value === 0 ? '' : value;
                input.readOnly = value !== 0; // 固定已填的数字

                // 为数字分配颜色
                if (value !== 0) {
                    input.classList.add(`number-${value}`);
                }
                index++;
            }
        }
    }

    // 检查答案
    function checkAnswer() {
        const inputs = grid.querySelectorAll('input');
        let index = 0;
        let isCorrect = true;

        // 清空之前的错误高亮
        inputs.forEach(input => input.classList.remove('error'));

        // 获取当前玩家填写的数独
        const board = getCurrentBoard();

        // 检查每一行、每一列和每个 3x3 宫
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const input = inputs[index];
                const value = board[row][col];

                if (value === 0) {
                    isCorrect = false;
                    input.classList.add('error'); // 高亮空格子
                } else if (!isValid(board, row, col, value)) {
                    isCorrect = false;
                    input.classList.add('error'); // 高亮错误格子
                }
                index++;
            }
        }

        if (isCorrect) {
            stopTimer(); // 停止计时器
            alert('恭喜！答案正确！');
            resetGame(); // 初始化游戏
        } else {
            alert('答案有误，请检查高亮的格子。');
        }
    }

    // 获取当前玩家填写的数独
    function getCurrentBoard() {
        const board = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        const inputs = grid.querySelectorAll('input');
        let index = 0;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const value = inputs[index].value;
                board[row][col] = value === '' ? 0 : Number(value);
                index++;
            }
        }

        return board;
    }

    // 提示功能
    function giveHint() {
        console.log('提示按钮被点击');
        const inputs = grid.querySelectorAll('input');
        let emptyCells = [];

        // 找到所有空格子
        inputs.forEach((input, index) => {
            if (input.value === '') {
                emptyCells.push(index);
            }
        });

        console.log('空格子数量:', emptyCells.length);

        if (emptyCells.length === 0) {
            alert('没有空格子了！');
            return;
        }

        // 随机选择一个空格子
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const input = inputs[randomIndex];
        console.log('选择的空格子索引:', randomIndex);

        // 获取对应的行和列
        const row = Math.floor(randomIndex / gridSize);
        const col = randomIndex % gridSize;
        console.log('行:', row, '列:', col);

        // 填充正确的数字
        const correctValue = solvedBoard[row][col];
        console.log('正确数字:', correctValue);
        input.value = correctValue;
        input.classList.add(`number-${correctValue}`);
        input.readOnly = true; // 设置为只读
    }

    // 初始化游戏
    initializeGrid();
    generateRandomSudoku();
    startTimer();

    // 重置按钮事件
    resetButton.addEventListener('click', resetGame);

    // 难度选择事件
    difficultySelect.addEventListener('change', resetGame);

    // 检查答案按钮事件
    checkButton.addEventListener('click', checkAnswer);

    // 提示按钮事件
    hintButton.addEventListener('click', giveHint);
});