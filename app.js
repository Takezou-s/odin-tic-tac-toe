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
const NAME = "name";
const MODALCLOSED = "modalClosed";
const RESETCLICKED = "resetClicked";

const gameBoardContainerEl = document.querySelector(".game-board");

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
  const _nameProperty = notifyOnChangeProperty(NAME, _notifier);
  _nameProperty.setValueSilent(name);

  const _scoreProperty = notifyOnChangeProperty(SCORE, _notifier);
  _scoreProperty.setValueSilent(0);

  const _historyProperty = notifyOnChangeProperty(HISTORY, _notifier);
  _historyProperty.setValueSilent([]);

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
    getName: _nameProperty.getValue,
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
    row = +row;
    col = +col;
    const signCheck = sign !== X && sign !== O;
    const rowCheck = row >= _length;
    const rowCheck1 = row < 0;
    const colCheck = col >= _length;
    const colCheck1 = col < 0;
    const cellCheck = _gameBoard[row][col] !== NONE;
    if (_gameOver || signCheck || rowCheck || rowCheck1 || colCheck || colCheck1 || cellCheck) {
      console.log("Place method, length: ", _length);
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

  const init = (length, player1, player2) => {
    _initGameBoardEl(length);
    _initPlayersBinding(player1, player2);
  };

  const setGameBoardLength = (length) => {
    _gameBoardEl.style.gridTemplateColumns = `repeat(${length}, 1fr`;
    _gameBoardEl.style.gridTemplateRows = `repeat(${length}, 1fr`;
    _gameBoardEl.style.height = "100%";
    _gameBoardEl.style.gap = "16px";
    _gameBoardEl.style.padding = "16px";
    _gameBoardEl.innerHTML = "";
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        const cellEl = document.createElement("div");

        // if (i !== length - 1) cellEl.style.borderBottom = "1px solid black";
        // if (j !== length - 1) cellEl.style.borderRight = "1px solid black";
        // cellEl.style.display = "flex";
        // cellEl.style.justifyContent = "center";
        // cellEl.style.alignItems = "center";
        // cellEl.style.cursor = "pointer";

        cellEl.classList.add("sign-cell");

        cellEl.setAttribute("data-row", i.toString());
        cellEl.setAttribute("data-col", j.toString());
        _gameBoardEl.appendChild(cellEl);
      }
    }
    console.log(gameBoardContainerEl.offsetWidth);
    console.log(_gameBoardEl.offsetWidth);
    gameBoardContainerEl.style.height = `${gameBoardContainerEl.offsetWidth}px`;
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
      const offsetWidth = cellEl.offsetWidth;
      const offsetHeight = cellEl.offsetHeight;

      const pEl = document.createElement("p");
      pEl.style.fontSize = "8px";
      pEl.textContent = sign;
      cellEl.appendChild(pEl);
      const widthRatio = offsetWidth / pEl.offsetWidth;
      const heightRatio = offsetHeight / pEl.offsetHeight;
      let scale = Math.min(widthRatio, heightRatio);
      scale = scale * 0.6;
      pEl.style.scale = scale;
    }
  };

  const showWinner = (winner) => {
    document.querySelector(".modal-backdrop").classList.remove("hide");
    document.querySelector(".modal-content").classList.remove("hide");
    document.querySelectorAll(".modal-content>h1")[1].textContent = winner;
  };

  const showRound = (round) => {
    document.querySelectorAll(".settings__round>h2")[1].textContent = round;
  };

  const _initGameBoardEl = (length) => {
    _gameBoardEl = document.createElement("div");
    _gameBoardEl.style.display = "grid";

    setGameBoardLength(length);

    gameBoardContainerEl.innerHTML = "";
    gameBoardContainerEl.appendChild(_gameBoardEl);
  };

  const _initPlayersBinding = (player1, player2) => {
    const playerCardTemplate = document.getElementById("player-card-template");
    const player1El = playerCardTemplate.content.cloneNode(true).querySelector(".player-card");
    const player2El = playerCardTemplate.content.cloneNode(true).querySelector(".player-card");

    const showName = (el, name) => (el.querySelector("h1").textContent = name);
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

    _changedSubscriber.subscribeTo(player1.subscribeChanged, (name) => showName(player1El, name), NAME);
    _changedSubscriber.subscribeTo(player1.subscribeChanged, (history) => showRoundHistory(player1El, history), HISTORY);
    _changedSubscriber.subscribeTo(player1.subscribeChanged, (score) => showScore(player1El, score), SCORE);

    _changedSubscriber.subscribeTo(player2.subscribeChanged, (name) => showName(player2El, name), NAME);
    _changedSubscriber.subscribeTo(player2.subscribeChanged, (history) => showRoundHistory(player2El, history), HISTORY);
    _changedSubscriber.subscribeTo(player2.subscribeChanged, (score) => showScore(player2El, score), SCORE);

    const playerContainers = document.querySelectorAll(".player-container");
    playerContainers[0].appendChild(player1El);
    playerContainers[1].appendChild(player2El);
  };

  return { init, showGameBoard, showMove, setGameBoardLength, showWinner, showRound };
})();

