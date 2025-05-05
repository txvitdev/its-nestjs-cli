import chalk from 'chalk'
import inquirer from 'inquirer'
import path from 'path'
import { SetupDbService } from '../services/setup/setup.service'
import ora from 'ora'
import { SetupSqlService } from '../services/setup/setup-sql.service'
import { SetupNoSqlService } from '../services/setup/setup-nosql.service'
import { delay } from '../utils/utils'

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

  const outputPath = path.join(process.cwd(), 'src', 'database')

  let setupDbService: SetupDbService

  const spinner = ora()
  setupDbService =
    dbType === 'sql'
      ? new SetupSqlService(spinner)
      : new SetupNoSqlService(spinner)

  try {
    if (await setupDbService.installPackages([])) {
      await setupDbService.setupEnv()
    }
    // await setupDbService.setupEnv([])
    // await setupDbService.setupDbConfig('')
    // await setupDbService.setupDbModule('')

    // spinner.succeed('Everything done')
  } catch (error) {
    // spinner.fail('Fail!!')
  }
}

export async function test() {
  const setup = new SetupDbService(ora())

  await setup.installPackages(['@nestjs/typeorm', 'typeorm'])
}
