import { typeOf, $isFunction } from "miruken-core";
import { Handler, $unhandled } from "miruken-callback";
import { mapsFrom, mapsTo } from "./maps";

/**
 * Abstract mapping.
 * @class Abstract mapping
 * @extends Handler
 */        
export class AbstractMapping extends Handler {
    @mapsFrom
    mapsFrom(mapsFrom) {
        return $unhandled;
    }

    @mapsTo
    mapsTo(mapsTo) {}

    canSetProperty(descriptor) {
        return !$isFunction(descriptor.value);        
    }

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
}