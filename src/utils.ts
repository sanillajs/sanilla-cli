/*
 * utils.ts
 * Created on Tue Sep 01 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
import fs from 'fs';
import path from 'path';

export const fullStringify = (obj: any, deep: number = 0) => {
	let rtn = '';
	const indent = '\t'.repeat(deep);
	if ( Array.isArray(obj) ) {
		rtn += '[\n';
		for ( const val of obj ) {
			rtn += indent + '\t' + fullStringify(val, deep + 1) + ',\n';
		}
		rtn += indent + ']';
	} else if ( obj && typeof obj === 'object' && Object.keys(obj).length > 0 ) {
		rtn += '{\n';
		for ( const [key, val] of Object.entries(obj) ) {
			rtn += indent + '\t' + `"${key}": ${fullStringify(val, deep + 1)},\n`;
		}
		rtn += indent + '}';
	} else {
		switch ( typeof obj ) {
			case 'object':
				if ( obj === null ) {
					rtn += 'null';
				} else {
					rtn += obj.toString();
				}
				break;
			case 'undefined':
				rtn += 'undefined';
				break;
			case 'string':
				rtn += `"${obj.replace(/\\/g, '\\\\')
								.replace(/\n/g, '\\n')
								.replace(/\t/g, '\\t')
								.replace(/\r/g, '\\r')}"`;
				break;
			default:
				rtn += obj.toString();
		}
	}

	return rtn;
}


export const copy = (src: string, dist: string, plugin: any = {}, fp?: string) => {
	if ( !fp ) {
		fp = src;
	}

	if ( plugin.option ) {
		if ( plugin.option['ignore-dot'] ) {
			if ( path.basename(src).match(/^\./) ) {
				return;
			}
		}
	}

	if ( fs.existsSync(src) ) {
		const stat = fs.lstatSync(src);
		if ( stat.isDirectory() ) {
			const dirs = fs.readdirSync(src);
			let target = src.replace(fp, '');

			if ( target ) {
				target = path.join(dist, target);
				if ( !fs.existsSync(target) ) {
					fs.mkdirSync(target);
				}
			}

			dirs.forEach((f) => {
				copy(path.join(src, f), path.join(dist, f), plugin, fp);
			});
		} else {
			let buf = fs.readFileSync(src);
			const ext = path.extname(src);
			if ( Array.isArray(plugin[ext]) ) {
				plugin[ext].forEach((func) => {
					buf = func(src, buf);
				});
			}

			fs.writeFileSync(dist, buf);
		}
	}
};

export enum ArgsType {

	HAS = 1,
	VAL = 2,

}

export interface ArgsDictionary {
	[key: string]: (string|boolean|string[]);
	remainder: string[];
}

export const parseArgs = (args: string[]) => {
	const argv: ArgsDictionary = { remainder: [] };
	const len = args.length;

	let i = 0;
	for (i=0;i < len;i++) {
		const key = args[i].replace(/^-*/, '').split('=')[0];

		if ( args[i][0] === '-' ) {
			if ( args[i][1] && args[i][1] === '-' ) {
				// --[option]

				argv[key] = args[i].replace('--' + key + '=', '');
			} else {
				// -[options]
				argv[key] = true;
			}
		} else {
			argv.remainder.push(args[i]);
		}
	}

	return argv;
};
