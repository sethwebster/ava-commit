
let chalkAnimation: { rainbow: (text: string) => void; } = { rainbow: (str) => { console.log(str) } };
import("chalk-animation").then((chalkAnimationModule) => {
  chalkAnimation = chalkAnimationModule;
}).catch(() => { });

export default chalkAnimation;