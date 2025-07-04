import { performance } from 'perf_hooks';
import { Level, Mine } from './type/type';

class Game {
	public mine: Mine[] = [];
	public mine_count: number;
	public map: string[][] = [];
	public map_x: number;
	public map_y: number;
	public level: string;
	public flag_count: number;
	public result_map: string[][] = [];
	constructor(levelData: Level) {
		this.mine_count = levelData.max_mine;
		this.map_x = levelData.size_x;
		this.map_y = levelData.size_y;
		this.mine = getMineCoord(this.map_x, this.map_y, this.mine_count);
		this.level = levelData.level;
		this.flag_count = 0;
	}
	initMap() {
		for (let i = 0; i < this.map_y; i++) {
			this.map[i] = [];
			this.result_map[i] = [];
			for (let j = 0; j < this.map_x; j++) {
				this.map[i][j] = '#';
				this.result_map[i][j] = '#';
			}
		}
		for (const m of this.mine) {
			this.result_map[m.y][m.x] = '@';
		}
	}
	travelArea(x: number, y: number) {
		const visited = new Array(this.map_y).fill(0).map(() => new Array(this.map_x).fill(false));
		const queue: { x: number; y: number }[] = [];
		queue.push({ x, y });
		visited[y][x] = true;
		while (queue.length > 0) {
			const { x, y } = queue.shift()!;
			if (this.map[y][x] !== '0') {
				continue;
			}
			const delta_x = [-1, 0, 1];
			const delta_y = [-1, 0, 1];
			for (const dx of delta_x) {
				for (const dy of delta_y) {
					const new_x = x + dx;
					const new_y = y + dy;
					if (new_x >= 0 && new_x < this.map_x && new_y >= 0 && new_y < this.map_y) {
						if (!visited[new_y][new_x]) {
							visited[new_y][new_x] = true;
							const areaCnt = this.searchSquare(new_x, new_y);
							this.map[new_y][new_x] = areaCnt;
							queue.push({
								x: new_x,
								y: new_y,
							});
						}
					}
				}
			}
		}
	}
	searchSquare(x: number, y: number): string {
		const delta_x = [-1, 0, 1];
		const delta_y = [-1, 0, 1];
		let cnt = 0;
		for (const dx of delta_x) {
			for (const dy of delta_y) {
				const new_x = x + dx;
				const new_y = y + dy;
				if (new_x >= 0 && new_x < this.map_x && new_y >= 0 && new_y < this.map_y) {
					if (this.flagChecker(new_x, new_y)) {
						cnt++;
					}
				}
			}
		}
		return cnt.toString();
	}
	mineChecker(x: number, y: number) {
		for (const m of this.mine) {
			if (m.x === x && m.y === y) {
				return true;
			}
		}
		return false;
	}
	flagChecker(x: number, y: number) {
		if (this.result_map[y][x] === '@') {
			return true;
		}
		return false;
	}
	insertInput() {
		if (this.mine_count === 0) {
			const duration = performance.now() - startTime;
			console.clear();
			console.log('Done!!');
			console.log('남은 지뢰 : ', this.mine_count);
			console.table(this.map);
			console.log(duration);
			console.log('다시 시작하기겠습니까? (y/n) : ');
			io().then((input) => {
				if (input[0] === 'y') {
					return gameStart([], this.level);
				} else if (input[0] === 'n') {
					return init();
				}
			});
		}
		io().then((input) => {
			if (input[0] === 'r' || input[0] === 'y') return gameStart([], this.level);
			else if (input[0] === 'q' || input[0] === 'n') return init();
			else if (input[0] === 'f') {
				console.log('flag', input);
				const x = Number(input[1]);
				const y = Number(input[2]);
				if (this.map[y][x] === 'f') {
					this.flag_count--;
					this.map[y][x] = '#';
				} else if (this.map[y][x] === '#') {
					this.map[y][x] = 'f';
					this.flag_count++;
					if (this.flagChecker(x, y)) this.mine_count--;
				}
				console.clear();
				console.log('남은 지뢰 : ', this.mine_count);
				console.table(this.map);
				return this.insertInput();
			} else {
				console.log('select', input);
				const x = Number(input[0]);
				const y = Number(input[1]);
				if (this.flagChecker(x, y)) {
					this.map[y][x] = '@';
					console.clear();
					console.log('Fail');
					console.log('남은 지뢰 : ', this.mine_count);
					console.table(this.map);
					console.table(this.result_map);
					const duration = performance.now() - startTime;
					console.log(duration);
					console.log('다시 시작하기겠습니까? (y/n) : ');
				} else {
					if (this.map[y][x] !== 'f') {
						const areaCnt = this.searchSquare(x, y);
						if (areaCnt === '0') {
							this.map[y][x] = areaCnt;
							this.travelArea(x, y);
							console.clear();
							console.log('남은 지뢰 : ', this.mine_count);
							console.table(this.map);
						} else {
							this.map[y][x] = areaCnt;
							console.clear();
							console.log('남은 지뢰 : ', this.mine_count);
							console.table(this.map);
						}
					}
				}
				return this.insertInput();
			}
		});
	}
}

function io(): Promise<string[]> {
	const readline = require('readline');
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return new Promise((resolve) => {
		rl.on('line', (line: any) => {
			resolve(line.split(' '));
			rl.close();
		});
	});
}

function init() {
	startTime = performance.now();
	console.log('난이도를 선택하세요 (easy, normal, hard) : ');
	io().then((input) => {
		if (input[0] !== 'easy' && input[0] !== 'normal' && input[0] !== 'hard') {
			console.log('잘못된 난이도입니다. 다시 입력해주세요.');
			return init();
		}
		gameStart(input);
	});
}
function gameStart(input: string[], level?: string) {
	startTime = performance.now();
	if (level) {
		input[0] = level;
	}
	const size_x = input[0] === 'easy' ? 9 : input[0] === 'normal' ? 16 : 30;
	const size_y = input[0] === 'easy' ? 9 : input[0] === 'normal' ? 16 : 16;
	const max_mine = input[0] === 'easy' ? 10 : input[0] === 'normal' ? 40 : 99;
	const levelData: Level = {
		level: input[0],
		size_x,
		size_y,
		max_mine,
	};
	const game = new Game(levelData);
	game.initMap();
	console.clear();
	console.table(game.map);
	console.log('남은 지뢰 : ', game.mine_count);
	const result = game.insertInput();
}
function rand(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getMineCoord(x: number, y: number, mine_count: number): Mine[] {
	const mine_set = new Set<Mine>();
	while (mine_set.size < mine_count) {
		const mine = {
			x: rand(0, x - 1),
			y: rand(0, y - 1),
		};
		mine_set.add(mine);
	}
	console.log(mine_set);
	return Array.from(mine_set);
}

let startTime = performance.now();
init();
