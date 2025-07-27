import { Model, Document, FilterQuery } from 'mongoose';
import { PagingResponse, PagingResponseV2 } from '../types/common.type';
export declare function paginateWithCursor<T extends Document>(model: Model<T>, query: FilterQuery<T>, limit: number, cursor?: string, sort?: Record<string, 1 | -1>): Promise<PagingResponse<T>>;
export declare function paginateWithPage<T extends Document>(model: Model<T>, query: FilterQuery<T>, page: number, limit: number, sort?: Record<string, 1 | -1>): Promise<PagingResponseV2<T>>;
