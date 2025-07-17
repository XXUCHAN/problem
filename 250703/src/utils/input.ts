export async function inputText(): Promise<string[]> {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.on("line", (line: any) => {
      resolve(line.split(" "));
      rl.close();
    });
  });
}
