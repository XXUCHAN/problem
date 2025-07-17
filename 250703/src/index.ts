import { performance } from "perf_hooks";
import { Level, Mine } from "./type/type";
import { getMineCoord } from "./utils/random";
import { msToMinutesSeconds } from "./utils/format";
import { inputText } from "./utils/input";
import { Game } from "./game";

async function init() {
  let status = "";
  let levelData: Level | undefined;
  while (true) {
    console.log("Init START");
    startTime = performance.now();

    if (status !== "RESTART") {
      console.log("난이도를 선택하세요 (easy, normal, hard) : ");
      const input = await inputText();
      if (input[0] !== "easy" && input[0] !== "normal" && input[0] !== "hard") {
        console.log("잘못된 난이도입니다. 다시 입력해주세요.");
        continue;
      }
      levelData = setLevel(input);
    }
    if (!levelData) break;
    const game = new Game(levelData);
    game.initMap();
    status = await game.insertInput();
  }
}

function setLevel(input: string[]) {
  const size_x = input[0] === "easy" ? 9 : input[0] === "normal" ? 16 : 30;
  const size_y = input[0] === "easy" ? 9 : input[0] === "normal" ? 16 : 16;
  const max_mine = input[0] === "easy" ? 10 : input[0] === "normal" ? 40 : 99;
  const levelData: Level = {
    level: input[0],
    size_x,
    size_y,
    max_mine,
  };
  return levelData;
}

let startTime;
init();
