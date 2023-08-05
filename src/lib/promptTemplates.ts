import { PromptTemplate } from "langchain/prompts";

const combineSummaries = new PromptTemplate({
  inputVariables: ["summaries"],
  template: `Combine the following summaries into a single summary. 
  It should have a first line (no more than 100 chars) overall summary followed by bullets that expand on the summary. 
  
  Do not remove any important information:
  -- summaries --
  {summaries}
  
  Summary:`,
});

const summarizeDiff = new PromptTemplate({
  inputVariables: ["diff"],
  template: `Create a multi-line summary of the follwing diff. 
  
  You may have a 50 word summary on line 1, followed by more details on up to 5 lines below.

  Focus on WHY the change was made, not WHAT the change was. Use your context of the code for the WHY, not general knowledge.

  Note: lines that start with a + were added, lines that start with a - were removed. Only use the + and - lines for the substance of the summary, while using the lines around for context.
  For example, if you see adjacent + and -, with similar text or code, evaluate whether there was a change, not necessarily something added.
  -- diff --
  {diff}
  
  Summary:`,
});


const reSummarizeDiff = new PromptTemplate({
  inputVariables: ["diff", "summary", "hint"],
  template: `This is another chance for you to summarize a diff, but the user was not happy with your summary.  
  Think step-by-step and improve these summaries.

  You previously summarized the diff that follows as:

  -- user hint --
  The user provided the following suggestion to improve the summary. Use it to change your response.
  {hint}
  
  -- previous summary --
  {summary} 
  
  -- instructions -- 
  Create a multi-line summary of the follwing diff. 
  
  You may have a 50 word summary on line 1, followed by more details on up to 5 lines below.

  Focus on WHY the change was made, not WHAT the change was. Use your context of the code for the WHY, not general knowledge.

  Note: lines that start with a + were added, lines that start with a - were removed. Only use the + and - lines for the substance of the summary, while using the lines around for context.
  
  Example:
  Makes a change to the UI allowing the user to cancel running jobs
  - refactored JobsList.tsx to use the new API
  - added a new button to the UI
  - added a new API endpoint to cancel jobs


  -- diff --
  {diff}
  
  Summary:`,
});


const reSummarizeSummaries = new PromptTemplate({
  inputVariables: ["summaries", "numberOfDiffs", "maxLength","previousSummaries", "hint"],
  template: `
    -- context --
    
    The user was not happy with your previous summaries which follow. Resummarize them. Think step-by-step and improve these summaries.
    {previousSummaries}

    -- user hint --
    The user provided the following hint. Use it to refine your summary:
    {hint}

    -- instructions -- 
    
    Purpose: 
    Create more between 1 and 5 commit message summary options that combine the summaries provided. 
    Each should take a different perspective on the summary.
    
    Commit Message Format: 
    The first line MUST have no more than {maxLength} characters and be one sentence.
    The first line MUST be followed by between 3 and 10 bulleted lines expanding on the summary.
    
    Each message will stand on its own as a complete commit message. Options should NOT span multiple options, and should each include all
    important information.

    Example:
    Refactors the code to use the new API, and adds a new feature to the UI.
    - deprecates the old API, we can finall shut it down
    - Upgrades the AWS dependency
    - Adds a new feature to the UI - Users can now cancel the in progress jobs
    
    Guiding Principles:
    Prioritze added code over changes to package lock files or package.json. Don't include any diffs that are just package lock changes.
    Don't include messages about adding imports.
    
    Focus on WHY the change was made, not WHAT the change was.
    
    Output Format:
    - Output each summary separated by "\n\n---\n\n" and do NOT include a heading at all like "Option 1" or "Option 2".
    - Include ONLY the commit message and no headings.
    
    Special Note: If functionality has changed, but the version in the package.json hasn't changed, return a header above all of the options: [CHECK PACKAGE VERSION]
    
    These are summaries of {numberOfDiffs} diffs:
    -- input content --
    {summaries}
    
    -- example output --
    {maxLength} word summary 1
    - additional info line 1
    - additional info line 2
    - additional info line 3
    - additional info line 4
    - additional info line 5


    ---


    {maxLength} word summary 2
    - additional info line 1
    - additional info line 2
    - additional info line 3
    - additional info line 4
    - additional info line 5


    ---


    etc.
    -- output --      
    Output:
    {{output}}

    🤖 Generated with Ava Commit
    `
});

const summarizeSummaries = new PromptTemplate({
  inputVariables: ["summaries", "numberOfDiffs", "maxLength"],
  template: ` 
    -- instructions -- 
    Purpose: 
    Create more between 1 and 5 commit message summary options that combine the summaries provided. 
    Each should take a different perspective on the summary.
    
    Commit Message Format: 
    The first line MUST have no more than {maxLength} characters and be one sentence.
    The first line MUST be followed by between 3 and 10 bulleted lines expanding on the summary.

    Each message will stand on its own as a complete commit message. Options should NOT span multiple options, and should each include all
    important information.

    Example:
    Refactors the code to use the new API, and adds a new feature to the UI.
    - deprecates the old API, we can finall shut it down
    - Upgrades the AWS dependency
    - Adds a new feature to the UI - Users can now cancel the in progress jobs
    
    Guiding Principles:
    Prioritze added code over changes to package lock files or package.json. Don't include any diffs that are just package lock changes.
    Don't include messages about adding imports.
    
    Focus on WHY the change was made, not WHAT the change was.
    
    Output Format:
    - Output each summary separated by "\n\n---\n\n" and do NOT include a heading at all like "Option 1" or "Option 2".
    - Include ONLY the commit message and no headings.
    
    Special Note: If functionality has changed, but the version in the package.json hasn't changed, return a header above all of the options: [CHECK PACKAGE VERSION]
    
    These are summaries of {numberOfDiffs} diffs:
    -- input content --
    {summaries}
    
    -- example output --
    {maxLength} word summary 1
    - additional info line 1
    - additional info line 2
    - additional info line 3
    - additional info line 4
    - additional info line 5


    ---


    {maxLength} word summary 2
    - additional info line 1
    - additional info line 2
    - additional info line 3
    - additional info line 4
    - additional info line 5


    ---


    etc.
    -- output --      
    Output:
    {{output}}

    🤖 Generated with Ava Commit
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
    {{output}}

    🤖 Generated with Ava Commit
    `
});

export default {
  combineSummaries,
  summarizeDiff,
  reSummarizeDiff,
  summarizeSummaries,
  reSummarizeSummaries,
  releaseNotes,  
}