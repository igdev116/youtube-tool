"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateWithCursor = paginateWithCursor;
exports.paginateWithPage = paginateWithPage;
const mongoose_1 = require("mongoose");
async function paginateWithCursor(model, query, limit, cursor, sort = { _id: 1 }) {
    const findQuery = { ...query };
    if (cursor) {
        findQuery._id = {
            ...(findQuery._id || {}),
            $gt: new mongoose_1.Types.ObjectId(cursor),
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
async function paginateWithPage(model, query, page, limit, sort = { _id: 1 }) {
    const skip = (page - 1) * limit;
    const docs = await model
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();
    const total = await model.countDocuments(query);
    const hasMore = page * limit < total;
    return {
        result: {
            content: docs,
            paging: {
                hasMore,
                total,
            },
        },
        message: '',
    };
}
//# sourceMappingURL=pagination.util.js.map