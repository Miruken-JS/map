(function (exports,mirukenCore,mirukenCallback) {
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var formatMetadataKey = Symbol();

var $mapFrom = mirukenCallback.$define(mirukenCore.Variance.Contravariant);

var $mapTo = mirukenCallback.$define(mirukenCore.Variance.Covariant);

function mapFrom() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return mirukenCore.decorate(mirukenCallback.addDefinition("mapFrom", $mapFrom, false, _filterFormat), args);
}

function mapTo() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
    }

    return mirukenCore.decorate(mirukenCallback.addDefinition("mapTo", $mapTo, false, _filterFormat), args);
}

var format = mirukenCore.Metadata.decorator(formatMetadataKey, function (target, key, descriptor, formats) {
    var property = mirukenCore.isDescriptor(descriptor);
    formats = mirukenCore.$flatten(property ? formats : key);
    if (formats.length === 0) {
        return;
    }
    var metadata = property ? mirukenCore.Metadata.getOrCreateOwn(formatMetadataKey, target, key, function () {
        return new Set();
    }) : mirukenCore.Metadata.getOrCreateOwn(formatMetadataKey, target.prototype, function () {
        return new Set();
    });
    formats.forEach(function (format) {
        return metadata.add(format);
    });
});

function _filterFormat(key, mapCallback) {
    var prototype = Object.getPrototypeOf(this);
    var formats = format.get(prototype, key);
    if (!formats || formats.size === 0) {
        formats = format.get(prototype);
    }
    return !formats || formats.size === 0 || [].concat(_toConsumableArray(formats)).some(function (f) {
        return mirukenCore.$equals(mapCallback.format, f);
    });
}

var mappingMetadataKey = Symbol();

var mapping = mirukenCore.Metadata.decorator(mappingMetadataKey, function (target, key, descriptor, mapping) {
    if (!$isPlainObjet(mapping)) {
        throw new TypeError("@mapping must be a simple object");
    }
    if (!mirukenCore.isDescriptor(descriptor)) {
        mapping = key;
        key = null;
    }
    mirukenCore.Metadata.define(mappingMetadataKey, mapping, target, key);
});

function root(target, key, descriptor) {
    _getOrCreateMapping(target, key).root = true;
}

function ignore(target, key, descriptor) {
    _getOrCreateMapping(target, key).ignore = true;
}

function _getOrCreateMapping(target, key) {
    return mirukenCore.Metadata.getOrCreateOwn(mappingMetadataKey, target, key, function () {
        return {};
    });
}

var _obj$1;

