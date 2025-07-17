import { Level, Mine } from "./type/type";
import { getMineCoord } from "./utils/random";
import { inputText } from "./utils/input";

export class Game {
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
    this.flag_count = levelData.max_mine;
  }
  initMap() {
    for (let i = 0; i < this.map_y; i++) {
      this.map[i] = [];
      this.result_map[i] = [];
      for (let j = 0; j < this.map_x; j++) {
        this.map[i][j] = "#";
        this.result_map[i][j] = "#";
      }
    }
    for (const m of this.mine) {
      this.result_map[m.y][m.x] = "@";
    }
    this.showMap();
  }
  travelArea(x: number, y: number) {
    const visited = new Array(this.map_y).fill(0).map(() => new Array(this.map_x).fill(false));
    const queue: { x: number; y: number }[] = [];
    queue.push({ x, y });
    visited[y][x] = true;
    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      if (this.map[y][x] !== "0") {
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
  flagChecker(x: number, y: number) {
    if (this.result_map[y][x] === "@") {
      return true;
    }
    return false;
  }
  showMap() {
    console.clear();
    console.log("남은 깃발 : ", this.flag_count);
    console.log("남은 지뢰 : ", this.mine_count);
    console.table(this.map);
    console.table(this.result_map);
  }
  async insertInput(): Promise<string> {
    let status = "";
    while (true) {
      //게임 성공 - 종료
      if (this.mine_count === 0 || status === "FAIL") {
        if (this.mine_count === 0) console.log("SUCCESS");
        status = "END";
        this.showMap();
        console.log("다시 시작하시겠습니까? (y/n) : ");
      }

      const input = await inputText();
      if (input[0] === "r" || (input[0] === "y" && status === "END")) {
        // restart GAME || 게임 성공 후 같은 난이도 재시작
        status = "RESTART";
        break;
      } else if (input[0] === "q" || (input[0] === "n" && status === "END")) {
        // 초기화면
        status = "INIT";
        break;
      } else if (input[0] === "f") {
        //Flag 입력
        const x = Number(input[1]);
        const y = Number(input[2]);
        if (this.map[y][x] === "f") {
          //flag 마킹 지우기
          this.flag_count++;
          this.map[y][x] = "#";
        } else if (this.map[y][x] === "#") {
          //flag 마킹
          this.map[y][x] = "f";
          this.flag_count--;
          if (this.flagChecker(x, y)) this.mine_count--;
        }
        this.showMap();
      } else {
        //좌표 입력
        const x = Number(input[0]);
        const y = Number(input[1]);
        if (this.flagChecker(x, y)) {
          //지뢰 폭발
          this.showMap();
          console.table(this.result_map);
          status = "FAIL";
        } else {
          if (this.map[y][x] !== "f") {
            const areaCnt = this.searchSquare(x, y);
            if (areaCnt === "0") {
              this.map[y][x] = areaCnt;
              this.travelArea(x, y);
              this.showMap();
            } else {
              this.map[y][x] = areaCnt;
              this.showMap();
            }
          }
        }
      }
    }
    return status;
  }
}
