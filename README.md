# @sethwebster/ava-commit

`ava-commit` is a command-line tool that uses ChatGPT to generate git commit messages automatically. It leverages the capabilities of AI to produce informative, human-like messages. This was created as a 
fun pet project while I couldn't sleep and has proven to be really
useful in my day-to-day workflow. I hope you find it useful too!
## Description
Using AI to write your commit messages. It's like having an AI pair programmer assisting you with your commits!

## Installation

```bash
npm install @sethwebster/ava-commit
```

## Usage

```bash
ava-commit [options]
```
## Commands and Options

| Command         | Options           | Explanation                                                                                          |
|-----------------|-------------------|------------------------------------------------------------------------------------------------------|
| `update`        | None              | Checks for updates                                                                                   |
| `release-notes` | None              | Generates release notes based on what's changed since the most recent tag                            |
| `configure`     | None              | Configures the tool                                                                                  |
| `generate`      | `-a, --all`       | Generates a commit message for all commits, not just staged                                          |
|                 | `-v, --verbose`   | Generates a commit message with verbose output                                                       |
|                 | `-l, --length`    | Generates a commit message with a targeted max summary length. Default is 80 characters if not set.  |
|                 | `--all`           | Generates a commit message for all files, bypassing the check for staged files                       |
|                 | `--length`        | Generates a commit message targeting a specific max summary of characters                            |

#### Examples 

To update the tool:

```bash
ava-commit update
```

To generate release notes:

```bash
ava-commit release-notes
```

To configure the tool:

```bash
ava-commit configure
```

To generate a commit message with all defaults for staged files:

```bash
ava-commit generate
```

To generate a commit message for all commits, not just staged:

```bash
ava-commit generate --all
```

To generate a verbose commit message:

```bash
ava-commit generate --verbose
```

To generate a commit message with a targeted max summary length:

```bash
ava-commit generate --length 150
```

## Configuration

To configure ava-commit, you can use the `configure` command. This will guide you through a series of prompts to customize the tool's settings according to your needs. This flow will run automatically the first time you run the `ava-commit`.

## Recommendations
1. **Alias** -  Personally, I use an alias in my `.zshrc` of `ac` to streamline. It works well with my workflow to set the `generate --all` option on my alias as I generally don't do half-commits. Hopefully you don't miss the "[Active Time Accounting (ac)](https://man7.org/linux/man-pages/man7/man-pages.7.html)" tool too much. 🤪
2. **Workflow** - This is a general workflow suggestion but working in smaller changes leads to better results. While Ava _can_ figure out larger commit sets it gets harder the larger the set is.

## Limitations

Please be aware that ava-commit, like any AI, may not always generate perfect commit messages. It is intended to be a tool to aid with your development process, but should not be relied upon for mission-critical applications without human review.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
