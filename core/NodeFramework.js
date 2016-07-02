module.exports = {

    setConfig: function (settings) {
        this.settings = settings;
    },

    resolveDependencies: function (key) {
        var sorted = [],
            resolved = [];

        function arrayFromKey(array, key) {
            var rval = [];
            for (var i in array) {
                rval.push(array[i][key]);
            }
            return rval;
        }

        function canResolve(library, resolved) {
            if (library.hasOwnProperty(key) && library[key].length > 0) {
                for (var i in library[key]) {
                    if (resolved.indexOf(library[key][i]) == -1) {
                        return false;
                    }
                }
            }
            return true;
        }

        while (this.settings.libs.length > 0) {
            for (var i in this.settings.libs) {
                if (canResolve(this.settings.libs[i], resolved)) {
                    sorted.push(this.settings.libs[i]);
                    this.settings.libs.splice(i, 1);
                    resolved = arrayFromKey(sorted, 'name');
                }
            }
        }

        return sorted;
    },

    getLibrary: function (libs, name) {

        for (var i in libs) {
            if(libs[i].name == name) {
                return libs[i];
            }
        }
    }
};