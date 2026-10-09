import { spawnSync } from 'node:child_process'
import { generateKeyPairSync } from 'node:crypto'
import { config } from 'dotenv'

config({ path: '.env.local', quiet: true })
if (
  process.env.NEXT_PUBLIC_DEMO_MODE !== 'true' ||
  !process.env.CONVEX_SELF_HOSTED_URL ||
  !process.env.CONVEX_SELF_HOSTED_ADMIN_KEY
) {
  console.error(
    'Set demo mode and self-hosted Convex credentials in .env.local',
  )
  process.exit(1)
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
})
const variables = {
  JWT_PRIVATE_KEY: privateKey
    .export({ type: 'pkcs8', format: 'pem' })
    .trimEnd()
    .replace(/\n/g, ' '),
  JWKS: JSON.stringify({
    keys: [{ use: 'sig', ...publicKey.export({ format: 'jwk' }) }],
  }),
  DEMO_MODE: 'true',
}
for (const [name, value] of Object.entries(variables)) {
  const result = spawnSync(
    'pnpm',
    ['exec', 'convex', 'env', 'set', name, '--', value],
    {
      encoding: 'utf8',
    },
  )
  if (result.status !== 0) {
    // CLI errors can include the key value; do not echo captured output.
    console.error(
      `Could not configure ${name}; check the backend URL and admin key`,
    )
    process.exit(1)
  }
  console.log(`Configured ${name}`)
}
