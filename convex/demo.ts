import { createAccount } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction, internalMutation } from './_generated/server'

function requireDemo() {
  if (process.env.DEMO_MODE !== 'true') {
    throw new ConvexError('Demo setup requires DEMO_MODE=true')
  }
}

// Internal functions require the deployment admin key and are not callable by visitors.
export const seedCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    requireDemo()
    for (const table of [
      'items',
      'categories',
      'brands',
      'users',
      'orders',
    ] as const) {
      if (await ctx.db.query(table).first()) {
        throw new ConvexError('Demo setup requires an empty database')
      }
    }
    const brandId = await ctx.db.insert('brands', {
      name: 'Тепло Демо',
      slug: 'teplo-demo',
      status: 'active',
      country: 'Россия',
    })
    const categories = [
      { name: 'Котлы', slug: 'kotly', image: '/2024-12-26_235422.jpg.webp' },
      {
        name: 'Радиаторы',
        slug: 'radiatory',
        image: '/2024-12-26_235505.jpg.webp',
      },
      {
        name: 'Водонагреватели',
        slug: 'vodonagrevateli',
        image: '/2024-12-26_235840.jpg.webp',
      },
    ]
    for (const [index, category] of categories.entries()) {
      const categoryId = await ctx.db.insert('categories', {
        name: category.name,
        slug: category.slug,
        level: 0,
        order: index,
        isVisible: true,
        imagesUrl: category.image,
      })
      for (let variant = 1; variant <= 4; variant++) {
        const name = `${category.name} — демонстрационная модель ${variant}`
        const price = (index + 1) * 6000 + variant * 3500
        await ctx.db.insert('items', {
          name,
          slug: `${category.slug}-demo-${variant}`,
          sku: `DEMO-${index}-${variant}`,
          description:
            'Тестовый товар для демонстрации каталога и оформления заявки. Продажа и доставка не выполняются.',
          brandId,
          categoryId,
          status: 'active',
          price,
          oldPrice: price + 2000,
          discountAmount: 2000,
          quantity: 20,
          inStock: true,
          imagesUrl: [category.image],
          specifications: {
            powerKW: variant * 6,
            collection: `Демо ${index + 1}`,
          },
          collection: `Демо ${index + 1}`,
          ordersCount: variant,
          searchText: `${name} Тепло Демо ${category.name}`,
        })
      }
    }
    return { products: 12 }
  },
})

export const setup = internalAction({
  args: { password: v.string() },
  handler: async (
    ctx,
    { password },
  ): Promise<{ products: number; phone: string }> => {
    requireDemo()
    if (password.length < 12)
      throw new ConvexError('Use at least 12 characters')
    const catalog = await ctx.runMutation(internal.demo.seedCatalog, {})
    const phone = '80000000000'
    await createAccount(ctx, {
      provider: 'phone',
      account: { id: phone, secret: password },
      profile: {
        phone,
        email: phone,
        name: 'Демо',
        surname: 'Менеджер',
        role: 'manager',
        status: 'active',
      },
    })
    return { ...catalog, phone }
  },
})
