import fs from "fs";
import path from "path";

function execute() {
  const data = fs.readFileSync(path.join(__dirname, "../map/maze_10x10.txt"));
  const map = data.toString();
  const startTime = performance.now();
  const result = findPath(map);
  const duration = performance.now() - startTime;
  console.log(`Duration: ${duration} ms`);
  console.log(`Result: ${result}`);
}

function findPath(map: any) {
  let result: string = "";
  const maps = (map.split("\n") as string[])
    .filter((v) => !!v)
    .map((v) => v.split(" ").filter((v) => !!v));
  const N = maps[0].length;
  const M = maps.length;
  const visited = new Array(M).fill(0).map(() => new Array(N).fill(false));
  const portalMap: { [key in string]: { x: number; y: number }[] } = {};
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      if (!isNaN(Number(maps[j][i]))) {
        if (portalMap[maps[j][i]]) {
          portalMap[maps[j][i]].push({ x: i, y: j });
        } else {
          portalMap[maps[j][i]] = [{ x: i, y: j }];
        }
      }
    }
  }
  const queue: { x: number; y: number; count: number }[] = [];
  queue.push({ x: 0, y: 0, count: 0 });
  visited[0][0] = true;
  let distance = -1;
  while (queue.length > 0) {
    const { x, y, count } = queue.shift()!;
    if (maps[y][x] === ".E") {
      console.log("exit");
      distance = count;
      break;
    }
    const dx = [1, 0, -1, 0];
    const dy = [0, 1, 0, -1];
    for (let i = 0; i < 4; i++) {
      const newX = x + dx[i];
      const newY = y + dy[i];
      if (newX >= 0 && newX < N && newY >= 0 && newY < M) {
        if (visited[newY][newX] === false && maps[newY][newX] !== "#") {
          visited[newY][newX] = true;
          if (!isNaN(Number(maps[newY][newX]))) {
            const portals = portalMap[maps[newY][newX]];
            const portal = portals.find((d) => d.x !== newX && d.y !== newY)!;
            if (!visited[portal.y][portal.x]) {
              queue.push({ x: portal.x, y: portal.y, count: count + 1 });
              visited[portal.y][portal.x] = true;
            }
          } else {
            queue.push({
              x: newX,
              y: newY,
              count: count + 1,
            });
          }
        }
      }
    }
  }
  return distance === -1 ? "NO" : String(distance);
}

execute();
