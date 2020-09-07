#!/usr/bin/env node

import webpack from 'webpack';
import merge from 'webpack-merge';
import path from 'path';
import fs from 'fs';

import { copy, ArgsDictionary, parseArgs } from './utils';
import init from './init';

/*
 * Command List
 * :dev
 * :build
 * :init
 */

class SanillaTS {
	constructor(public contextPath: string) {
	}

	private build(args: string[]) {
		const config = process.cwd() + '/webpack.config.js';

		if ( !fs.existsSync(config) ) {
			throw Error('Dose not exists webpack config file');
		}

		const def = require(config);
		const compiler = webpack(def);
		compiler.run((err, stats) => {
			if ( err ) {
				console.log(err);
				return;
			}
		});
	}

	private init(args: string[]) {
		const initer = new init(args);
		initer.run();
	}

	public run(command: string, args: string[]) {
		if ( typeof this[command] === 'function' ) {
			this[command](args);
		} else {
			console.error('Invalid command');
			return;
		}
	}
}

const sanilla = new SanillaTS(process.env.SANILLA_CONTEXT_PATH || process.cwd());

const rawArgs = process.argv.slice(2);
const cmd = rawArgs.shift() as string;

if ( cmd ) {
	sanilla.run(cmd, rawArgs);
} else {
	console.error('Invalid Argument');
}
