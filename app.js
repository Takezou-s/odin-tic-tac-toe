const X = "X";
const O = "O";
const NONE = "NONE";
const DRAW = "DRAW";
const LENGTH = "length";
const SELECTEDCELL = "selectedCell";

const gameController = (() => {
  let _length = 3;
  let _gameOver = false;
  let _winner = NONE;

  let _gameBoard = [
    [NONE, NONE, NONE],
    [NONE, NONE, NONE],
    [NONE, NONE, NONE],
  ];

  const signX = () => {
    return X;
  };

  const signO = () => {
    return O;
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
        arr.push(NONE);
      }
      _gameBoard.push(arr);
    }

    return _gameBoard;
  };

  const place = (sign, row, col) => {
    if (
      _gameOver ||
      (sign !== X && sign !== O) ||
      row >= _length ||
      row < 0 ||
      col > _length ||
      col < 0 ||
      _gameBoard[row][col] !== NONE
    ) {
      return { valid: false };
    }

    _gameBoard[row][col] = sign;
    _winner = _checkWinner();
    if (_winner !== NONE) {
      _gameOver = true;
    } else if (_checkAllFull()) {
      _winner = DRAW;
      _gameOver = true;
    }
    return { valid: true, row, col, sign, winner: _winner, gameOver: _gameOver };
  };

  const reset = () => {
    _gameOver = false;
    _winner = NONE;
    _gameBoard = [];
    createGameBoard(_length);
  };

  const _checkWinner = () => {
    let winner = NONE;
    winner = _checkWinnerRows();
    if (winner === NONE) winner = _checkWinnerColumns();
    if (winner === NONE) winner = _checkWinnerDiagonal();
    if (winner === NONE) winner = _checkWinnerDiagonalReverse();
    return winner;
  };

  const _checkWinnerRows = () => {
    let winner = NONE;

    for (let row = 0; row < _length; row++) {
      let prevSign = NONE;

      for (let col = 0; col < _length; col++) {
        const cellSign = _gameBoard[row][col];

        if (cellSign === NONE) break;

        if (col === 0) {
          prevSign = cellSign;
          continue;
        }

        if (prevSign !== cellSign) break;

        prevSign = cellSign;

        if (col === _length - 1) winner = cellSign;
      }

      if (winner !== NONE) break;
    }

    return winner;
  };

  const _checkWinnerColumns = () => {
    let winner = NONE;

    for (let col = 0; col < _length; col++) {
      let prevSign = NONE;

      for (let row = 0; row < _length; row++) {
        const cellSign = _gameBoard[row][col];

        if (cellSign === NONE) break;

        if (row === 0) {
          prevSign = cellSign;
          continue;
        }

        if (prevSign !== cellSign) break;

        prevSign = cellSign;

        if (row === _length - 1) winner = cellSign;
      }

      if (winner !== NONE) break;
    }

    return winner;
  };

  const _checkWinnerDiagonal = () => {
    let winner = NONE;
    let prevSign = NONE;

    for (let i = 0; i < _length; i++) {
      const cellSign = _gameBoard[i][i];

      if (cellSign === NONE) break;

      if (i === 0) {
        prevSign = cellSign;
        continue;
      }

      if (prevSign !== cellSign) break;

      prevSign = cellSign;

      if (i === _length - 1) winner = cellSign;

      if (winner !== NONE) break;
    }

    return winner;
  };

  const _checkWinnerDiagonalReverse = () => {
    let winner = NONE;
    let prevSign = NONE;

    for (let i = 0; i < _length; i++) {
      const cellSign = _gameBoard[_length - 1 - i][i];

      if (cellSign === NONE) break;

      if (i === 0) {
        prevSign = cellSign;
        continue;
      }

      if (prevSign !== cellSign) break;

      prevSign = cellSign;

      if (i === _length - 1) winner = cellSign;

      if (winner !== NONE) break;
    }

    return winner;
  };

  const _checkAllFull = () => {
    let result = true;
    for (let row = 0; row < _length; row++) {
      for (let col = 0; col < _length; col++) {
        const cellSign = _gameBoard[row][col];
        if (cellSign === NONE) {
          result = false;
          break;
        }
      }
      if (!result) break;
    }
    return result;
  };

  return { signX, signO, gameBoard, winner, createGameBoard, place, reset };
})();

const displayController = (() => {
  let _gameBoardEl;

  const initGameBoardEl = (gameBoardContainerEl, length) => {
    _gameBoardEl = document.createElement("div");
    _gameBoardEl.style.display = "grid";

    setGameBoardLength(length);

    gameBoardContainerEl.innerHTML = "";
    gameBoardContainerEl.appendChild(_gameBoardEl);
  };

  const setGameBoardLength = (length) => {
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

  const showMove = (sign, row, col) => {
    const cellEl = _gameBoardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cellEl) cellEl.textContent = _getSignText(sign);
  };

  const _getSignText = (sign) => {
    if (sign === X || sign === O) return sign;
    else return "";
  };

  return { initGameBoardEl, showGameBoard, showMove, setGameBoardLength };
})();

const interactionController = (() => {
  let _length;
  let _changed = [];

  const initFieldLengthEl = (fieldLengthContainerEl) => {
    const lengthSliderEl = fieldLengthContainerEl.querySelector(".length-slider");
    const lengthInfoEl = fieldLengthContainerEl.querySelector(".length-info");

    lengthSliderEl.addEventListener("input", (event) => (lengthInfoEl.textContent = event.target.value + " x " + event.target.value));
    lengthSliderEl.addEventListener("change", (event) => {
      _length = event.target.value;
      _fireChanged(LENGTH, _length);
    });
  };

  const initGameBoardEl = (gameBoardContainerEl) => {
    gameBoardContainerEl.addEventListener("click", (event) => {
      if (event.target.dataset.row && event.target.dataset.col) {
        _fireChanged(SELECTEDCELL, { row: event.target.dataset.row, col: event.target.dataset.col });
      }
    });
  };

  const subscribeChanged = (subscriber) => {
    _changed.push(subscriber);
  };

  const _fireChanged = (property, value) => {
    _changed.forEach((x) => x(property, value));
  };

  return { initFieldLengthEl, initGameBoardEl, subscribeChanged };
})();

const gameManager = (() => {
  let _gameController, _displayController, _interactionController;
  let _lastSign;

  const init = (gameController, displayController, interactionController) => {
    _gameController = gameController;
    _displayController = displayController;
    _interactionController = interactionController;

    interactionController.subscribeChanged(_changedSubscriber(_lengthChangedHandler, (x) => x === LENGTH));
    interactionController.subscribeChanged(_changedSubscriber(_selectedCellChangedHandler, (x) => x === SELECTEDCELL));
  };

  const _lengthChangedHandler = (length) => {
    _gameController.createGameBoard(length);
    _displayController.setGameBoardLength(length);
  };

  const _selectedCellChangedHandler = (selectedCell) => {
    const result = gameController.place(_getSign, selectedCell.row, selectedCell.col);
    if (result.valid) {
      displayController.showMove(result.sign, result.row, result.col);
      _lastSign = result.sign;
    }
  };

  const _changedSubscriber = (fn, predicate) => {
    return (property, value) => {
      if (predicate(property)) {
        fn(value);
      }
    };
  };

  const _getSign = () => {
    return _lastSign === X ? O : X;
  };

  return { init };
})();
