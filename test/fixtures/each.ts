import fs from 'fs';
import path from 'path';

export default function each(filename: string, callback: (item: any) => void) {
  const content = fs.readFileSync(path.join(__dirname, `/${filename}`)).toString();
  const data = JSON.parse(content);
  data.forEach(callback);
}
