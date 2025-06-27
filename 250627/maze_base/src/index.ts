import fs from 'fs';
import path from 'path';

function execute() {
	const data = fs.readFileSync(path.join(__dirname, '../map/maze_10x10.txt'));
	const map = data.toString();
	const startTime = performance.now();
	const result = findPath(map);
	const duration = performance.now() - startTime;
	console.log(`Duration: ${duration} ms`);
	console.log(`Result: ${result}`);
}

function bfs(map: any, start: any, port?: string) {
	const rows = map[0].length;
	let visited = new Array(rows); // 행 생성
	for (let i = 0; i < rows; i++) {
		visited[i] = new Array(rows); // 열 생성
	}
	const queue = [[start[0], start[1], 0]];
	visited[start[0]][start[1]] = true;
	const move = [
		[0, 1],
		[0, -1],
		[1, 0],
		[-1, 0],
	];

	while (queue.length > 0) {
		const item = queue.shift();
		if (!item) {
			console.log('Empty Queue');
			continue;
		}
		const [row, col, distance] = item;

		for (const [x, y] of move) {
			const newX: number = row + y;
			const newY: number = col + x;
			const reg = /^[0-9]$/;
			if (map[row][col] === 'E') {
				console.log('find', row, col, port);
				return { distance, row, col, port: map[row][col] };
			}
			if (reg.test(map[row][col])) {
				console.log('map[row][col]');
				return { distance, row, col, port: map[row][col] };
			}
			if (
				newX >= 0 &&
				newX < rows &&
				newY >= 0 &&
				newY < rows &&
				!visited[newX][newY] &&
				!(map[newX][newY] === '#')
			) {
				visited[newX][newY] = true;
				queue.push([newX, newY, distance + 1]);
			}
		}
	}
	return { distance: -1, row: -1, col: -1, port: 'none' };
}

function findPath(map: any): string {
	let result: string = '';
	let cnt = 0;
	const maps = map.replaceAll(' ', '').replace('.S', 'S').replace('.E', 'E');
	const line = Number(maps.split('').findIndex((x: string) => x == '\n'));
	const arrayMaps = maps.replaceAll('\n', '').split('');
	let arr = new Array(line); // 행 생성
	for (let i = 0; i < line; i++) {
		arr[i] = new Array(line); // 열 생성
	}
	for (let i = 0; i < line; i++) {
		for (let j = 0; j < line; j++) {
			arr[i][j] = arrayMaps[cnt];
			cnt++;
		}
	}
	let start = [0, 0];
	let ports = undefined;
	let subMatrix = [];
	let { distance, row, col, port } = bfs(arr, start);
	let portValue = distance;

	while (true) {
		if (ports == 'E') {
			result = distance.toString();
			break;
		} else {
			subMatrix = getSubMatrix(arr, row, line, col, line);
			// subMatrix[row][col] = 'S';
			const obj = bfs(subMatrix, start);
			portValue += obj.distance;
			ports = obj.port;
		}
	}
	// console.log(result);
	return result;
}
execute();

function getSubMatrix(
	matrix: any,
	rowStart: number,
	rowEnd: number,
	colStart: number,
	colEnd: number
) {
	const subMatrix: any = [];
	for (let i = rowStart; i < rowEnd; i++) {
		subMatrix.push(matrix[i].slice(colStart, colEnd));
	}
	return subMatrix;
}
