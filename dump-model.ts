/* eslint-disable n/no-process-exit */
import * as fs from 'fs'
import Atem from 'atem-connection'
import { GetParsedModelSpec } from './src/models/index.js'

const args = process.argv.slice(2)
if (args.length < 1) {
	console.log('Usage: yarn tsx dump-model.ts <atem-ip>')
	console.log('eg: yarn tsx dump-model.ts 10.42.13.99')
	process.exit()
}

const atem = new Atem.Atem({
	address: args[0],
	port: 9910,
})
atem.on('disconnected', () => {
	console.log('disconnect')
	process.exit(1)
})

atem.on('connected', () => {
	if (!atem.state) throw new Error('No state once connected!')

	fs.writeFileSync('raw-state.json', JSON.stringify(atem.state, undefined, 4))

	const model = GetParsedModelSpec(atem.state)
	fs.writeFileSync('state.json', JSON.stringify(model, undefined, 4))
	console.log('done')
	process.exit(0)
})

atem.connect(args[0]).catch(console.error)
console.log('connecting')
