import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { Project, ts } from 'ts-morph'
import inquirer from 'inquirer'
import { Ora } from 'ora'
import { execSync } from 'child_process'
import { delay } from '../../utils/utils'

export interface ISetupDbService {
  installPackages(packages: string[]): Promise<boolean>
  setupEnv(variables: string[]): Promise<void>
  setupDbConfig(configPath: string): Promise<void>
  setupDbModule(configPath: string): Promise<void>
  importModule({
    moduleName,
    modulePath,
  }: {
    moduleName: string
    modulePath: string
  }): Promise<void>
  setupModel(destinationPath: string, sourcePath: string): Promise<void>
}

export class SetupDbService implements ISetupDbService {
  protected spinner: Ora
  constructor(spinner: Ora) {
    this.spinner = spinner
  }
  async installPackages(packages: string[]): Promise<boolean> {
    const installPackage = await inquirer.prompt([
      {
        type: 'confirm',
        message: `Want to install packages: ${packages.join(',')}`,
        name: 'choice',
      },
    ])

    if (!installPackage.choice) return false
    try {
      this.spinner.start('Install package')
      const command = `pnpm install ${packages.join(' ')}`
      console.log(command)

      execSync(command)
      this.spinner.stop()
      console.log(chalk.green('Installed packages successfully'))
      return true
    } catch (error) {
      throw new Error(chalk.red('Error went install package: ' + error))
    }
  }

  async setupEnv(variables?: string[]): Promise<void> {
    this.spinner.start('Looking env file...\n')
    await delay(500)
    try {
      const envPath = path.join(process.cwd(), '.env')

      if (!fs.existsSync(envPath)) {
        console.log(chalk.yellow('Not found .env'))
        // If not existed, cp from .env.example
        fs.cpSync(path.join(process.cwd(), '.env.example'), envPath)
        console.log(chalk.green('Created .env'))
      }

      let content = '\n\n'

      for (const variable of variables) {
        content += variable + '=\n'
      }

      fs.appendFileSync(envPath, content)
      this.spinner.stop()
      console.log(chalk.green('Updated .env'))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when update env file: ', error)
    }
  }

  // Setup db config
  async setupDbConfig(configPath?: string): Promise<void> {
    this.spinner.start('Generate database config file ... \n')
    await delay(500)
    try {
      const content = await fs.readFile(configPath, { encoding: 'utf8' })

      const outputPath = path.join(
        process.cwd(),
        'src/config/database.config.ts',
      )
      fs.outputFileSync(outputPath, content)
      this.spinner.stop()
      console.log(chalk.green(`Updated src/config/database.config.ts`))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when read template config database file: ', error)
    }
  }

  // Set up database module
  async setupDbModule(configPath?: string): Promise<void> {
    this.spinner.start('Generate database module file ... \n')
    await delay(500)
    try {
      const modulePath = path.join(
        process.cwd(),
        'src/database/database.module.ts',
      )

      const content = fs.readFileSync(configPath, { encoding: 'utf8' })

      fs.outputFileSync(modulePath, content)
      this.spinner.stop()
      console.log(chalk.green(`Updated src/database/database.module.ts`))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when create database module: ', error)
    }
  }

  // Import module to app module
  async importModule({
    moduleName,
    modulePath,
  }: {
    moduleName?: string
    modulePath?: string
  }): Promise<void> {
    try {
      const project = new Project({
        tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      })

      const appModuleFile = project.addSourceFileAtPath(
        path.join(process.cwd(), 'src/app.module.ts'),
      )

      const decorators = appModuleFile
        ?.getClassOrThrow('AppModule')
        ?.getDecorator('Module')

      const arg = decorators.getFirstDescendantByKindOrThrow(
        ts.SyntaxKind.ObjectLiteralExpression,
      )

      const properties = arg.getProperty('imports')
      const importArray = properties.getFirstDescendantByKindOrThrow(
        ts.SyntaxKind.ArrayLiteralExpression,
      )

      // Add import syntax
      appModuleFile.addImportDeclaration({
        namedImports: [moduleName],
        moduleSpecifier: modulePath,
      })

      importArray.addElement(moduleName)
      project.saveSync()
    } catch (error) {
      throw new Error(chalk.red('Error when importing module: ' + error))
    }
  }

  async setupModel(
    destinationPath?: string,
    sourcePath?: string,
  ): Promise<void> {
    this.spinner.start(`Setting up ${destinationPath} ... \n`)
    await delay(500)
    try {
      const content = fs.readFileSync(sourcePath, { encoding: 'utf8' })
      fs.outputFileSync(path.join(process.cwd(), destinationPath), content)
      this.spinner.stop()
      console.log(chalk.green(`Updated ${destinationPath}`))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when setting up model: ', error)
    }
  }
}