function _applyDecoratedDescriptor$1(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

var Mapping = mirukenCore.Protocol.extend({
    mapFrom: function mapFrom(object, format$$1, options) {},
    mapTo: function mapTo(value, format$$1, classOrInstance, options) {}
});

var Mapper = mirukenCore.StrictProtocol.extend(Mapping);

var MapCallback = mirukenCore.Base.extend({
    constructor: function constructor(format$$1, options) {
        this.extend({
            get format() {
                return format$$1;
            },

            get options() {
                return options;
            }
        });
    }
});

var MapFrom = MapCallback.extend({
    constructor: function constructor(object, format$$1, options) {
        this.base(format$$1, options);
        this.extend({
            get object() {
                return object;
            }
        });
    }
});

var MapTo = MapCallback.extend({
    constructor: function constructor(value, format$$1, classOrInstance, options) {
        this.base(format$$1, options);
        if (mirukenCore.$isNothing(classOrInstance)) {
            classOrInstance = mirukenCore.$classOf(value);
        }
        this.extend({
            get value() {
                return value;
            },

            get classOrInstance() {
                return classOrInstance;
            }
        });
    }
});

var MappingHandler = mirukenCallback.Handler.extend(Mapper, {
    mapFrom: function mapFrom$$1(object, format$$1, options) {
        if (mirukenCore.$isNothing(object)) {
            throw new TypeError("Missing object to map");
        }
        var mapFrom$$1 = new MapFrom(object, format$$1, options);
        if (mirukenCallback.$composer.handle(mapFrom$$1)) {
            return mapFrom$$1.mapping;
        }
    },
    mapTo: function mapTo$$1(value, format$$1, classOrInstance, options) {
        if (mirukenCore.$isNothing(value)) {
            throw new TypeError("Missing value to map from");
        }
        if (Array.isArray(classOrInstance)) {
            var type = classOrInstance[0];
            if (type && !mirukenCore.$isFunction(type) && !Array.isArray(type)) {
                throw new TypeError("Cannot infer array type");
            }
        } else if (Array.isArray(value) && mirukenCore.$isFunction(classOrInstance)) {
            classOrInstance = [classOrInstance];
        }
        var mapTo$$1 = new MapTo(value, format$$1, classOrInstance, options);
        if (mirukenCallback.$composer.handle(mapTo$$1)) {
            return mapTo$$1.mapping;
        }
    }
});

var AbstractMapping = mirukenCallback.Handler.extend((_obj$1 = {
    mapFrom: function mapFrom(_mapFrom, composer) {
        return mirukenCallback.$unhandled;
    },
    mapTo: function mapTo(_mapTo, composer) {},
    canSetProperty: function canSetProperty(descriptor) {
        return !mirukenCore.$isFunction(descriptor.value);
    },
    isPrimitiveValue: function isPrimitiveValue(value) {
        switch (mirukenCore.typeOf(value)) {
            case "null":
            case "number":
            case "string":
            case "boolean":
                return true;
        }
        return false;
    }
}, (_applyDecoratedDescriptor$1(_obj$1, "mapFrom", [mapFrom], Object.getOwnPropertyDescriptor(_obj$1, "mapFrom"), _obj$1), _applyDecoratedDescriptor$1(_obj$1, "mapTo", [mapTo], Object.getOwnPropertyDescriptor(_obj$1, "mapTo"), _obj$1)), _obj$1));

mirukenCallback.$handle(mirukenCallback.Handler.prototype, MapFrom, function (mapFrom$$1, composer) {
    var target = mapFrom$$1.object,
        source = mirukenCore.$classOf(target);
    if (mirukenCore.$isNothing(source)) {
        return false;
    }
    return $mapFrom.dispatch(this, mapFrom$$1, source, composer, false, function (m) {
        return mapFrom$$1.mapping = m;
    });
});

mirukenCallback.$handle(mirukenCallback.Handler.prototype, MapTo, function (mapTo$$1, composer) {
    var classOrInstance = mapTo$$1.classOrInstance,
        source = mirukenCore.$isFunction(classOrInstance) ? classOrInstance : mirukenCore.$classOf(classOrInstance);
    if (mirukenCore.$isNothing(source)) {
        return false;
    }
    return $mapTo.dispatch(this, mapTo$$1, source, composer, false, function (m) {
        return mapTo$$1.mapping = m;
    });
});

var _dec;
var _dec2;
var _dec3;
var _dec4;
var _dec5;
var _dec6;
var _obj;

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

var JsonFormat = Symbol();
var JsonContentType = "application/json";

var JsonMapping = AbstractMapping.extend(format(JsonFormat, JsonContentType), (_dec = mapFrom(Date), _dec2 = mapFrom(RegExp), _dec3 = mapFrom(Array), _dec4 = mapTo(Date), _dec5 = mapTo(RegExp), _dec6 = mapTo(Array), (_obj = {
    mapFromDate: function mapFromDate(mapFrom$$1) {
        return mapFrom$$1.object.toJSON();
    },
    mapFromRegExp: function mapFromRegExp(mapFrom$$1) {
        return mapFrom$$1.object.toString();
    },
    mapFromArray: function mapFromArray(mapFrom$$1, composer) {
        var array = mapFrom$$1.object,
            format$$1 = mapFrom$$1.format,
            options = mapFrom$$1.options,
            mapper = Mapper(composer);
        return array.map(function (elem) {
            return mapper.mapFrom(elem, format$$1, options);
        });
    },
    mapFrom: function mapFrom(_mapFrom, composer) {
        var _this = this;

        var object = _mapFrom.object;
        if (!_canMapJson(object)) {
            return;
        }
        if (this.isPrimitiveValue(object)) {
            return object && object.valueOf();
        }
        var format$$1 = _mapFrom.format,
            options = _mapFrom.options,
            spec = options && options.spec,
            raw = mirukenCore.$isPlainObject(object),
            all = !mirukenCore.$isPlainObject(spec);
        if (raw || mirukenCore.$isFunction(object.toJSON)) {
            var _json = raw ? object : object.toJSON();
            if (!all) {
                var j = {};
                for (var k in spec) {
                    j[k] = _json[k];
                }return j;
            }
            return _json;
        }
        var descriptors = mirukenCore.getPropertyDescriptors(object),
            mapper = Mapper(composer),
            json = {};
        Reflect.ownKeys(descriptors).forEach(function (key) {
            if (all || key in spec) {
                var keyValue = object[key];
                if (keyValue === undefined) {
                    return;
                }
                var map = mapping.get(object, key),
                    keySpec = all ? spec : spec[key];
                if (!(all || keySpec) || map && map.ignore) {
                    return;
                }
                var keyOptions = keySpec ? Object.create(options, {
                    spec: { value: keySpec }
                }) : options;
                if (!_canMapJson(keyValue)) {
                    return;
                }
                if (_this.isPrimitiveValue(keyValue)) {
                    json[key] = keyValue && keyValue.valueOf();
                    return;
                }
                var keyJson = mapper.mapFrom(keyValue, format$$1, keyOptions);
                if (map && map.root) {
                    Object.assign(json, keyJson);
                } else {
                    json[key] = keyJson;
                }
            }
        });
        return json;
    },
    mapToDate: function mapToDate(mapTo$$1) {
        var date = mapTo$$1.value;
        return mirukenCore.instanceOf(date, Date) ? date : Date.parse(date);
    },
    mapToRegExp: function mapToRegExp(mapTo$$1) {
        var pattern = mapTo$$1.value,
            fragments = pattern.match(/\/(.*?)\/([gimy])?$/);
        return new RegExp(fragments[1], fragments[2] || "");
    },
    mapToArray: function mapToArray(mapTo$$1, composer) {
        var array = mapTo$$1.value,
            format$$1 = mapTo$$1.format,
            options = mapTo$$1.options,
            mapper = Mapper(composer);
        var type = mapTo$$1.classOrInstance;
        type = Array.isArray(type) ? type[0] : undefined;
        return array.map(function (elem) {
            return mapper.mapTo(elem, format$$1, type, options);
        });
    },
    mapTo: function mapTo(_mapTo, composer) {
        var _this2 = this;

        var value = _mapTo.value;
        if (!_canMapJson(value)) {
            return;
        }
        if (this.isPrimitiveValue(value)) {
            return value;
        }
        var classOrInstance = _mapTo.classOrInstance;
        if (mirukenCore.$isNothing(classOrInstance)) {
            return;
        }
        var format$$1 = _mapTo.format,
            options = _mapTo.options,
            object = mirukenCore.$isFunction(classOrInstance) ? Reflect.construct(classOrInstance, mirukenCore.emptyArray) : classOrInstance;
        var dynamic = options && options.dynamic,
            ignoreCase = options && options.ignoreCase,
            mapper = Mapper(composer),
            descriptors = mirukenCore.getPropertyDescriptors(object);
        Reflect.ownKeys(descriptors).forEach(function (key) {
            var descriptor = descriptors[key];
            if (_this2.canSetProperty(descriptor)) {
                var map = mapping.get(object, key);
                if (map && map.root) {
                    object[key] = _mapFromJson(object, key, value, mapper, format$$1, options);
                }
            }
        });
        for (var key in value) {
            var descriptor = descriptors[key];
            var map = mapping.get(object, key);
            if (map && (map.root || map.ignore)) {
                continue;
            }
            var keyValue = value[key];
            if (keyValue === undefined) {
                continue;
            }
            if (descriptor) {
                if (this.canSetProperty(descriptor)) {
                    object[key] = _mapFromJson(object, key, keyValue, mapper, format$$1, options);
                }
            } else {
                var lkey = key.toLowerCase();
                var found = false;
                for (var k in descriptors) {
                    if (k.toLowerCase() === lkey) {
                        if (this.canSetProperty(descriptors[k])) {
                            object[k] = _mapFromJson(object, k, keyValue, mapper, format$$1, options);
                        }
                        found = true;
                        break;
                    }
                }
                if (!found && dynamic) {
                    object[key] = keyValue;
                }
            }
        }
        return object;
    }
}, (_applyDecoratedDescriptor(_obj, "mapFromDate", [_dec], Object.getOwnPropertyDescriptor(_obj, "mapFromDate"), _obj), _applyDecoratedDescriptor(_obj, "mapFromRegExp", [_dec2], Object.getOwnPropertyDescriptor(_obj, "mapFromRegExp"), _obj), _applyDecoratedDescriptor(_obj, "mapFromArray", [_dec3], Object.getOwnPropertyDescriptor(_obj, "mapFromArray"), _obj), _applyDecoratedDescriptor(_obj, "mapToDate", [_dec4], Object.getOwnPropertyDescriptor(_obj, "mapToDate"), _obj), _applyDecoratedDescriptor(_obj, "mapToRegExp", [_dec5], Object.getOwnPropertyDescriptor(_obj, "mapToRegExp"), _obj), _applyDecoratedDescriptor(_obj, "mapToArray", [_dec6], Object.getOwnPropertyDescriptor(_obj, "mapToArray"), _obj)), _obj)));

function _canMapJson(value) {
    return value !== undefined && !mirukenCore.$isFunction(value) && !mirukenCore.$isSymbol(value);
}

function _mapFromJson(target, key, value, mapper, format$$1, options) {
    var type = mirukenCore.design.get(target, key);
    return mapper.mapTo(value, format$$1, type, options);
}

exports.$mapFrom = $mapFrom;
exports.$mapTo = $mapTo;
exports.mapFrom = mapFrom;
exports.mapTo = mapTo;
exports.format = format;
exports.JsonFormat = JsonFormat;
exports.JsonContentType = JsonContentType;
exports.JsonMapping = JsonMapping;
exports.Mapping = Mapping;
exports.Mapper = Mapper;
exports.MapFrom = MapFrom;
exports.MapTo = MapTo;
exports.MappingHandler = MappingHandler;
exports.AbstractMapping = AbstractMapping;
exports.mapping = mapping;
exports.root = root;
exports.ignore = ignore;

}((this.mirukenMap = this.mirukenMap || {}),mirukenCore,mirukenCallback));
