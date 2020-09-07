/*
 * init.ts
 * Created on Wed Sep 02 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
import { parseArgs, fullStringify, ArgsDictionary } from './utils';
import { prompt } from 'inquirer';
import fs from 'fs';
import path from 'path';

enum TargetType {

	FILE = 'file',
	DIR = 'directory',

}

export default class {

	private name: string = '';
	private argv: ArgsDictionary = { remainder: [] };
	private lang: string = 'js';

	private targets: any = {
		webpack: {
			name: 'webpack.config.js',
			type: TargetType.FILE,
			prefix: 'module.exports = ',
			contents: {
				mode: 'development',
				module: {
					rules: [
						{
							test: /\.html$/,
							loader: 'html-loader',
						},
					],
				},
				devServer: {
					host: '0.0.0.0',
				},
				entry: './src/index.js',
				plugins: [
					`raw:new (require('html-webpack-plugin'))({
	title: 'Sanilla Application',
	template: process.cwd() + '/public/index.ejs',
})`,
				],
				resolve: {
					extensions: ['.json', '.js'],
				},
			},
		},
		package: {
			name: 'package.json',
			type: TargetType.FILE,
			contents: {
				name: 'SanillaApplication',
				version: '1.0.0',
				license: 'MIT',
				scripts: {
					dev: 'webpack-dev-server',
					build: 'sanilla-cli build',
				},
				dependencies: {
					'@sanillajs/sanilla': '^1.0.3',
					//'@sanillajs/sanilla-cli': '^1.0.0',
					'html-loader': '^1.3.0',
					'webpack': '^4.44.1',
					'webpack-cli': '^3.3.12',
					'webpack-dev-server': '^3.11.0',
				},
			},
		},
		public: {
			name: 'public',
			type: TargetType.DIR,
			contents: {
				index: {
					name: 'index.ejs',
					type: TargetType.FILE,
					contents: `<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title><%= htmlWebpackPlugin.options.title %></title>
	</head>
	<body>
		<div id="root"></div>
	</body>
</html>`,
				},
			},
		},
		src: {
			name: 'src',
			type: TargetType.DIR,
			contents: {
				index: {
					name: 'index.js',
					type: TargetType.FILE,
					contents: `import Sanilla from '@sanillajs/sanilla';
import app from './app.html';

Sanilla.append('#root', app);`,
				},
				app: {
					name: 'app.html',
					type: TargetType.FILE,
					contents: '<h1>Hello Sanilla</h1>',
				},
			},
		},
	};

	constructor(args: string[]) {
		 const argv = parseArgs(args);
		if ( argv.remainder.length < 1 ) {
			throw Error('Invalid Argument');
		}

		this.name = argv.remainder.shift() as string;
		this.argv = argv;
	}

	private async babel() {
		this.targets.package.contents.dependencies['babel-loader'] = '^8.1.0';
		this.targets.package.contents.dependencies['@babel/core'] = '^7.11.6';

		this.targets.webpack.contents.module.rules.push({
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [
						'@babel/preset-env',
					],
				},
			},
		});
	}

	private async typescript() {
		this.targets.package.contents.dependencies['typescript'] = '^4.0.2';
		this.targets.package.contents.dependencies['ts-loader'] = '^8.0.3';
		this.targets.package.contents.dependencies['@types/node'] = '^14.6.4';

		this.targets.webpack.contents.resolve.extensions.push('.ts');
		this.targets.webpack.contents.entry = './src/index.ts';
		this.targets.src.contents.index.name = 'index.ts';
		this.targets.webpack.contents.module.rules.push({
			"test": /\.ts$/,
			"loader": "ts-loader",
			"exclude": /node-modules/,
		});
		this.lang = 'ts';

		this.targets.tsconfig = {
			name: 'tsconfig.json',
			type: TargetType.FILE,
			contents: {
				"compilerOptions": {
					"target": "es6",
					"module": "commonjs",
					"sourceMap": true,
					"outDir": "dist",
					"strict": true,
					"noImplicitAny": false,
					"strictNullChecks": true,
					"moduleResolution": "node",
					"baseUrl": "./",
					"typeRoots": ["node_modules/@types", "src/types"],
					"allowSyntheticDefaultImports": true,
					"esModuleInterop": true,
					"skipLibCheck": true,
					"forceConsistentCasingInFileNames": true,
				},
				"include": ["src/**/*"],
				"exclude": ["node_modules"],
			},
		};
		this.targets.tslint = {
			name: 'tslint.json',
			type: TargetType.FILE,
			contents: {
				"defaultSeverity": "error",
				"extends": [
					"tslint:recommended"
				],
				"jsRules": {},
				"rules": {
					"indent": [true, "tabs", 4],
					"interface-name": false,
					"no-consecutive-blank-lines": false,
					"object-literal-sort-keys": false,
					"ordered-imports": false,
					"quotemark": [true, "single"],
					"comment-format": {
						"severity": "warning"
					},
					"no-console": false,
					"only-arrow-functions": false,
					"one-variable-per-declaration": false,
					"object-literal-shorthand": [true, {"method": "always"}],
					"semicolon": true
				},
				"rulesDirectory": []
			},
		};
		this.targets.src.contents.types = {
			name: 'types',
			type: TargetType.DIR,
			contents: {
				html: {
					name: 'html.d.ts',
					type: TargetType.FILE,
					contents: `declare module '*.html' {
	const value: string;
	export default value
}`,
				},
			},
		};
	}

	private async router() {
		this.targets.package.contents.dependencies['@sanillajs/sanilla-router'] = '^1.0.2';
		this.targets.webpack.contents.devServer.historyApiFallback = true;
		this.targets.src.contents.index.contents += `\n\nimport './router';`
		this.targets.src.contents.app.contents = `<ul>
	<li>
		<a href="" id="home">Home</a>
	</li>
	<li>
		<a href="" id="about">About</a>
	</li>
	<li>
		<a href="" id="hello">Hello</a>
	</li>
</ul>
<div id="router">
</div>
<script>
	document.querySelector('#home').addEventListener('click', (evt) => {
		console.log('click home');
		Sanilla.router.assign('/');
		evt.preventDefault();
	});
	document.querySelector('#about').addEventListener('click', (evt) => {
		console.log('click about');
		Sanilla.router.assign('/about');
		evt.preventDefault();
	});
	document.querySelector('#hello').addEventListener('click', (evt) => {
		console.log('click hello');
		Sanilla.router.assign('/hello');
		evt.preventDefault();
	});
</script>`;

		this.targets.src.contents.router = {
			name: 'router',
			type: TargetType.DIR,
			contents: {
				index: {
					name: `index.${this.lang}`,
					type: TargetType.FILE,
					contents: `import Sanilla from '@sanillajs/sanilla';
import SanillaRouter from '@sanillajs/sanilla-router';

import home from '../views/home.html';
import about from '../views/about.html';
import hello from '../views/hello.html';

Sanilla.router = new SanillaRouter('#router', {
	'/': home,
	'/about': about,
	'/hello': hello,
});`,
				},
			},
		};
		this.targets.src.contents.views = {
			name: 'views',
			type: TargetType.DIR,
			contents: {
				home: {
					name: 'home.html',
					type: TargetType.FILE,
					contents: `<h1>This is home!</h1>`,
				},
				about: {
					name: 'about.html',
					type: TargetType.FILE,
					contents: `<h1>About?</h1>`,
				},
				hello: {
					name: 'hello.html',
					type: TargetType.FILE,
					contents: `<h1>Hello World!</h1>`,
				},
			},
		};
	}

	private async build(targets: any, p: string) {
		const keys: string[] = Object.keys(targets);
		const len = keys.length;
		for ( let i=0;i < len;i++ ) {
			const name: string = keys[i];
			const pack: any = targets[name];
			const target = path.join(p, pack.name);
			if ( pack.type === TargetType.FILE ) {
				let contents = pack.prefix || '';
				switch ( typeof pack.contents ) {
					case 'object':
						contents += fullStringify(pack.contents);
						break;
					default:
						contents += pack.contents.toString();
				}
				fs.writeFileSync(target, contents, { encoding: 'utf8' });
			} else if ( pack.type === TargetType.DIR ) {
				fs.mkdirSync(target);
				this.build(pack.contents, target);
			}
		}
	}

	public async run() {
		if ( fs.existsSync(this.name) ) {
			throw Error(`Exists File or Directory [${this.name}].`);
		}
		fs.mkdirSync(this.name);
		this.targets.package.contents.name = this.name;

		let answer: any = null;
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

		this.build(this.targets, path.join(process.cwd(), this.name));
	}

}
