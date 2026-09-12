import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
const dir = process.argv[2];
if (!dir) throw Error('Provide a private output directory outside the repository.');
await mkdir(dir, { recursive: true, mode: 0o700 });
for (const env of ['staging', 'production']) {
  const password = randomBytes(24).toString('base64url');
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  const secrets = {
    ADMIN_PASSWORD_HASH: salt + ':' + hash,
    SESSION_SECRET: randomBytes(48).toString('base64url'),
  };
  await writeFile(`${dir}/${env}-secrets.json`, JSON.stringify(secrets), {
    mode: 0o600,
    flag: 'wx',
  });
  await writeFile(
    `${dir}/${env}-admin.txt`,
    `Esadaş ${env} yönetim paneli\nGiriş: /admin/\nParola: ${password}\n\nBu dosyayı güvenli bir parola yöneticisine aktarın. Git deposuna eklemeyin.\n`,
    { mode: 0o600, flag: 'wx' },
  );
}
console.log('Private credential files created. Secret values were not printed.');
