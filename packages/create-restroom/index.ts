#!/usr/bin/env node

import chalk from 'chalk'
import { Command, Option } from 'commander'
import path from 'path'
import prompts from 'prompts'
import { create } from './create'
import { validateNpmName } from './helpers/validate-pkg'
import packageJson from './package.json'
import { mws } from './helpers/mws'
import { camelize } from './helpers/camelize';

let projectPath: string = ''

const program = new Command(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)
  .argument('[project-directory]')
  .usage(`${chalk.green('[project-directory]')} [options]`)
  .action((name) => {
    projectPath = name
  }).option('-d, --debug', 'Enable debug mode')
  .option('-a, --all', 'Install all middlewares')

for (const mw of mws) {
  program.addOption(new Option(`--${mw}`, `Install @restroom-mw/${mw} middleware`))
}

for (const mw of mws) {
  program.addOption(new Option(`--no-${mw}`, `Exclude @restroom-mw/${mw} middleware from installation`))
}

program
  .allowUnknownOption()
  .parse(process.argv)

async function run(): Promise<void> {
  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim()
  }

  if (!projectPath) {
    const res = await prompts({
      type: 'text',
      name: 'path',
      message: 'What is your project named?',
      initial: 'my-restroom',
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)))
        if (validation.valid) {
          return true
        }
        return '🚨 Invalid project name: ' + validation.problems![0]
      },
    })

    if (typeof res.path === 'string') {
      projectPath = res.path.trim()
    }
  }

  if (!projectPath) {
    console.log()
    console.log('⚠️ Please specify the project directory:')
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    )
    console.log()
    console.log('For example:')
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-next-app')}`)
    console.log()
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    )
    process.exit(1)
  }

  const resolvedProjectPath = path.resolve(projectPath)
  const projectName = path.basename(resolvedProjectPath)

  const { valid, problems } = validateNpmName(projectName)
  if (!valid) {
    console.error(
      `🚨 Could not create a project called ${chalk.red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    )

    problems!.forEach((p) => console.error(`    ${chalk.red.bold('*')} ${p}`))
    process.exit(1)
  }

  const options = program.opts();
  const to_install = mws.map(m => {
    if (options['all']) {
      if (options[camelize(m)] !== false) {
        return m;
      }
    } else {
      if (options[camelize(m)]) return m;
    }
  }).filter(x => !!x);

  await create({
    appPath: resolvedProjectPath,
    mws: to_install.length ? to_install : null,
    debug: program.opts().debug
  })
}

run()
  .catch(async (reason) => {
    console.log()
    console.log('🚨 Aborting installation.')
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`)
    } else {
      console.log(chalk.red('Unexpected error. Please report it as a bug:'))
      console.log(reason)
    }
    console.log()

    process.exit(1)
  })
