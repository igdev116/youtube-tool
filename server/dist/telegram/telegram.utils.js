"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractGroupIdFromUrl = extractGroupIdFromUrl;
function extractGroupIdFromUrl(url) {
    if (!url)
        return null;
    const match = url.match(/k\/#([@\-\w]+)/);
    return match ? match[1] : null;
}
//# sourceMappingURL=telegram.utils.js.map