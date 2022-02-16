import * as fs from 'fs';
import * as path from 'path';

export const template = fs.readFileSync(path.join(__dirname, 'restroom.mustache'), 'utf-8');
