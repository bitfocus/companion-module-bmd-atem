const fs = require('fs')
const path = require('path')
const { Atem } = require('atem-connection')
const { GetParsedModelSpec } = require('./src/models')

const args = process.argv.slice(2)
if (args.length < 1) {
  console.log('Usage: yarn ts-node dump-model.ts <atem-ip>')
  console.log('eg: yarn ts-node dump-model.ts 10.42.13.99')
  process.exit()
}

const atem = new Atem({
  address: args[0],
  port: 9910
})
atem.on('disconnect', () => {
  console.log('disconnect')
  process.exit(1)
})

atem.on('connected', () => {
  const model = GetParsedModelSpec(atem.state)
  fs.writeFileSync('state.json', JSON.stringify(model, undefined, 4))
  console.log('done')
  process.exit(0)
})

atem.connect()
console.log('connecting')
