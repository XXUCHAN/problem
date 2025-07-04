"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
class Game {
    constructor(levelData) {
        this.mine = [];
        this.map = [];
        this.result_map = [];
        this.mine_count = rand(1, levelData.max_mine);
        this.map_size = levelData.size;
        this.mine = getMineCoord(this.map_size, this.mine_count);
        this.level = levelData.level;
        this.flag_count = 0;
    }
    initMap() {
        for (let i = 0; i < this.map_size; i++) {
            this.map[i] = [];
            this.result_map[i] = [];
            for (let j = 0; j < this.map_size; j++) {
                this.map[i][j] = '#';
                this.result_map[i][j] = '#';
            }
        }
        for (const m of this.mine) {
            this.result_map[m.y][m.x] = '@';
        }
    }
    travelArea(x, y) {
        const visited = new Array(this.map_size)
            .fill(0)
            .map(() => new Array(this.map_size).fill(false));
        const queue = [];
        queue.push({ x, y });
        visited[y][x] = true;
        while (queue.length > 0) {
            const { x, y } = queue.shift();
            if (this.map[y][x] !== '0') {
                continue;
            }
            const delta_x = [-1, 0, 1];
            const delta_y = [-1, 0, 1];
            for (const dx of delta_x) {
                for (const dy of delta_y) {
                    const new_x = x + dx;
                    const new_y = y + dy;
                    if (new_x >= 0 && new_x < this.map_size && new_y >= 0 && new_y < this.map_size) {
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
    searchSquare(x, y) {
        const delta_x = [-1, 0, 1];
        const delta_y = [-1, 0, 1];
        let cnt = 0;
        for (const dx of delta_x) {
            for (const dy of delta_y) {
                const new_x = x + dx;
                const new_y = y + dy;
                if (new_x >= 0 && new_x < this.map_size && new_y >= 0 && new_y < this.map_size) {
                    if (this.flagChecker(new_x, new_y)) {
                        cnt++;
                    }
                }
            }
        }
        return cnt.toString();
    }
    mineChecker(x, y) {
        for (const m of this.mine) {
            if (m.x === x && m.y === y) {
                return true;
            }
        }
        return false;
    }
    flagChecker(x, y) {
        if (this.result_map[y][x] === '@') {
            return true;
        }
        return false;
    }
    insertInput() {
        if (this.mine_count === 0) {
            const duration = perf_hooks_1.performance.now() - startTime;
            console.clear();
            console.log('Done!!');
            console.log('남은 지뢰 : ', this.mine_count);
            console.log(this.map);
            console.log(duration);
            process.exit();
        }
        io().then((input) => {
            if (input[0] === 'r')
                return gameStart([], this.level);
            else if (input[0] === 'q')
                return init();
            else if (input[0] === 'f') {
                console.log('flag', input);
                const x = Number(input[1]);
                const y = Number(input[2]);
                if (this.map[y][x] === 'f') {
                    this.flag_count--;
                    this.map[y][x] = '#';
                }
                else if (this.map[y][x] === '#') {
                    this.map[y][x] = 'f';
                    this.flag_count++;
                    if (this.flagChecker(x, y))
                        this.mine_count--;
                }
                console.clear();
                console.log('남은 지뢰 : ', this.mine_count);
                console.log(this.map);
                return this.insertInput();
            }
            else {
                console.log('select', input);
                const x = Number(input[0]);
                const y = Number(input[1]);
                if (this.flagChecker(x, y)) {
                    this.map[y][x] = '@';
                    console.clear();
                    console.log('Fail');
                    console.log('남은 지뢰 : ', this.mine_count);
                    console.log(this.map);
                    const duration = perf_hooks_1.performance.now() - startTime;
                    console.log(duration);
                    process.exit();
                }
                else {
                    if (this.map[y][x] !== 'f') {
                        const areaCnt = this.searchSquare(x, y);
                        if (areaCnt === '0') {
                            this.map[y][x] = areaCnt;
                            this.travelArea(x, y);
                            console.clear();
                            console.log('남은 지뢰 : ', this.mine_count);
                            console.log(this.map);
                        }
                        else {
                            this.map[y][x] = areaCnt;
                            console.clear();
                            console.log('남은 지뢰 : ', this.mine_count);
                            console.log(this.map);
                        }
                    }
                }
                return this.insertInput();
            }
        });
    }
}
function io() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.on('line', (line) => {
            resolve(line.split(' '));
            rl.close();
        });
    });
}
function init() {
    console.log('난이도를 선택하세요 (easy, normal, hard) : ');
    io().then((input) => {
        if (input[0] !== 'easy' && input[0] !== 'normal' && input[0] !== 'hard') {
            console.log('잘못된 난이도입니다. 다시 입력해주세요.');
            return init();
        }
        gameStart(input);
    });
}
function gameStart(input, level) {
    if (level) {
        input[0] = level;
    }
    const size = input[0] === 'easy' ? 5 : input[0] === 'normal' ? 8 : 12;
    const levelData = {
        level: input[0],
        size: size,
        max_mine: size * size,
    };
    const game = new Game(levelData);
    game.initMap();
    console.clear();
    console.log(game.map);
    console.log('남은 지뢰 : ', game.mine_count);
    const result = game.insertInput();
}
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getMineCoord(size, mine_count) {
    const mine_set = new Set();
    while (mine_set.size < mine_count) {
        const mine = {
            x: rand(0, size - 1),
            y: rand(0, size - 1),
        };
        mine_set.add(mine);
    }
    console.log(mine_set);
    return Array.from(mine_set);
}
const startTime = perf_hooks_1.performance.now();
init();
