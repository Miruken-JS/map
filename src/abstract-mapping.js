import { typeOf, $isFunction } from "miruken-core";
import { Handler, $unhandled } from "miruken-callback";
import { mapsFrom, mapsTo } from "./maps";

/**
 * Abstract mapping.
 * @class Abstract mapping
 * @extends Handler
 */        
export const AbstractMapping = Handler.extend({
    @mapsFrom
    mapsFrom(mapsFrom, { composer }) {
        return $unhandled;
    },

    @mapsTo
    mapsTo(mapsTo, { composer }) {
    },

    canSetProperty(descriptor) {
        return !$isFunction(descriptor.value);        
    },
    isPrimitiveValue(value) {
        switch (typeOf(value)) {
            case "null":
            case "number":
            case "string":
            case "boolean":        
            return true;
        }
        return false;        
    }
});