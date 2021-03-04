/* eslint-disable no-process-exit */
import fs = require('fs')
import { Atem } from 'atem-connection'
import { GetParsedModelSpec } from './src/models'

const args = process.argv.slice(2)
if (args.length < 1) {
	console.log('Usage: yarn ts-node dump-model.ts <atem-ip>')
	console.log('eg: yarn ts-node dump-model.ts 10.42.13.99')
	process.exit()
}

const atem = new Atem({
	address: args[0],
	port: 9910,
})
atem.on('disconnected', () => {
	console.log('disconnect')
	process.exit(1)
})

atem.on('connected', () => {
	if (!atem.state) throw new Error('No state once connected!')

	const model = GetParsedModelSpec(atem.state)
	fs.writeFileSync('state.json', JSON.stringify(model, undefined, 4))
	console.log('done')
	process.exit(0)
})

atem.connect(args[0]).catch(console.error)
console.log('connecting')
