import git from "./git.js";

export async function createReleaseNotes({}:{}) {
  await git.fetch({all:true});
  const tags = await git.tags();
  console.log(tags);
}