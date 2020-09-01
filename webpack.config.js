const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const progressPath = (process.env.SANILLA_CONTEXT_PATH || process.cwd());

module.exports = {
	'entry': './src/index.ts',
	'mode': 'development',
	'target': 'node',
	'output': {
		'path': progressPath + '/dist',
		'filename': 'index.js',
	},
	'plugins': [
		new HtmlWebpackPlugin({
			template: path.join(progressPath, 'public/index.html'),
		}),
	],
	'module': {
		'rules': [
			{
				'test': /\.ts$/,
				'loader': 'ts-loader',
				'exclude': /node_modules/,
			},
			{
				'test': /\.html$/i,
				'use': [
					{
						'loader': 'html-loader',
					},
				],
			},
			{
				'test': /\.css$/i,
				'use': ['style-loader', 'css-loader'],
			},
		],
	},
};
