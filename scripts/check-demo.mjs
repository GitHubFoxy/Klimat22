import assert from 'node:assert/strict'
import { ConvexHttpClient } from 'convex/browser'
import { makeFunctionReference } from 'convex/server'
import { config } from 'dotenv'

config({ path: '.env.local', quiet: true })
assert.equal(
  process.env.NEXT_PUBLIC_DEMO_MODE,
  'true',
  'Run checks against a demo',
)
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
const fn = makeFunctionReference
assert.equal(await client.query(fn('users:getUserRole'), {}), 'guest')
await assert.rejects(client.query(fn('users:listAll'), {}), /Not authenticated/)
await assert.rejects(
  client.mutation(fn('demo:seedCatalog'), {}),
  /internal|public/i,
)
const products = await client.query(fn('main:main_page_by_filter'), {
  filter: 'Новинки',
})
assert.ok(products.items.length > 0, 'The catalog must contain demo products')

const { tokens } = await client.action(fn('auth:signIn'), {
  provider: 'phone',
  params: {
    phone: '80000000000',
    password: process.env.DEMO_PASSWORD ?? 'Klimat22-Demo-2026',
    flow: 'signIn',
  },
})
assert.ok(tokens?.token, 'Manager sign-in must return a session')
client.setAuth(tokens.token)
assert.equal(await client.query(fn('users:getUserRole'), {}), 'manager')
await assert.rejects(client.query(fn('users:listAll'), {}), /Unauthorized/)
console.log(
  'Demo checks passed: catalog, sign-in, roles, internal seed protection',
)
