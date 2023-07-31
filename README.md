# ava-commit

Ava-commit is a command-line tool that uses ChatGPT to generate git commit messages automatically. It leverages the capabilities of AI to produce informative, human-like messages.

## Version
v0.0.2

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

To configure ava-commit, you can use the `--configure` option. This will guide you through a series of prompts to customize the tool's settings according to your needs.

## Limitations

Please be aware that ava-commit, like any AI, may not always generate perfect commit messages. It is intended to be a tool to aid with your development process, but should not be relied upon for mission-critical applications without human review.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
