import { generateKeyPairSync } from 'node:crypto'

const keys = generateKeyPairSync('rsa', {
  modulusLength: 2048,
})
const privateKey = keys.privateKey.export({ type: 'pkcs8', format: 'pem' })
const publicKey = keys.publicKey.export({ format: 'jwk' })
const jwks = JSON.stringify({ keys: [{ use: 'sig', ...publicKey }] })

process.stdout.write(
  `JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, ' ')}"`,
)
process.stdout.write('\n')
process.stdout.write(`JWKS=${jwks}`)
process.stdout.write('\n')
