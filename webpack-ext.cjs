module.exports = {
	entry: {
		//
		atemSocketChild: './node_modules/atem-connection/dist/lib/atemSocketChild.js',
	},
	externals: [
		{
			'@julusian/freetype2': 'commonjs @julusian/freetype2',
		},
		/^(atemSocketChild)$/i,
	],
}
