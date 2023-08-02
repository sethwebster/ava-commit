import Readline from 'readline';
function readline(question: string) {
  return new Promise<string>((resolve, reject) => {
    const rl = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    })
  });
}

export default {
  readline,
}