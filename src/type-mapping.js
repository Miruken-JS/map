import {
    isDescriptor, decorate,
    $isFunction, $isString
} from "miruken-core";

import { Handler } from "miruken-callback";
import { mapTo, format } from "./decorators";

export const TypeFormat = Symbol();

export const TypeMapping = Handler.extend(format(TypeFormat));

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
        const method  = Symbol(),
              mapping = {
                  [method] () { return type; }            
              };
        Object.defineProperty(mapping, method,
            Reflect.decorate([mapTo(typeString)], mapping, method,
                             Object.getOwnPropertyDescriptor(mapping, method)));
        TypeMapping.implement(mapping);
    }
}

