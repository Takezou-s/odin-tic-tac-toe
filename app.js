const X = "X";
const O = "O";
const NONE = "NONE";
const WIN = "win";
const LOSE = "lose";
const DRAW = "draw";
const LENGTH = "length";
const SELECTEDCELL = "selectedCell";
const SCORE = "score";
const HISTORY = "history";

function changedNotifier() {
  const _changed = [];

  const subscribe = (subscriber) => {
    _changed.push(subscriber);
  };

  const fireChanged = (property, value) => {
    _changed.forEach((x) => x(property, value));
  };

  return { subscribe, fireChanged };
}

function notifyOnChangeProperty(propertyName, notifier, mustChange = true) {
  let _value;

  const setValue = (value) => {
    let changed = _value !== value;
    _value = value;
    if (changed || !mustChange) fireChanged();
  };

  const setValueSilent = (value) => {
    _value = value;
  };

  const getValue = () => {
    return _value;
  };

  const fireChanged = () => {
    notifier.fireChanged(propertyName, _value);
  };

  return { setValue, setValueSilent, getValue, fireChanged };
}

function changeSubscriber() {
  const subscribeTo = (subscriptionFn, callbackFn, property, predicate) => {
    predicate = predicate || (() => true);
    subscriptionFn(_changedSubscriber(callbackFn, !property ? null : (x) => x === property && predicate()));
  };

  const _changedSubscriber = (fn, predicate) => {
    return (property, value) => {
      if (!predicate || !property || predicate(property)) {
        fn(value);
      }
    };
  };

  return { subscribeTo };
}

function Player(name, sign) {
  const _notifier = changedNotifier();
  const _scoreProperty = notifyOnChangeProperty(SCORE, _notifier);
  _scoreProperty.setValueSilent(0);

  const _historyProperty = notifyOnChangeProperty(HISTORY, _notifier);
  _historyProperty.setValueSilent([]);

  const getName = () => name;
  const getSign = () => sign;
  const addHistory = (value) => {
    const arr = _historyProperty.getValue();
    if (arr.length >= 5) {
      arr.splice(0, arr.length - 4);
    }
    arr.push(value);
    _historyProperty.fireChanged();
  };
  const clearHistory = () => {
    _historyProperty.setValueSilent([]);
    _historyProperty.fireChanged();
  };

  return {
    getName,
    getSign,
    setScore: _scoreProperty.setValue,
    getScore: _scoreProperty.getValue,
    addHistory,
    getHistory: _historyProperty.getValue,
    clearHistory,
    subscribeChanged: _notifier.subscribe,
  };
}

const gameController = (() => {
  let _length = 3;
  let _gameOver = false;
  let _winner = NONE;

  let _gameBoard = [
    [NONE, NONE, NONE],
    [NONE, NONE, NONE],
    [NONE, NONE, NONE],
  ];

  const length = () => {
    return _length;
  };

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

  return { length, signX, signO, gameBoard, winner, createGameBoard, place, reset };
})();

const displayController = (() => {
  const _changedSubscriber = changeSubscriber();
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
    _gameBoardEl.style.height = "100%";
    _gameBoardEl.innerHTML = "";
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        const cellEl = document.createElement("div");

        if (i !== length - 1) cellEl.style.borderBottom = "1px solid black";
        if (j !== length - 1) cellEl.style.borderRight = "1px solid black";
        cellEl.style.display = "flex";
        cellEl.style.justifyContent = "center";
        cellEl.style.alignItems = "center";

        cellEl.style.cursor = "pointer";
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
    if (cellEl) {
      const pEl = document.createElement("p");
      pEl.textContent = _getSignText(sign);
      cellEl.appendChild(pEl);
      const scale = (Math.min(cellEl.offsetWidth / pEl.offsetWidth, cellEl.offsetHeight / pEl.offsetHeight) * 80) / 100;
      pEl.style.scale = scale;
    }
  };

  const initPlayersBinding = (player1, player2) => {
    const playerCardTemplate = document.getElementById("player-card-template");
    const player1El = playerCardTemplate.content.cloneNode(true).querySelector(".player-card");
    const player2El = playerCardTemplate.content.cloneNode(true).querySelector(".player-card");

    const showRoundHistory = (el, history) => {
      el.querySelectorAll(".round-history>span").forEach((x) => x.remove());
      history.forEach((x) => {
        const spanEl = document.createElement("span");
        spanEl.classList.add("round-history-item", x);
        spanEl.textContent = x[0].toUpperCase();
        el.querySelector(".round-history").appendChild(spanEl);
      });
    };
    const showScore = (el, score) => (el.querySelectorAll(".player-score>h1")[1].textContent = score);

    player1El.querySelector("h1").textContent = player1.getName();
    player2El.querySelector("h1").textContent = player2.getName();

    _changedSubscriber.subscribeTo(player1.subscribeChanged, (history) => showRoundHistory(player1El, history), HISTORY);
    _changedSubscriber.subscribeTo(player1.subscribeChanged, (score) => showScore(player1El, score), SCORE);

    _changedSubscriber.subscribeTo(player2.subscribeChanged, (history) => showRoundHistory(player2El, history), HISTORY);
    _changedSubscriber.subscribeTo(player2.subscribeChanged, (score) => showScore(player2El, score), SCORE);

    const playerContainers = document.querySelectorAll(".player-container");
    playerContainers[0].appendChild(player1El);
    playerContainers[1].appendChild(player2El);
  };

  const showWinner = (winner) => {
    document.querySelector(".modal-backdrop").classList.remove("hide");
    document.querySelector(".modal-content").classList.remove("hide");
    document.querySelectorAll(".modal-content>h1")[1].textContent = winner;
  };

  const _getSignText = (sign) => {
    if (sign === X || sign === O) return sign;
    else return "";
  };

  return { initGameBoardEl, showGameBoard, showMove, setGameBoardLength, initPlayersBinding, showWinner };
})();

