function cacheItems(items) {
    items.forEach(item => {
        cacheItem(item);
    });
}
function cacheItem(item) {
    //console.log(`About to cache the item which id is ${item.id}`);
    return idbKeyval.set(item.id, item);
}
function getCacheItem(key) {
    return idbKeyval.get(key);
}
