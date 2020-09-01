module.exports = {
	'entry': './src/index.ts',
	'mode': 'development',
	'target': 'node',
	'output': {
		'path': (process.env.SANILLA_CONTEXT_PATH || process.cwd()) + '/dist/src',
		'filename': 'index.js',
	},
	'module': {
		'rules': [
			{
				'test': /\.ts$/,
				'loader': 'ts-loader',
				'exclude': /node_modules/,
			},
			{
				'test': /\.html$/i,
				'loader': 'html-loader',
			},
			{
				'test': /\.css$/i,
				'use': ['style-loader', 'css-loader'],
			},
		],
	},
};
