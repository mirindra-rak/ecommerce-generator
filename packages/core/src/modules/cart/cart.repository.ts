import { prisma } from "../../db/client";

const itemInclude = {
  variant: {
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          media: { select: { storageKey: true }, orderBy: { position: "asc" as const }, take: 1 },
        },
      },
    },
  },
} as const;

export const cartRepository = {
  findById(id: string) {
    return prisma.cart.findUnique({ where: { id }, include: { items: { include: itemInclude } } });
  },

  findBySessionToken(token: string) {
    return prisma.cart.findUnique({
      where: { sessionToken: token },
      include: { items: { include: itemInclude } },
    });
  },

  findByUserId(userId: string) {
    return prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: itemInclude } },
    });
  },

  create(data: { sessionToken?: string; userId?: string }) {
    return prisma.cart.create({
      data,
      include: { items: { include: itemInclude } },
    });
  },

  upsertItem(
    cartId: string,
    variantId: string,
    quantity: number,
    price: { priceExclTax: number; taxRateBps: number; priceInclTax: number },
  ) {
    return prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      create: { cartId, variantId, quantity, ...price },
      update: { quantity, ...price },
    });
  },

  updateItemQty(cartId: string, variantId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { cartId_variantId: { cartId, variantId } },
      data: { quantity },
    });
  },

  removeItem(cartId: string, variantId: string) {
    return prisma.cartItem.delete({
      where: { cartId_variantId: { cartId, variantId } },
    });
  },

  clearItems(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },

  deleteCart(id: string) {
    return prisma.cart.delete({ where: { id } });
  },

  async mergeAnonymousIntoUser(anonymousCartId: string, userCartId: string) {
    const anonymousItems = await prisma.cartItem.findMany({
      where: { cartId: anonymousCartId },
    });

    for (const item of anonymousItems) {
      const existing = await prisma.cartItem.findUnique({
        where: { cartId_variantId: { cartId: userCartId, variantId: item.variantId } },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCartId,
            variantId: item.variantId,
            quantity: item.quantity,
            priceExclTax: item.priceExclTax,
            taxRateBps: item.taxRateBps,
            priceInclTax: item.priceInclTax,
          },
        });
      }
    }

    await prisma.cart.delete({ where: { id: anonymousCartId } });
  },

  async getItemCount(cartId: string): Promise<number> {
    const result = await prisma.cartItem.aggregate({
      where: { cartId },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  },
};

export type CartRepository = typeof cartRepository;
