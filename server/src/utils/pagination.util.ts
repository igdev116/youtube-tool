import { Types, Model, Document, FilterQuery } from 'mongoose';
import { PagingResponse } from '../types/common.type';

export async function paginateWithCursor<T extends Document>(
  model: Model<T>,
  query: FilterQuery<T>,
  limit: number,
  cursor?: string,
  sort: Record<string, 1 | -1> = { _id: 1 },
): Promise<PagingResponse<T>> {
  const findQuery: FilterQuery<T> = { ...query };
  if (cursor) {
    findQuery._id = {
      ...(findQuery._id || {}),
      $gt: new Types.ObjectId(cursor),
    };
  }
  const docs = await model
    .find(findQuery)
    .sort(sort)
    .limit(limit + 1)
    .exec();
  const hasMore = docs.length > limit;
  const content = hasMore ? docs.slice(0, limit) : docs;
  const nextCursor = hasMore
    ? String(content[content.length - 1]._id)
    : undefined;
  const total = await model.countDocuments(query);
  return {
    result: {
      content,
      paging: {
        cursor: nextCursor,
        hasMore,
        total,
      },
    },
    message: '',
  };
}
