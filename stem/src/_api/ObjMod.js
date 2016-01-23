
// singleton for modifying key => value pair tree

class ObjMod {

    fetch (cursor, keys) {
        let prevObj,
            lastKey;

        keys = [].concat(keys);
        while (keys.length && cursor) {
            lastKey = keys.shift();
            prevObj = cursor;
            if (cursor[lastKey] === undefined) {
                cursor[lastKey] = { };
            }
            cursor = cursor[lastKey];
        }

        return {
            obj: prevObj,
            key: lastKey
        };
    }

    set (obj, keys, value) {
        let cursor = this.fetch(obj, keys);
        // set a value
        cursor.obj[cursor.key] = value;
    }

    get (obj, keys) {
        let cursor = this.fetch(obj, keys);
        // get a value
        return cursor.obj[cursor.key];
    }

}

export default new ObjMod();