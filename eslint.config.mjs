import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const baseConfig = await generateEslintConfig({
	enableTypescript: true,
})

const customConfig = [
	...baseConfig,

	{
		rules: {
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			// misconfiguration of ts or something?
			'n/no-missing-import': 'off',
			// 'm/no-unpublished-import': 'off',
		},
	},

	{
		files: ['**/__tests__/**/*'],
		rules: {
			'n/no-unpublished-import': [
				'error',
				{
					allowModules: ['vitest'],
				},
			],
		},
	},
]

export default customConfig
