//Supposed to make LocalStorage Easier
//noinspection JSUnusedGlobalSymbols
Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
};

//noinspection JSUnusedGlobalSymbols
Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};