const interactionController = (() => {
  const _notifier = changedNotifier();
  const _lengthProperty = notifyOnChangeProperty(LENGTH, _notifier);
  const _selectedCellProperty = notifyOnChangeProperty(SELECTEDCELL, _notifier, false);
  const _modalClosedProperty = notifyOnChangeProperty(MODALCLOSED, _notifier, false);
  const _resetClickedProperty = notifyOnChangeProperty(RESETCLICKED, _notifier, false);

  const init = () => {
    _initFieldLengthEl();
    _initGameBoardEl();
    _initModalEl();
    _initResetButton();
  };

  const _initResetButton = () => {
    document.querySelector(".settings__buttons>button").addEventListener("click", () => _resetClickedProperty.fireChanged());
  };

  const _initModalEl = () => {
    document.querySelector(".modal-backdrop").addEventListener("click", () => {
      document.querySelector(".modal-backdrop").classList.add("hide");
      document.querySelector(".modal-content").classList.add("hide");
      _modalClosedProperty.fireChanged();
    });
  };

  const _initFieldLengthEl = () => {
    const lengthSliderEl = document.querySelector(".length-slider");
    const lengthInfoEl = document.querySelector(".length-info");

    lengthSliderEl.addEventListener("input", (event) => (lengthInfoEl.textContent = event.target.value + " x " + event.target.value));
    lengthSliderEl.addEventListener("change", (event) => {
      _lengthProperty.setValue(event.target.value);
    });
  };

  const _initGameBoardEl = () => {
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

  return { init, subscribeChanged: _notifier.subscribe, setLength, setSelectedCell };
})();

const gameManager = (() => {
  const _subscriber = changeSubscriber();
  let _length = 3;
  let _player1, _player2;
  let _activePlayer = 1;
  let _round = 1;

  const init = (player1, player2) => {
    _player1 = player1;
    _player2 = player2;

    displayController.init(_length, player1, player2);
    interactionController.init();

    _subscriber.subscribeTo(interactionController.subscribeChanged, _lengthChangedHandler, LENGTH, null);
    _subscriber.subscribeTo(interactionController.subscribeChanged, _selectedCellChangedHandler, SELECTEDCELL, null);
    _subscriber.subscribeTo(interactionController.subscribeChanged, _restartGame, MODALCLOSED, null);
    _subscriber.subscribeTo(interactionController.subscribeChanged, _reset, RESETCLICKED, null);
  };

  const _lengthChangedHandler = (length) => {
    _length = length;
    gameController.createGameBoard(length);
    gameController.reset();
    displayController.setGameBoardLength(length);
  };

  const _reset = () => {
    _restartGame();
    _setRound(1);
    _player1.setScore(0);
    _player1.clearHistory();
    _player2.setScore(0);
    _player2.clearHistory();
  };

  const _restartGame = () => {
    _setRound(++_round);
    _activePlayer = 1;
    gameController.reset();
    displayController.setGameBoardLength(_length);
  };

  const _setRound = (value) => {
    _round = value;
    displayController.showRound(_round);
  };

  const _selectedCellChangedHandler = (selectedCell) => {
    const result = gameController.place(_getSign(), selectedCell.row, selectedCell.col);
    if (result.valid) {
      displayController.showMove(result.sign, result.row, result.col);
      _activePlayer = result.sign === _player1.getSign() ? 2 : 1;
      if (result.winner !== NONE) {
        let winner = "";
        if (result.winner === _player1.getSign()) {
          _player1.addHistory(WIN);
          _player2.addHistory(LOSE);
          _player1.setScore(_player1.getScore() + 1);
          winner = _player1.getName();
        } else if (result.winner === _player2.getSign()) {
          _player2.addHistory(WIN);
          _player1.addHistory(LOSE);
          _player2.setScore(_player2.getScore() + 1);
          winner = _player2.getName();
        } else {
          _player1.addHistory(DRAW);
          _player2.addHistory(DRAW);
          winner = DRAW[0].toUpperCase() + DRAW.slice(1).toLowerCase();
        }
        displayController.showWinner(winner);
      }
    }
  };

  const _getSign = () => {
    const result = _activePlayer === 1 ? _player1.getSign() : _player2.getSign();
    return result;
  };

  return { init };
})();

gameManager.init(Player("Player - 1", X), Player("Player - 2", O));
