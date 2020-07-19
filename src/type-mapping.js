import {
    Enum, decorate, $isNothing,
    $isFunction, $isString
} from "miruken-core";

import { Handler } from "miruken-callback";
import { mapsTo, format } from "./maps";
import { mapping } from  "./mapping";

export const TypeIdFormat = Symbol("type");

@format(TypeIdFormat)
export class TypeMapping extends Handler {}

const TypeIdResolver = Symbol("type-id");

export const TypeIdHandling = Enum({
    None:   0,  // Never
    Always: 1,  // Always
    Auto  : 2   // Include as needed
});

export function typeId(...args) {
    return decorate((target, key, descriptor, args) => {
        if ($isNothing(descriptor)) {
            const [id = target.name, property] = args,
                  strippedId = id.replace(/\s+/g, '');          
            if (id === "_class") {
                throw new Error("The type id cannot be inferred from a base2 class.  Please specify it explicitly.");
            }
            if (!$isNothing(property)) {
                const options = mapping.getOrCreateOwn(target, () => ({}));
                options.typeIdProperty = property;
            }
            Object.defineProperty(target, TypeIdResolver, {
                configurable: false,
                enumerable:   false,
                value:        strippedId
            });
            Object.defineProperty(target.prototype, TypeIdResolver, {
                configurable: false,
                enumerable:   false,
                value:        strippedId
            });
            addTypeMapping(target, strippedId);
        } else {
            const { get } = descriptor;
            if (!$isFunction(get)) {
                throw new SyntaxError("@typeId can only be applied to classes or properties.");
            }
            const [property] = args,
                  options    = mapping.getOrCreateOwn(target, () => ({}));
            options.ignore = true;
            if (!$isNothing(property)) {
                options.typeIdProperty = property;
            }
            Object.defineProperty(target, TypeIdResolver, {
                configurable: false,
                enumerable:   false,
                get:          function () { return this[key]; }
            });
        }
    }, args);
}

export function getTypeId(target) {
    return target?.[TypeIdResolver];
}

Handler.implement({
    getTypeFromId(typeId) {
        if (!$isString(typeId)) {
            throw new Error(`Invalid type id '${typeId}'.`);
        }
        const stripped = typeId.replace(/\s+/g, '');
        return this.mapTo(stripped, TypeIdFormat);
    }
});

function addTypeMapping(type, id) {
    const method   = Symbol(),
          handler  = { [method] () { return type; } };
    Object.defineProperty(handler, method,
        Reflect.decorate([mapsTo(id)], handler, method,
            Object.getOwnPropertyDescriptor(handler, method)));
    TypeMapping.implement(handler);
}
