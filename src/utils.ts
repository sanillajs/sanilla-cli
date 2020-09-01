/*
 * utils.ts
 * Created on Tue Sep 01 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
import fs from 'fs';
import path from 'path';

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
