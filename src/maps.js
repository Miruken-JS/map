import {
    Metadata, $isNothing, $equals
} from "miruken-core";

import { 
    CovariantPolicy, ContravariantPolicy
} from "miruken-callback";

const formatMetadataKey = Symbol();

/**
 * Policy for mapping a value to a format.
 * @property {Function} mapsFrom
 */   
export const mapsFrom = ContravariantPolicy.createDecorator("mapsFrom", false, _filterFormat);

/**
 * Policy for mapping from a formatted value.
 * @property {Function} mapsTo
 */   
export const mapsTo = CovariantPolicy.createDecorator("mapsTo", false, _filterFormat);

/**
 * Mapping formats.
 * @method format
 * @param {Array}  ...formats  -  mapping formats 
 */
export const format = Metadata.decorator(formatMetadataKey,
    (target, key, descriptor, formats) => {
        formats = formats.flat();
        if (formats.length === 0) return;
        const metadata = $isNothing(descriptor)
            ? format.getOrCreateOwn(target.prototype, () => new Set())
            : format.getOrCreateOwn(target, key, () => new Set());
        formats.forEach(format => metadata.add(format));
    });

function _filterFormat(key, mapCallback) {
    const prototype = Object.getPrototypeOf(this);
    let formats = format.get(prototype, key);
    if (!formats || formats.size === 0) {
        formats = format.get(prototype);        
    }
    return !formats || formats.size === 0 ||
        [...formats].some(f => $equals(mapCallback.format, f));
}
