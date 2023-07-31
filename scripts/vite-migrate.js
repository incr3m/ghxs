const fs = require('fs').promises;
const arg = require('arg');
const glob = require('glob');
const chalk = require('chalk');

const defaultDirectory = './src/**/*.js';
const defaultIgnoredFiles = ['./src/**/*.?(spec|config|test|stories).js'];

/**
 * Matches any valid opening component tag <div> | <Component>
 * as well as their closing variants
 * except for JSDoc comments
 */
const validJSXFileRegex = /^[^*\n]*(<\/?[a-zA-Z]*>)[\s\w]*$/im;

/**
 * Used to organize command line arguments
 */
function parseArgs(raw) {
  const args = arg(
    {
      '--dir': String,
      '--ignore': [String],
      '--help': Boolean,
      '--silent': Boolean,
      '-d': '--dir',
      '-i': '--ignore',
      '-h': '--help',
      '-s': '--silent',
    },
    {
      argv: raw.slice(2),
    },
  );
  return {
    directory: args['--dir'] || defaultDirectory,
    ignoredFiles: args['--ignore'] || defaultIgnoredFiles,
    showUsage: args['--help'],
    silent: args['--silent'] || false,
  };
}

/**
 * Prints the usage of the file
 */
function showUsage() {
  console.log(
    chalk.yellowBright`
  Usage: node ~/path/to/transformReact -d ~/glob/of/src/files [options]\n`,
    chalk.greenBright`
    [--dir]     <'./src/**/*.js'>                   glob pattern of files to check
        -d
    [--ignore]  <'*.(spec|config|test|stories).js'> glob pattern of files to ignore
        -i
    [--silent]  <false>                             Hides the verbose logs
        -s
    [--help]                                        show this usage
        -h
  `,
  );
  process.exit(0);
}

function transformFiles() {
  const cliOptions = parseArgs(process.argv);
  if (cliOptions.showUsage) showUsage();
  const log = cliOptions.silent ? () => {} : console.log;

  glob(
    cliOptions.directory,
    // Add anything else you want to ignore here
    { ignore: cliOptions.ignoredFiles },
    async (err, matches) => {
      if (err) return;

      console.log(
        chalk.blue`Found ${matches.length} files matching the glob(s) specified`,
      );
      log(matches);

      const matchingFiles = [];
      const failedFiles = [];

      await Promise.all(
        matches.map(async path => {
          const result = await fs.readFile(path, { encoding: 'utf8' });
          if (!result) return;

          if (result.match(validJSXFileRegex)) {
            const newPath = path.concat('x'); // Add 'x' to the end to make it 'jsx'
            matchingFiles.push(path);
            log(chalk.yellow`Renaming ${path} to ${newPath}`);
            const failStatus = await fs.rename(path, newPath);
            if (failStatus) failedFiles.push(failStatus);
          }
        }),
      );

      console.log(chalk.green`Renamed ${matchingFiles.length} files successfully! ✅`);
      if (failedFiles.length > 0)
        console.log(chalk.red`We weren't able to rename ${failedFiles.length} files`);
    },
  );
}

transformFiles();
