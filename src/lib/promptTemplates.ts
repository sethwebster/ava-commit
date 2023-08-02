import { PromptTemplate } from "langchain/prompts";

const combineSummaries = new PromptTemplate({
  inputVariables: ["summaries"],
  template: "Combine the following summaries into a single summary. It should have a first line (no more than 100 chars) overall summary followed by bullets that expand on the summary. Do not remove any important information:\n\n{summaries}\n\nSummary:",
});

const summarizeDiff = new PromptTemplate({
  inputVariables: ["diff"],
  template: `Create a multi-line summary of the follwing diff. 
  
  You may have a 50 word summary on line 1, followed by more details on up to 5 lines below.

  Focus on WHY the change was made, not WHAT the change was. Use your context of the code for the WHY, not general knowledge.

  Note: lines that start with a + were added, lines that start with a - were removed.
  
  {diff}
  
  Summary:`,
});

const summarizeSummaries = new PromptTemplate({
  inputVariables: ["summaries", "numberOfDiffs", "maxLength"],
  template: `These are summaries of {numberOfDiffs} diffs. 
    -- instructions -- 
    
    Purpose: 
    Create 2 to 3 multi-line commit message options that combine the summaries provided. 
    
    Commit Message Format: 
    The first line with have {maxLength} characters or less for them, and no more than 10 bulleted lines will follow. 
    Each message will stand on its own as a complete commit message. Options should NOT span multiple options, and should each include all
    important information.
    
    Guiding Principles:
    Prioritze added code over changes to package lock files or package.json. Don't include any diffs that are just package lock changes.
    Don't include messages about adding imports.

    Focus on WHY the change was made, not WHAT the change was.

    Output Format:
    - Output each summary separated by "\n\n---\n\n" and do NOT include a heading at all like "Option 1" or "Option 2".
    - Include ONLY the commit message and no headings.

    Special Note: If functionality has changed, but the version in the package.json hasn't changed, return a header above all of the options: [CHECK PACKAGE VERSION]

    -- input content --
    {summaries}
    
    -- example output --
    Summary
    - additional info line 1
    - additional info line 2
    - additional info line 3
    - additional info line 4
    - additional info line 5
    -- output --      
    Output:
    `
});

const releaseNotes = new PromptTemplate({
  inputVariables: ["summaries", "numberOfDiffs", "latest"],
  template: `These are summaries of {numberOfDiffs} diffs between product releases. 
    -- instructions -- 
    
    Purpose: 
    Create awesome, exciting release notes of the change between the last release ({latest}) and now. Use GitHub flavored markdown.

    Focus on WHY the change was made, not WHAT the change was.
    
    Special Note: If functionality has changed, but the version in the package.json hasn't changed, return a header on the options: [CHECK PACKAGE VERSION]

    -- input content --
    {summaries}
    
    -- example output --
    Summary
    - additional info line 1
    - additional info line 2
    - additional info line 3
    - additional info line 4
    - additional info line 5
    ...
    -- output --      
    Output:
    `
});

export default {
  combineSummaries,
  summarizeDiff,
  summarizeSummaries,
  releaseNotes,  
}