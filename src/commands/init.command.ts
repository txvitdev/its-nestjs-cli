import chalk from 'chalk'
import inquirer from 'inquirer'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

export async function initialization() {
  console.log(
    chalk.green(
      '✨ Welcome to ITS Nestjs Project, please setup database first!!!',
    ),
  )

  const { dbType }: { dbType: 'sql' | 'nosql' } = await inquirer.prompt([
    {
      type: 'list',
      name: 'dbType',
      message: 'Choose database type: ?',
      choices: [
        {
          name: 'SQL (Postgresql)',
          value: 'sql',
        },
        {
          name: 'Nosql (MongoDB)',
          value: 'nosql',
        },
      ],
    },
  ])

  const dirname = path.dirname(fileURLToPath(import.meta.url))

  console.log(dirname)

  const outputPath = path.join(process.cwd(), 'src', 'database')

  console.log(outputPath)

  switch (dbType) {
    case 'sql':
      break
    case 'nosql':
      break
    default:
      break
  }
}
