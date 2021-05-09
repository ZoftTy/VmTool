import { spawn, spawnSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import ora from 'ora'
import chalk from 'chalk'


// Commands
class Commands {
	constructor() {
		// 配置文件路径
		this.configFilePath = join(homedir(), '.vmTool')
	}
	isVmExists() {
		existsSync()
	}

	// 异步执行命令方法
	exec(args) {
		return spawn('vmrun', args)
	}

	// 同步执行命令方法
	execSync(args) {
		return spawnSync('vmrun', args)
	}

	//获取配置
	get config() {
		// 判断配置文件是否存在
		if (!existsSync(this.configFilePath)) {
			throw {
				code: 500,
				message: '配置文件不存在'
			}
		}

		try {
			// 读取配置文件
			return JSON.parse(readFileSync(this.configFilePath))
		} catch (err) {
			// 当配置文件不是JSON格式，返回错误信息
			throw {
				code: 500,
				message: '配置文件错误',
				desc: err
			}
		}

	}

	// 添加配置
	set config(option) {
		let data = this.config

		for (const key in option) {
			if (Object.hasOwnProperty.call(option, key)) {
				data[key] = option[key]
			}
		}

		writeFileSync(this.configFilePath, JSON.stringify(data))
	}

	// 获取当前正在运行的虚拟机
	openVmList() {
		// 命令参数
		let args = ['list']

		// 运行命令获取当前正在运行的虚拟机
		let result = this.execSync(args).stdout.toString().split('\n')

		// 结果保存
		const data = []

		// 遍历结果
		result.forEach((element, index) => {
			// 过滤掉数组的第一个元素
			if (index == 0) return false

			// 过滤掉内容为空的的元素
			if (element == undefined || element == '') return

			// 处理数据
			let item = element.split('.vmwarevm/')[1].replace('.vmx', '')

			// 添加到结果数组
			data.push(item)
		})

		// 返回结果
		return data
	}

	// 列表
	list() {
		// 获取正在运行的虚拟机
		let openVmList = this.openVmList()

		// 获取虚拟机文件夹内的虚拟机
		let vmList = readdirSync(this.config.path).filter(element => {
			return element.endsWith('.vmwarevm')
		})

		// 遍历虚拟机列表
		vmList.forEach(element => {
			element = element.split('.')[0]
			// 判断虚拟机是否开启
			let isOpen = openVmList.indexOf(element) != -1

			// 判断虚拟机名称长度小于15
			if (element.length < 15) {
				// 虚拟机名称副本
				let str = element
				// 遍历增加长度到15
				for (let i = 0; i < 15 - element.length; i++) {
					str += ' '
				}
				// 赋值
				element = str
			}

			// 输出
			console.log(element, '----->', isOpen ? chalk.green('开启') : chalk.gray('关闭'))
		})
	}

	// 启动
	start(name, option) {
		// 命令参数
		let args = ['start', join(this.config.path, `${name}.vmwarevm`, `${name}.vmx`), option.gui ? 'gui' : 'nogui']
		// 指示器
		let spinner = new ora(`${name} ${chalk.blue('启动中')}`).start()
		// 运行
		let run = this.exec(args)
		// 监听结束
		run.on('exit', () => {
			spinner.succeed(`${name} ${chalk.green('启动完成')}`)
			process.exit()
		})
	}

	// 停止
	stop(name, option) {
		// 命令参数
		let args = ['stop', join(this.config.path, `${name}.vmwarevm`, `${name}.vmx`), option.hard ? 'hard' : 'soft']
		// 指示器
		let spinner = new ora(`${name} ${chalk.yellow('停止中')}`).start()
		// 运行
		let run = this.exec(args)
		// 监听结束
		run.on('exit', () => {
			spinner.succeed(`${name} ${chalk.green('已停止')}`)
			process.exit()
		})
	}

	// 挂起
	suspend(name, option) {
		// 命令参数
		let args = ['suspend', join(this.config.path, `${name}.vmwarevm`, `${name}.vmx`), option.hard ? 'hard' : 'soft']
		// 指示器
		let spinner = new ora(`${name} ${chalk.yellow('挂起中')}`).start()
		// 运行
		let run = this.exec(args)
		// 监听结束
		run.on('exit', () => {
			spinner.succeed(`${name} ${chalk.green('已挂起')}`)
			process.exit()
		})
	}

}

export default new Commands