#!/usr/bin/env node

import webpack from 'webpack';
import merge from 'webpack-merge';
import def from '../webpack.config.js';
import * as path from 'path';
import watch from 'node-watch';

import { copy } from './utils';
import express from 'express';
import { Application } from 'express';

/*
 * Command List
 * :dev
 * :build
 */

class SanillaTS {
	constructor(public contextPath: string) {
	}

	private dev(args: string[]) {
		const srcPath = path.join(this.contextPath, 'src');
		const distPath = path.resolve(this.contextPath, 'dist');

		const app: Application = express();
		app.use(express.static(distPath));

		const server = app.listen(8088, () => {
			console.log('8088 port listen');
		});

		const watcher = watch(srcPath, { recursive: true }, (eventType: string, filename: string|Buffer) => {
			watcher.close();
			server.close();
			this.build(args);
		});
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
