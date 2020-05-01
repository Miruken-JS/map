import { $isNothing, $isFunction } from "miruken-core";
import { Handler, NotHandledError } from "miruken-callback";
import { MapTo, MapFrom } from "./mapping";

Handler.implement({
    /**
     * Maps the `object` to a value in `format`.
     * @method mapFrom
     * @param   {Object}  object   -  object to map
     * @param   {Any}     format   -  format specifier
     * @param   {Object}  options  -  mapping options
     * @returns {Any}  mapped value.
     * @for Handler
     */
    mapFrom(object, format, options) {
        if ($isNothing(object)) {
            throw new TypeError("Missing object to map");
        }
        const mapFrom = new MapFrom(object, format, options);
        if (!this.handle(mapFrom)) {
            throw new NotHandledError(mapFrom);
        }
        return mapFrom.callbackResult;
    },
    /**
     * Maps the formatted `value` in `format` to `classOrInstance`.
     * @method mapTo 
     * @param   {Any}  value       -  formatted value
     * @param   {Any}  format      -  format specifier
     * @param   {Function|Object}  -  instance or class to unmap
     * @param   {Object}  options  -  mapping options
     * @return  {Object}  unmapped instance.
     * @for Handler
     */    
    mapTo(value, format, classOrInstance, options) {
        if ($isNothing(value)) {
            throw new TypeError("Missing value to map from");
        }
        if (Array.isArray(classOrInstance)) {
            const type = classOrInstance[0];
            if (type && !$isFunction(type) && !Array.isArray(type)) {
                throw new TypeError("Cannot infer array type");
            }
        } else if (Array.isArray(value) && $isFunction(classOrInstance)) {
            classOrInstance = [classOrInstance];
        }
        const mapTo = new MapTo(value, format, classOrInstance, options);
        if (!this.handle(mapTo)) {
            throw new NotHandledError(mapTo);
        }
        return mapTo.callbackResult; 
    }    
});