const interactionController = (() => {
  const _notifier = changedNotifier();
  const _lengthProperty = notifyOnChangeProperty(LENGTH, _notifier);
  const _selectedCellProperty = notifyOnChangeProperty(SELECTEDCELL, _notifier, false);

  const initFieldLengthEl = (fieldLengthContainerEl) => {
    const lengthSliderEl = fieldLengthContainerEl.querySelector(".length-slider");
    const lengthInfoEl = fieldLengthContainerEl.querySelector(".length-info");

    lengthSliderEl.addEventListener("input", (event) => (lengthInfoEl.textContent = event.target.value + " x " + event.target.value));
    lengthSliderEl.addEventListener("change", (event) => {
      _lengthProperty.setValue(event.target.value);
    });
  };

  const initGameBoardEl = (gameBoardContainerEl) => {
    gameBoardContainerEl.addEventListener("click", (event) => {
      if (event.target.dataset.row && event.target.dataset.col) {
        _selectedCellProperty.setValue({ row: event.target.dataset.row, col: event.target.dataset.col });
      }
    });
  };

  const setLength = (value) => {
    _lengthProperty.setValue(value);
  };

  const setSelectedCell = (row, col) => {
    _selectedCellProperty.setValue({ row, col });
  };

  return { initFieldLengthEl, initGameBoardEl, subscribeChanged: _notifier.subscribe, setLength, setSelectedCell };
})();

const gameManager = (() => {
  const _subscriber = changeSubscriber();
  let _gameController, _displayController, _interactionController, _player1, _player2;
  let _activePlayer = 1;

  const init = (gameController, displayController, interactionController, player1, player2) => {
    _gameController = gameController;
    _displayController = displayController;
    _interactionController = interactionController;
    _player1 = player1;
    _player2 = player2;

    _subscriber.subscribeTo(interactionController.subscribeChanged, _lengthChangedHandler, LENGTH, null);
    _subscriber.subscribeTo(interactionController.subscribeChanged, _selectedCellChangedHandler, SELECTEDCELL, null);
  };

  const _lengthChangedHandler = (length) => {
    _gameController.createGameBoard(length);
    _displayController.setGameBoardLength(length);
  };

  const _selectedCellChangedHandler = (selectedCell) => {
    const result = gameController.place(_getSign(), selectedCell.row, selectedCell.col);
    if (result.valid) {
      displayController.showMove(result.sign, result.row, result.col);
      _activePlayer = result.sign === player1.getSign() ? 2 : 1;
      if (result.winner !== NONE) {
        let winner = "";
        if (result.sign === player1.getSign()) {
          player1.addHistory(WIN);
          player2.addHistory(LOSE);
          player1.setScore(player1.getScore() + 1);
          winner = player1.getName();
        } else if (result.sign === player2.getSign()) {
          player2.addHistory(WIN);
          player1.addHistory(LOSE);
          player2.setScore(player2.getScore() + 1);
          winner = player2.getName();
        } else {
          player1.addHistory(DRAW);
          player2.addHistory(DRAW);
          winner = DRAW[0].toUpperCase() + DRAW.slice(1).toLowerCase();
        }
        _displayController.showWinner(winner);
      }
    }
  };

  const _getSign = () => {
    const result = _activePlayer === 1 ? _player1.getSign() : _player2.getSign();
    return result;
  };

  return { init };
})();

displayController.initGameBoardEl(document.querySelector(".game-board"), 3);
const player1 = Player("Player - 1", X);
const player2 = Player("Player - 2", O);
displayController.initPlayersBinding(player1, player2);

interactionController.initGameBoardEl(document.querySelector(".game-board"));
gameManager.init(gameController, displayController, interactionController, player1, player2);
