import {
    isDescriptor, decorate, $isFunction, $isString
} from "miruken-core";

import { Handler } from "miruken-callback";
import { mapsTo, format } from "./maps";

export const TypeFormat = Symbol("type");

export const TypeMapping = Handler.extend(format(TypeFormat));

Handler.implement({
    getTypeFromString(typeString) {
        if (!$isString(typeString)) {
            throw new Error(`Invalid type string '${typeString}'`);
        }
        const stripped = typeString.replace(/\s+/g, '');
        return this.mapTo(stripped, TypeFormat);
    }
});

export function registerType(target, key, descriptor) {
    if (isDescriptor(descriptor)) {
        throw new SyntaxError("@registerType can only be applied to a class");
    }
    const targetExtend = target.extend;
    if ($isFunction(targetExtend)) {
        target.extend = function () {
            const derived = targetExtend.apply(this, arguments);
            addTypeMapping(derived);
            return derived;
        };
    }
    addTypeMapping(target);    
    return target;
}

function addTypeMapping(type) {
    const typeString = type.prototype.$type;
    if ($isString(typeString)) {
        const stripped = typeString.replace(/\s+/g, ''),
              method   = Symbol(),
              mapping  = {
                  [method] () { return type; }            
              };
        Object.defineProperty(mapping, method,
            Reflect.decorate([mapsTo(stripped)], mapping, method,
                             Object.getOwnPropertyDescriptor(mapping, method)));
        TypeMapping.implement(mapping);
    }
}

