import {
    Abstract, $isString, $isNothing,
    $isPromise, $classOf
} from "miruken-core";

import {
     DispatchingCallback, $unhandled
} from "miruken-callback";

import { $mapFrom, $mapTo } from "./maps";

/**
 * Base callback for mapping.
 * @class MapCallback
 * @constructor
 * @param   {Any}     format   -  format specifier
 * @param   {Object}  options  -  mapping options
 * @extends Base
 */
const MapCallback = Abstract.extend(DispatchingCallback, {
    constructor(format, options) {
        let _results  = [],
            _promises = [],
            _result;        
        this.extend({
            /**
             * Gets the format to map.
             * @property {Any} format
             * @readOnly
             */                                                
            get format() { return format; },
            /**
             * Gets the mapping options.
             * @property {Object} options
             * @readOnly
             */                                                
            get options() { return options; },          
            /**
             * Gets/sets the effective callback result.
             * @property {Any} callback result
             */               
            get callbackResult() {
                if (_result === undefined) {
                    _result = _promises.length == 0 ? _results[0]
                            : Promise.all(_promises).then(() => _results[0]);
                }
                return _result;
            },
            set callbackResult(value) { _result = value; },            
            addResult(result) {
                if (result == null) return;
                if ($isPromise(result)) {
                    _promises.push(result.then(res => {
                        if (res != null) {
                            _results.push(res);
                        }
                    }));
                } else {
                    _results.push(result);
                }
                _result = undefined;
            }             
        });
    }
});

/**
 * Callback to map an `object` to `format`.
 * @class MapFrom
 * @constructor
 * @param   {Object}  object     -  object to map
 * @param   {Any}     format     -  format specifier
 * @param   {Object}  [options]  -  mapping options
 * @extends MapCallback
 */
export const MapFrom = MapCallback.extend({
    constructor(object, format, options) {
        if ($isNothing(object)) {
            throw new TypeError("Missing object to map");
        }
        this.base(format, options);
        this.extend({
            /**
             * Gets the target object to map.
             * @property {Object} object
             * @readOnly
             */                                
            get object() { return object; },         
            dispatch(handler, greedy, composer) {
                const target = this.object,
                      source = $classOf(target);
                if ($isNothing(source)) return false;
                return $mapFrom.dispatch(handler, this, source,
                    composer, false, this.addResult) !== $unhandled; 
            }               
        });      
    },        
    get policy() { return $$mapFrom; },
    toString() {
        return `MapFrom | ${this.object} to ${String(this.format)}`;
    }       
});

/**
 * Callback to map a formatted `value` into an object.
 * @class MapTo
 * @constructor
 * @param   {Any}              value            -  formatted value
 * @param   {Any}              format           -  format specifier
 * @param   {Function|Object}  classOrInstance  -  instance or class to unmap
 * @param   {Object}           [options]        -  mapping options
 * @extends MapCallback
 */
export const MapTo = MapCallback.extend({
    constructor(value, format, classOrInstance, options) {
        if ($isNothing(value)) {
            throw new TypeError("Missing value to map from");
        }        
        this.base(format, options);
        if ($isNothing(classOrInstance) && !$isString(value)) {
            classOrInstance = $classOf(value);
        }
        this.extend({
            /**
             * Gets the formatted value.
             * @property {Any} value
             * @readOnly
             */                                
            get value() { return value; },
            /**
             * Gets the class or instance to unmap into.
             * @property {Function|Object} classOrInstance
             * @readOnly
             */                                                
            get classOrInstance() { return classOrInstance; },
            dispatch(handler, greedy, composer) {
                const source = this.classOrInstance || this.value;
                return $mapTo.dispatch(handler, this, source,
                    composer, false, this.addResult) !== $unhandled;
            }             
        });
    },
    /**
     * Gets the policy.
     * @property {Function} policy
     * @readOnly
     */         
    get policy() { return $$mapTo; },
    toString() {
        return `MapTo | ${String(this.format)} ${this.value}`;
    }           
});
