// DOM element
const table = document.querySelector('table');
const backdrop = document.querySelector('.backdrop');
const modeBtns = document.querySelector('.mode-btn-gp');
const gameInfo = document.querySelector('.game-info');
const canvas = document.querySelector('.canvas');

// data
let gameFinished = false;
let isCircle = true;
let circleMoves = [];
let crossMoves = [];
let emptyCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let onePlayerMode = true;
const cellWidth = 128;

// initiate game
modeBtns.addEventListener('click', e => {
	const target = e.target;
	if (target.dataset.mode === 'single') onePlayerMode = true;
	if (target.dataset.mode === 'dual') onePlayerMode = false;
	hideBackdrop();
	setTimeout(showGameInfo, 500);
});

table.addEventListener('click', e => {
	const target = e.target;
	if (target.tagName !== 'TD' || gameFinished) return;

	draw(target, isCircle);
	updateMoves(Number(target.dataset.index), isCircle);
	updateEmptyCells(emptyCells, Number(target.dataset.index));
	const winStreak = isCircle ? checkWinner(circleMoves) : checkWinner(crossMoves);
	// if there is a winner
	if (winStreak) {
		const winCells = [];
		winStreak.forEach(streak => {
			winCells.push(document.querySelector(`table tr td[data-index="${streak}"]`));
		});
		drawStreak(winCells);
		showGameFinishBanner(isCircle ? 'Player 1' : 'Player 2');
		gameFinished = true;
		return;
	}
	// if tie game
	if (!emptyCells.length) {
		showGameFinishBanner(false);
		gameFinished = true;
		return;
	}
	// if no winner yet
	updateGameInfo();
	changePlayer();

	// if 1 player mode, computer makes move
	if (onePlayerMode) {
		// if not computer turn, return
		if (isCircle) return;
		// if computer turn, make move
		setTimeout(() => {
			const computerMove = decideMove(emptyCells, crossMoves, circleMoves);
			computerMakeMove(computerMove);
		}, 1000);
	}
});

// functions
function draw(cell, isCircle) {
	cell.innerHTML = isCircle ? "<div class='circle'/>" : "<div class='cross'/>";
}

function changePlayer() {
	isCircle = !isCircle;
}

function updateMoves(move, isCircle) {
	isCircle ? circleMoves.push(move) : crossMoves.push(move);
}

function updateEmptyCells(data, cell) {
	const index = data.findIndex(item => item === cell);
	data.splice(index, 1);
}

function checkWinner(playerMoves) {
	const lines = [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		[1, 4, 7],
		[2, 5, 8],
		[3, 6, 9],
		[1, 5, 9],
		[3, 5, 7],
	];
	let winStreak = null;
	lines.forEach(line => {
		if (line.every(item => playerMoves.includes(item))) {
			winStreak = line;
		}
	});
	return winStreak;
}

function drawStreak(cells) {
	const streakLength = cells.length;
	const ctx = canvas.getContext('2d');
	const startCell = cells[0];
	const endCell = cells[streakLength - 1];
	const startX = startCell.offsetLeft + cellWidth / 2;
	const startY = startCell.offsetTop + cellWidth / 2;
	const endX = endCell.offsetLeft + cellWidth / 2;
	const endY = endCell.offsetTop + cellWidth / 2;
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
}

function removeStreak() {
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function showGameFinishBanner(winner) {
	const div = document.createElement('div');
	div.classList.add('banner');
	div.innerHTML = `${winner ? `<h2>${winner} has won!</h2>` : `<h2>It's a tie!</h2>`}
    <button type="button" class="btn btn-secondary reset-btn">Play Again</button>
    `;
	table.before(div);
	document.querySelector('.reset-btn').addEventListener('click', () => {
		resetGame();
	});
}

function resetGame() {
	document.querySelector('.banner').remove();
	table.querySelectorAll('td').forEach(cell => (cell.innerHTML = ''));
	gameFinished = false;
	isCircle = true;
	circleMoves = [];
	crossMoves = [];
	emptyCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	removeStreak();
	showBackdrop();
	hideGameInfo();
}

function decideMove(possibleMoves, computerMoves, opponentMoves) {
	const defendPositions = [];
	const possibleMovesLength = possibleMoves.length;
	const computerMovesCopy = Array.from(computerMoves);
	const opponentMovesCopy = Array.from(opponentMoves);
	for (let i = 0; i < possibleMovesLength; i++) {
		computerMovesCopy.push(possibleMoves[i]);
		opponentMovesCopy.push(possibleMoves[i]);
		if (checkWinner(computerMovesCopy)) {
			console.log('case1');
			return possibleMoves[i];
		} else if (checkWinner(opponentMovesCopy)) {
			defendPositions.push(possibleMoves[i]);
		}
		computerMovesCopy.pop(possibleMoves[i]);
		opponentMovesCopy.pop(possibleMoves[i]);
	}
	if (defendPositions.length) {
		console.log('case2');
		return defendPositions[0];
	} else if (possibleMoves.includes(5)) {
		console.log('case3');
		return 5;
	} else {
		console.log('case4');
		const randomIndex = Math.floor(Math.random() * possibleMovesLength);
		return possibleMoves[randomIndex];
	}
}

function computerMakeMove(cell) {
	document.querySelector(`table tr td[data-index="${cell}"]`).click();
}

function hideBackdrop() {
	backdrop.style.transform = 'translateY(-100%)';
}

function showBackdrop() {
	backdrop.style.transform = 'translateY(0%)';
}

function showGameInfo() {
	gameInfo.style.display = 'block';
	gameInfo.innerHTML = 'Next Player: O';
}

function hideGameInfo() {
	gameInfo.style.display = 'none';
}

function updateGameInfo() {
	gameInfo.innerHTML = isCircle ? 'Next Player: X' : 'Next Player: O';
}
