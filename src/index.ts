#!/usr/bin/env node
import { Command } from 'commander'
import { initialization } from './commands/init.command'

const program = new Command()

program
  .name('its-nestjs-cli')
  .description('Its nestjs cli made by Jasper aka TXV0507')
  .version('1.0.0')

program
  .command('setup', {
    isDefault: true,
  })
  .action(async () => {
    await initialization()
  })

program.parse(process.argv)
