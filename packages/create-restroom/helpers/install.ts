import spawn from 'cross-spawn'

export function install(root: string, dependencies: string[] | null, devDependencies: boolean = false, debug: boolean = false): Promise<void> {
  const yarnFlags: string[] = []
  return new Promise((resolve, reject) => {
    let args: string[]
    let command: string = 'yarnpkg'

    if (dependencies && dependencies.length) {
      args = ['add'] //, '--exact']
      args.push('--cwd', root)
      if (devDependencies) args.push('--dev')
      args.push(...dependencies)
    } else {
      args = ['install']
    }

    args.push(...yarnFlags)

    const child = spawn(command, args, debug ? { stdio: 'inherit' } : {})

    child.on('close', (code) => {
      if (code !== 0) {
        reject({ command: `${command} ${args.join(' ')}` })
        return
      }
      resolve()
    })
  })
}
