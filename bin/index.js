#!/usr/bin/env node
import { program } from 'commander'

import commands from '../packages/commands.js'

program.version('VmTool 1.0.0')

// 配置命令
program
	.command('config')
	.description('配置命令')
	.option('--path <path>', '配置虚拟机存储位置')
	.action(option => commands.config = option)


// 虚拟机列表
program
	.command('list')
	.description('获取虚拟机列表')
	.action(() => commands.list())

// 启动虚拟机
program
	.command('start')
	.arguments('<name>')
	.description('启动虚拟机', {
		name: '虚拟机名称'
	})
	.option('--gui', '带GUI启动')
	.action((name, option) => commands.start(name, option))


// 关闭虚拟机
program
	.command('stop')
	.arguments('<name>')
	.description('启动虚拟机', {
		name: '虚拟机名称'
	})
	.action((name) => commands.stop(name))

// 挂起虚拟机
program
	.command('suspend')
	.arguments('<name>')
	.description('挂起虚拟机', {
		name: '虚拟机名称'
	})
	.action((name) => commands.suspend(name))

// 解析用户传入的命令
program.parse(process.argv)