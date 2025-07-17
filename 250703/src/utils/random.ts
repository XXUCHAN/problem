import { Mine } from "../type/type";

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function getMineCoord(x: number, y: number, mine_count: number): Mine[] {
  const mine_set = new Set<string>();
  const mines: Mine[] = [];
  while (mine_set.size < mine_count) {
    const mx = rand(0, x - 1);
    const my = rand(0, y - 1);
    const key = `${mx},${my}`;
    if (!mine_set.has(key)) {
      mine_set.add(key);
      mines.push({ x: mx, y: my });
    }
  }
  return mines;
}
