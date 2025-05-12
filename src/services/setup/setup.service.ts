import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { Project, ts } from 'ts-morph'
import inquirer from 'inquirer'
import { Ora } from 'ora'
import { execSync } from 'child_process'
import editJsonFile from 'edit-json-file'
import { delay } from '../../utils/utils'

interface ISetupDbService {
  setup(): Promise<void>
}

export class SetupDbService implements ISetupDbService {
  protected spinner: Ora
  constructor(spinner: Ora) {
    this.spinner = spinner
  }

  async setup(): Promise<void> {
    if (await this.installPackages()) {
      await this.setupDbFolder()
      await this.setupDbConfig()
      await this.setupEnv()
      await this.setupScript()
      await this.setupEntityFolder()
      await this.importModule({})
      await this.setupDockerCompose()
    }
    return
  }

  protected async installPackages(packages?: string[]): Promise<boolean> {
    const installPackage = await inquirer.prompt([
      {
        type: 'confirm',
        message: `Want to install packages: ${packages.join(',')}`,
        name: 'choice',
      },
    ])

    if (!installPackage.choice) return false
    try {
      this.spinner.start('Install package: ')
      const command = `pnpm install ${packages.join(' ')}`
      execSync(command)
      this.spinner.stop()
      console.log(chalk.green('Installed packages successfully'))
      return true
    } catch (error) {
      throw new Error(chalk.red('Error went install package: ' + error))
    }
  }

  protected async setupEnv(variables?: string[]): Promise<void> {
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

  protected async setupDbFolder(sourceDir?: string): Promise<void> {
    this.spinner.start('Setup database folder...\n')
    await delay(500)
    try {
      const targetDir = path.join(process.cwd(), 'src/database')

      await this.copyAndRenameDir(sourceDir, targetDir, true)
      this.spinner.stop()
      console.log(chalk.green('Updated ./src/database folder'))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when update database folder: ', error)
    }
  }

  protected async setupScript(scripts?: Record<string, string>): Promise<void> {
    try {
      if (scripts) {
        const file = editJsonFile(path.join(process.cwd(), 'package.json'))
        for (const [key, value] of Object.entries(scripts)) {
          file.set(`scripts.${key}`, value)
        }
        file.save()
      }
    } catch (error) {
      console.error('Error when setting up script: ', error)
    }
  }

  protected async setupDbConfig(configPath?: string): Promise<void> {
    this.spinner.start('Updating database.config.ts file...\n')
    await delay(500)
    try {
      const targetPath = path.join(
        process.cwd(),
        'src/config/database.config.ts',
      )

      const content = fs.readFileSync(configPath, { encoding: 'utf8' })

      fs.outputFileSync(targetPath, content)
      this.spinner.stop()
      console.log(chalk.green('Updated ./src/config/database.config.ts'))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when updating database config file: ', error)
    }
  }

  // Import module to app module
  protected async importModule({
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

  protected async setupEntityFolder(
    destinationDir?: string,
    sourceDir?: string,
  ): Promise<void> {
    this.spinner.start(`Setting up user folder ... \n`)
    await delay(500)
    try {
      const targetDir = path.join(process.cwd(), destinationDir)

      await this.copyAndRenameDir(sourceDir, targetDir)
      this.spinner.stop()
      console.log(chalk.green(`Updated ${destinationDir} folder`))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when setting up model: ', error)
    }
  }

  protected async setupDockerCompose(sourceDir?: string): Promise<void> {
    this.spinner.start('Setting up docker-compose file...\n')
    await delay(500)
    try {
      const dockerFiles = fs.readdirSync(sourceDir)

      for (const file of dockerFiles) {
        const sourcePath = path.join(sourceDir, file)
        const targetPath = path.join(process.cwd(), file)

        if (fs.existsSync(targetPath)) {
          console.error(chalk.red(`File ${targetPath} existed!!`))
          process.exit(1)
        }
        fs.copyFileSync(sourcePath, targetPath)
      }
      this.spinner.stop()
      console.log(
        chalk.green(
          'Updated ./docker-compose.local.yml and docker-compose.standalone.yml files',
        ),
      )
    } catch (error) {
      this.spinner.stop()
      console.error('Error when updating docker-compose file: ', error)
    }
  }

  private async copyAndRenameDir(
    sourceDir: string,
    targetDir: string,
    checkExisted = false,
  ) {
    try {
      if (checkExisted && (await fs.pathExists(targetDir))) {
        console.error(chalk.red(`Folder ${targetDir} existed!!`))
        process.exit(1)
      }

      await fs.copy(sourceDir, targetDir)

      // Remove .template extension from all files in the folder
      const renameExtensions = async (dir) => {
        const entries = await fs.readdir(dir)
        for (const entry of entries) {
          const fullPath = path.join(dir, entry)
          const stats = await fs.stat(fullPath)
          if (stats.isDirectory()) {
            await renameExtensions(fullPath)
          } else if (entry.endsWith('.template')) {
            const newName = entry.replace(/\.template$/, '')
            await fs.rename(fullPath, path.join(dir, newName))
          }
        }
      }
      await renameExtensions(targetDir)
    } catch (error) {
      throw error
    }
  }
}
