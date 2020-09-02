#!/usr/bin/env node

import webpack from 'webpack';
import merge from 'webpack-merge';
import def from '../webpack.config.js';
import * as path from 'path';
import watch from 'node-watch';

import { copy } from './utils';
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

	private dev(args: string[]) {
		/* empty */
	}

	private build(args: string[]) {
		const compiler = webpack(def);
		compiler.run((err, stats) => {
			if ( err ) {
				console.log(err);
				return;
			}
		});
	}

	private init(args: string[]) {
		init(args);
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
