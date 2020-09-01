#!/usr/bin/env node

import webpack from 'webpack';
import merge from 'webpack-merge';
import def from '../webpack.config.js';
import * as path from 'path';

import { copy } from './utils';

/*
 * Command List
 * :dev
 * :build
 */

class SanillaTS {
	constructor(public contextPath: string) {
	}

	private dev(args: string[]) {
		/* empty */
	}

	private build(args: string[]) {
		/* empty */
		const compiler = webpack(def);
		compiler.run((err, stats) => {
			if ( err ) {
				console.log(err);
				return;
			}

			const srcPath = def.output.path.replace(this.contextPath + '/dist', '');
			const mainSrc = path.join(srcPath, def.output.filename);

			copy(
				path.resolve(this.contextPath, 'public'),
				path.resolve(this.contextPath, 'dist'),
				{
					'.html': [
						(src: string, buf: Buffer) => {
							let utf8str = buf.toString('utf8');
							utf8str = utf8str.replace(/{{\s*main\s*}}/gim, mainSrc); 
							return Buffer.from(utf8str, 'utf8');
						},
					],
					'option': {
						'ignore-dot': true,
					},
				}
			);
		});
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
const cmd = rawArgs.pop() as string;

if ( cmd ) {
	sanilla.run(cmd, rawArgs);
} else {
	console.error('Invalid Argument');
}
