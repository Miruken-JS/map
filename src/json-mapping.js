import {
    Enum, design, instanceOf, $isNothing,
    $isFunction, $isSymbol, $isPlainObject,
    getPropertyDescriptors, emptyArray
} from "miruken-core";

import { mapping } from "./map-metadata";
import { AbstractMapping } from "./abstract-mapping";
import { mapsFrom, mapsTo, format } from "./maps";

/**
 * Javascript Object Notation
 * @property {Any} JsonFormat
 */
export const JsonFormat      = Symbol("json"),
             JsonContentType = "application/json";

/**
 * Handler for performing mapping to javascript object.
 * @class JsonMapping
 * @extends AbstractMapping
 */
export const JsonMapping = AbstractMapping.extend(
    format(JsonFormat, JsonContentType), {
    @mapsFrom(Date)
    mapFromDate(mapsFrom) {
        return mapsFrom.object.toJSON();
    },
    @mapsFrom(RegExp)
    mapFromRegExp(mapsFrom) {
        return mapsFrom.object.toString();
    },
    @mapsFrom(Array)
    mapFromArray(mapsFrom, { composer }) {
        const array   = mapsFrom.object,
              format  = mapsFrom.format,
              options = mapsFrom.options;
        return array.map(elem => composer.mapFrom(elem, format, options)); 
    },
    mapsFrom(mapsFrom, { composer }) {
        const object = mapsFrom.object;
        if (!_canMapJson(object)) { return; }
        if (this.isPrimitiveValue(object)) {
            return object && object.valueOf();
        }
        const format  = mapsFrom.format,
              options = mapsFrom.options,
              spec    = options && options.spec,
              raw     = $isPlainObject(object),
              all     = !$isPlainObject(spec);              
        if (raw || $isFunction(object.toJSON)) {
            const json = raw ? object : object.toJSON();
            if (!all) {
                const j = {};
                for (let k in spec) j[k] = json[k];
                return j;
            }
            return json;
        }
        const descriptors = getPropertyDescriptors(object),
              json        = {};
        Reflect.ownKeys(descriptors).forEach(key => {
            if (all || (key in spec)) {
                let keyValue = object[key];
                if (keyValue === undefined) { return; }
                const map     = mapping.get(object, key),
                      keySpec = all ? spec : spec[key];
                if (!(all || keySpec) || (map && map.ignore)) {
                    return;
                }
                const keyOptions = keySpec ? Object.create(options, {
                    spec: { value: keySpec }
                }) : options;
                if (!_canMapJson(keyValue)) { return; }
                if (this.isPrimitiveValue(keyValue)) {
                    json[key] = keyValue && keyValue.valueOf();
                    return;
                }
                const keyJson = composer.mapFrom(keyValue, format, keyOptions);
                if (map && map.root) {
                    Object.assign(json, keyJson);
                } else {                 
                    json[key] = keyJson;
                }
            }
        });
        return json;
    },

    @mapsTo(Date)
    mapToDate(mapsTo) {
        const date = mapsTo.value;
        return instanceOf(date, Date) ? date : Date.parse(date);
    },
    @mapsTo(RegExp)
    mapToRegExp(mapsTo) {
        const pattern   = mapsTo.value,
              fragments = pattern.match(/\/(.*?)\/([gimy])?$/);              
        return new RegExp(fragments[1], fragments[2] || "")
    },
    @mapsTo(Array)
    mapToArray(mapsTo, { composer }) {
        const array   = mapsTo.value,
              format  = mapsTo.format,
              options = mapsTo.options;
        let type = mapsTo.classOrInstance;
        type = Array.isArray(type) ? type[0] : undefined;
        return array.map(elem => composer.mapTo(elem, format, type, options)); 
    },        
    mapsTo(mapsTo, { composer }) {
        const value = mapsTo.value;
        if (!_canMapJson(value)) { return; }
        const classOrInstance = mapsTo.classOrInstance;
        if (this.isPrimitiveValue(value)) {
            return classOrInstance && classOrInstance.prototype instanceof Enum
                 ? classOrInstance.fromValue(value)
                 : value;
        }
        if ($isNothing(classOrInstance)) { return; }
        const format  = mapsTo.format,
              options = mapsTo.options,
              object  = $isFunction(classOrInstance)
                      ? Reflect.construct(classOrInstance, emptyArray)
                      : classOrInstance;
        const dynamic     = options && options.dynamic,
              ignoreCase  = options && options.ignoreCase,
              descriptors = getPropertyDescriptors(object);
        Reflect.ownKeys(descriptors).forEach(key => {
            const descriptor = descriptors[key];
            if (this.canSetProperty(descriptor)) {
                const map = mapping.get(object, key);
                if (map && map.root) {
                    object[key] = _mapFromJson(object, key, value, composer, format, options);
                }
            }
        });
        for (let key in value) {
            const descriptor = descriptors[key];
            let   map        = mapping.get(object, key);
            if (map && (map.root || map.ignore)) {
                continue;  // ignore or already rooted
            }
            const keyValue = value[key];
            if (keyValue === undefined) { continue; }
            if (descriptor) {
                if (this.canSetProperty(descriptor)) {
                    object[key] = _mapFromJson(object, key, keyValue, composer, format, options);
                }
            } else {
                const lkey  = key.toLowerCase();
                let   found = false;
                for (let k in descriptors) {
                    if (k.toLowerCase() === lkey) {
                        if (this.canSetProperty(descriptors[k])) {                        
                            object[k] = _mapFromJson(object, k, keyValue, composer, format, options);
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
});

function _canMapJson(value) {
    return value !== undefined && !$isFunction(value) && !$isSymbol(value);
}

function _mapFromJson(target, key, value, composer, format, options) {
    const type = design.get(target, key);
    return composer.mapTo(value, format, type, options);
}
