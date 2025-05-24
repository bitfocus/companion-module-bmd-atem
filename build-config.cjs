module.exports = {
	entry: {
		// atemSocketChild: './node_modules/atem-connection/dist/lib/atemSocketChild.js',
	},
	externals: [
		{
			// '@julusian/freetype2': 'commonjs @julusian/freetype2',
			// TODO: This is not good for number of files on disk, but is easy to implement
			'atem-connection': 'commonjs atem-connection',
		},
		// /^(atemSocketChild)$/i,
	],
	forceRemoveNodeGypFromPkg: true,
	prebuilds: ['@julusian/image-rs'],
}
