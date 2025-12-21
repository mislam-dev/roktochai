import { Prisma } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { DB_FEATURED_TOKEN } from "../core/database/token";

@autoInjectable()
export class FeaturedService {
  constructor(
    @inject(DB_FEATURED_TOKEN)
    private readonly featured: Prisma.FeaturedDelegate
  ) {}

  async findAll() {
    const now = new Date();
    return this.featured.findMany({
      where: {
        OR: [
          {
            OR: [{ start: null }, { start: { gte: now } }],
          },
          {
            OR: [{ end: null }, { end: { lte: now } }],
          },
        ],
      },
    });
  }

  async findOne(id: string) {
    return this.featured.findUnique({
      where: { id },
    });
  }

  async create(data: { userId: string; start?: string; end?: string }) {
    return this.featured.create({
      data: {
        userId: data.userId,
        end: data.end ? new Date(data.end) : null,
        start: data.start ? new Date(data.start) : null,
      },
    });
  }

  async update(id: string, data: { start?: string; end?: string }) {
    return this.featured.update({
      where: { id },
      data: {
        end: data.end ? new Date(data.end) : null,
        start: data.start ? new Date(data.start) : null,
      },
    });
  }

  async softDelete(id: string) {
    return this.featured.update({
      where: { id },
      data: { deleteAt: new Date() },
    });
  }
}
