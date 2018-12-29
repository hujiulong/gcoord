import fs from 'fs';
import path from 'path';

function each(filename, callback) {
  const content = fs.readFileSync(path.join(__dirname, `/${filename}`)).toString();
  const data = JSON.parse(content);
  data.forEach(callback);
}

export default each;