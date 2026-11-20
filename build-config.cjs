module.exports = {
	additionalEntrypoints: {
		// Emitted next to main.js, where the bundled atem-connection resolves it via `new URL('./atemSocketChildWorker.js', import.meta.url)`
		atemSocketChildWorker: './node_modules/atem-connection/dist/lib/atemSocketChildWorker.js',
	},
	forceRemoveNodeGypFromPkg: true,
	prebuilds: ['@julusian/image-rs', '@atem-connection/image-tools', '@julusian/freetype2'],
}
