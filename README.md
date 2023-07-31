# @sethwebster/ava-commit

`ava-commit` is a command-line tool that uses ChatGPT to generate git commit messages automatically. It leverages the capabilities of AI to produce informative, human-like messages. This was created as a 
fun pet project while I couldn't sleep and has proven to be really
useful in my day-to-day workflow. I hope you find it useful too!
## Description
Using AI to write your commit messages. It's like having an AI pair programmer assisting you with your commits!

## Installation

```bash
npm install ava-commit
```

## Usage

```bash
ava-commit [options]
```

### Options

| Option        | Description       | Default Value |
| :---          |    :----:   |  ---: |
| -a, --all     | Generate commit messages for all commits, not just staged. | False |
| -v, --verbose | Outputs more detailed information about the process. | False |
| -l, --length [number] | The length of the generated commit message. The tool will do its best to generate a message within this length. | 80 |
| --configure | Launches a setup process to configure the tool. |  |

#### Example 

```bash
ava-commit --all --verbose
```

## Configuration

To configure ava-commit, you can use the `--configure` option. This will guide you through a series of prompts to customize the tool's settings according to your needs. This flow will run automatically the first time you run the `ava-commit`.

## Recommendations
1. **Alias** -  Personally, I use an alias in my `.zshrc` of `ac` to streamline. It works well with my workflow to set the `--all` option on my alias as I generally don't do half-commits. Hopefully you don't miss the "[Active Time Accounting (ac)](https://man7.org/linux/man-pages/man7/man-pages.7.html)" tool too much. 🤪
2. **Workflow** - This is a general workflow suggestion but working in smaller changes leads to better results. While Ava _can_ figure out larger commit sets it gets harder the larger the set is.

## Limitations

Please be aware that ava-commit, like any AI, may not always generate perfect commit messages. It is intended to be a tool to aid with your development process, but should not be relied upon for mission-critical applications without human review.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
