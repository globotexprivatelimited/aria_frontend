import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { join, extname } from "path";

const PUBLIC = "./public";
const BACKUP = "./public/_original";
const exts = new Set([".jpg", ".jpeg", ".png"]);

function walk(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    if (name === "_original") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files = files.concat(walk(full));
    else if (exts.has(extname(name).toLowerCase())) files.push(full);
  }
  return files;
}

const files = walk(PUBLIC);
if (!existsSync(BACKUP)) mkdirSync(BACKUP, { recursive: true });

let before = 0, after = 0;
for (const file of files) {
  const rel = file.replace(/^public[\\/]/, "").replace(/[\\/]/g, "__");
  const backupPath = join(BACKUP, rel);
  if (!existsSync(backupPath)) copyFileSync(file, backupPath);

  const origSize = statSync(file).size;
  before += origSize;

  const buf = await sharp(backupPath)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();

  await sharp(buf).toFile(file);
  const newSize = statSync(file).size;
  after += newSize;
  console.log(rel.padEnd(40), (origSize/1024).toFixed(0)+"KB", "->", (newSize/1024).toFixed(0)+"KB");
}
console.log("\nTOTAL:", (before/1024/1024).toFixed(1)+"MB", "->", (after/1024/1024).toFixed(1)+"MB");
