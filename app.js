const _X = "X";
const _O = "O";
const _NONE = "NONE";

const gameController = (() => {
  let _length = 3;
  let _gameOver = false;
  let _winner = _NONE;

  let _gameBoard = [
    [_NONE, _NONE, _NONE],
    [_NONE, _NONE, _NONE],
    [_NONE, _NONE, _NONE],
  ];

  const signX = () => {
    return _X;
  };

  const signO = () => {
    return _O;
  };

  const gameBoard = () => {
    return _gameBoard;
  };

  const winner = () => {
    return _winner;
  };

  const createGameBoard = (length) => {
    if (!length || isNaN(length) || length <= 2 || length % 2 !== 1) {
      throw new Error("Length must be ann odd number greater than 2!");
    }

    _gameBoard = [];
    _length = length;

    for (let i = 0; i < length; i++) {
      const arr = [];
      for (let j = 0; j < length; j++) {
        arr.push(_NONE);
      }
      _gameBoard.push(arr);
    }

    return _gameBoard;
  };

  const place = (sign, row, col) => {
    if (
      _gameOver ||
      (sign !== _X && sign !== _O) ||
      row >= _length ||
      row < 0 ||
      col > _length ||
      col < 0 ||
      _gameBoard[row][col] !== _NONE
    ) {
      return { valid: false };
    }

    _gameBoard[row][col] = sign;
    _winner = _checkWinner();
    if (_winner !== _NONE) {
      _gameOver = true;
    }
    return { valid: true, row, col, sign, winner: _winner, gameOver: _gameOver };
  };

  const reset = () => {
    _gameOver = false;
    _winner = _NONE;
    _gameBoard = [];
    createGameBoard(_length);
  };

  const _checkWinner = () => {
    let winner = _NONE;
    winner = _checkWinnerRows();
    if (winner === _NONE) winner = _checkWinnerColumns();
    if (winner === _NONE) winner = _checkWinnerDiagonal();
    if (winner === _NONE) winner = _checkWinnerDiagonalReverse();
    return winner;
  };

  const _checkWinnerRows = () => {
    let winner = _NONE;

    for (let row = 0; row < _length; row++) {
      let prevSign = _NONE;

      for (let col = 0; col < _length; col++) {
        const cellSign = _gameBoard[row][col];

        if (cellSign === _NONE) break;

        if (col === 0) {
          prevSign = cellSign;
          continue;
        }

        if (prevSign !== cellSign) break;

        prevSign = cellSign;

        if (col === _length - 1) winner = cellSign;
      }

      if (winner !== _NONE) break;
    }

    return winner;
  };

  const _checkWinnerColumns = () => {
    let winner = _NONE;

    for (let col = 0; col < _length; col++) {
      let prevSign = _NONE;

      for (let row = 0; row < _length; row++) {
        const cellSign = _gameBoard[row][col];

        if (cellSign === _NONE) break;

        if (row === 0) {
          prevSign = cellSign;
          continue;
        }

        if (prevSign !== cellSign) break;

        prevSign = cellSign;

        if (row === _length - 1) winner = cellSign;
      }

      if (winner !== _NONE) break;
    }

    return winner;
  };

  const _checkWinnerDiagonal = () => {
    let winner = _NONE;
    let prevSign = _NONE;

    for (let i = 0; i < _length; i++) {
      const cellSign = _gameBoard[i][i];

      if (cellSign === _NONE) break;

      if (i === 0) {
        prevSign = cellSign;
        continue;
      }

      if (prevSign !== cellSign) break;

      prevSign = cellSign;

      if (i === _length - 1) winner = cellSign;

      if (winner !== _NONE) break;
    }

    return winner;
  };

  const _checkWinnerDiagonalReverse = () => {
    let winner = _NONE;
    let prevSign = _NONE;

    for (let i = 0; i < _length; i++) {
      const cellSign = _gameBoard[_length - 1 - i][i];

      if (cellSign === _NONE) break;

      if (i === 0) {
        prevSign = cellSign;
        continue;
      }

      if (prevSign !== cellSign) break;

      prevSign = cellSign;

      if (i === _length - 1) winner = cellSign;

      if (winner !== _NONE) break;
    }

    return winner;
  };

  return { signX, signO, gameBoard, winner, createGameBoard, place, reset, qwe };
})();

const displayController = (() => {
  let _gameBoardEl;

  const initGameBoardEl = (gameBoardContainerEl, length) => {
    _gameBoardEl = document.createElement("div");
    _gameBoardEl.style.display = "grid";
    _gameBoardEl.style.gridTemplateColumns = `repeat(${length}, 1fr`;
    _gameBoardEl.style.gridTemplateRows = `repeat(${length}, 1fr`;
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        const cellEl = document.createElement("div");
        cellEl.setAttribute("data-row", i.toString());
        cellEl.setAttribute("data-col", j.toString());
        _gameBoardEl.appendChild(cellEl);
      }
    }

    gameBoardContainerEl.innerHTML = "";
    gameBoardContainerEl.appendChild(_gameBoardEl);
  };

  const showGameBoard = (gameBoard) => {
    for (let i = 0; i < gameBoard.length; i++) {
      const row = gameBoard[i];
      for (let j = 0; j < gameBoard.length; j++) {
        const cell = gameBoard[j];
        showMove(i, j, cell);
      }
    }
  };

  const showMove = (row, col, sign) => {
    const cellEl = _gameBoardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cellEl) cellEl.textContent = _getSignText(sign);
  };

  const _getSignText = (sign) => {
    if (sign === _X || sign === _O) return sign;
    else return "";
  };

  return { initGameBoardEl, showGameBoard, showMove };
})();

const interactionController = (() => {})();
