const gameController = (() => {
  const _X = "X";
  const _O = "O";
  const _NONE = "NONE";

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

  return { signX, signO, gameBoard, winner, createGameBoard, place, reset };
})();

console.log(gameController.createGameBoard(5));
console.log(gameController.place(gameController.signX(), 0, 0));
console.log(gameController.place(gameController.signX(), 0, 1));
console.log(gameController.place(gameController.signX(), 0, 2));
console.log(gameController.place(gameController.signX(), 0, 3));
console.log(gameController.place(gameController.signX(), 0, 4));
console.log(gameController.gameBoard());
console.log("-------------------------New Game-------------------------");
console.log(gameController.reset());
console.log(gameController.place(gameController.signX(), 1, 0));
console.log(gameController.place(gameController.signX(), 1, 1));
console.log(gameController.place(gameController.signX(), 1, 2));
console.log(gameController.place(gameController.signX(), 1, 3));
console.log(gameController.place(gameController.signX(), 1, 4));
console.log(gameController.gameBoard());
console.log("-------------------------New Game-------------------------");
console.log(gameController.reset());
console.log(gameController.place(gameController.signX(), 2, 0));
console.log(gameController.place(gameController.signX(), 2, 1));
console.log(gameController.place(gameController.signX(), 2, 2));
console.log(gameController.place(gameController.signX(), 2, 3));
console.log(gameController.place(gameController.signX(), 2, 4));
console.log(gameController.gameBoard());
console.log("-------------------------New Game-------------------------");
console.log(gameController.reset());
console.log(gameController.place(gameController.signX(), 0, 0));
console.log(gameController.place(gameController.signX(), 1, 0));
console.log(gameController.place(gameController.signX(), 2, 0));
console.log(gameController.place(gameController.signX(), 3, 0));
console.log(gameController.place(gameController.signX(), 4, 0));
console.log(gameController.gameBoard());
console.log("-------------------------New Game-------------------------");
console.log(gameController.reset());
console.log(gameController.place(gameController.signX(), 0, 1));
console.log(gameController.place(gameController.signX(), 1, 1));
console.log(gameController.place(gameController.signX(), 2, 1));
console.log(gameController.place(gameController.signX(), 3, 1));
console.log(gameController.place(gameController.signX(), 4, 1));
console.log(gameController.gameBoard());
console.log("-------------------------New Game-------------------------");
console.log(gameController.reset());
console.log(gameController.place(gameController.signX(), 0, 2));
console.log(gameController.place(gameController.signX(), 1, 2));
console.log(gameController.place(gameController.signX(), 2, 2));
console.log(gameController.place(gameController.signX(), 3, 2));
console.log(gameController.place(gameController.signX(), 4, 2));
console.log(gameController.gameBoard());
console.log("-------------------------New Game-------------------------");
console.log(gameController.reset());
console.log(gameController.place(gameController.signX(), 0, 0));
console.log(gameController.place(gameController.signX(), 1, 1));
console.log(gameController.place(gameController.signX(), 2, 2));
console.log(gameController.place(gameController.signX(), 3, 3));
console.log(gameController.place(gameController.signX(), 4, 4));
console.log(gameController.gameBoard());
console.log("-------------------------New Game-------------------------");
console.log(gameController.reset());
console.log(gameController.place(gameController.signX(), 0, 4));
console.log(gameController.place(gameController.signX(), 1, 3));
console.log(gameController.place(gameController.signX(), 2, 2));
console.log(gameController.place(gameController.signX(), 3, 1));
console.log(gameController.place(gameController.signX(), 4, 0));
console.log(gameController.gameBoard());
