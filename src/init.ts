/*
 * init.ts
 * Created on Wed Sep 02 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
import { parseArgs, fullStringify } from './utils';
import { prompt } from 'inquirer';

interface Dictionary {
	[key: string]: string;
}

export default class {

	private name: string = '';
	private argv: Dictionary = {};

	private package: any = {
		name: this.name,
		version: '1.0.0',
		license: 'MIT',
		scripts: {
			start: 'sanilla-cli start',
			build: 'sanilla-cli build',
		},
	};
	private dependencies: string[] = [
		'@sanillajs/sanilla',
		'html-loader',
		'webpack',
		'webpack-cli',
		'webpack-dev-server',
	];
	private webpack: any = {
		rules: [],
		devServer: {},
		plugins: [
			`raw:new (require('html-webpack-plugin'))({
				title: 'Sanilla Application',
				template: process.cwd() + '/public/index.ejs',
			})`,
		],
		resolve: {
			extensions: ['.json', '.js'],
		},
	};

	constructor(args: string[]) {
		const argv = parseArgs(args);
		if ( argv.length < 1 ) {
			throw Error('Invalid Argument');
		}

		this.name = argv.shift();
		this.argv = argv;
	}

	private async babel() {
		this.dependencies.push('babel-loader');
		this.dependencies.push('@babel/core');

		this.webpack.rules.push({
			test: /\.js$/
			exclude: 'node_modules',
			use: {
				loader: 'babel-loader',
				options: {
					presets: [
						'@babel/preset-env',
					],
				},
			}
		});
	}

	private async typescript() {
		this.dependencies.push('typescript');
		this.dependencies.push('ts-loader');
		this.dependencies.push('@types/node');

		this.webpack.resolve.extensions.push('.ts');
	}

	private async router() {
		this.dependencies.push('@sanillajs/sanilla-router');
	}

	private async run() {
		let anser: any = null;

		answer = await prompt({
			type: 'checkbox',
			name: 'features',
			message: 'Select the features your project',
			choices: [
				{
					name: 'Babel',
					value: 'babel',
				},
				{
					name: 'TypeScript',
					value: 'typescript',
				},
				{
					name: 'Router',
					value: 'router',
				},
			],
		});

		for ( const feature of answer['features'] ) {
			if ( typeof this[feature] === 'function' ) {
				this[feature]();
			}
		}

	}

}
