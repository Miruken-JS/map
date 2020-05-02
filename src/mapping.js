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
        this._format   = format;
        this._options  = options;
        this._results  = [];
        this._promises = [];
    },                                              
    get format() { return this._format; },                                              
    get options() { return this._options; },             
    get callbackResult() {
        if (this._result === undefined) {
            this._result = this._promises.length == 0 
                         ? this._results[0]
                         : Promise.all(this._promises)
                            .then(() => this._results[0]);
        }
        return this._result;
    },
    set callbackResult(value) { this._result = value; },            
    addResult(result) {
        if (result == null) return;
        if ($isPromise(result)) {
            this._promises.push(result.then(res => {
                if (res != null) {
                    this._results.push(res);
                }
            }));
        } else {
            this._results.push(result);
        }
        this._result = undefined;
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
            throw new TypeError("Missing object to map.");
        }
        this.base(format, options);
        this._object = object;     
    },                           
    get object() { return this._object; },      
    get policy() { return $mapFrom; },
    dispatch(handler, greedy, composer) {
        const target = this.object,
              source = $classOf(target);
        if ($isNothing(source)) return false;
        return $mapFrom.dispatch(handler, this, source,
            composer, false, this.addResult.bind(this)) !== $unhandled; 
    },    
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
            throw new TypeError("Missing value to map from.");
        }        
        this.base(format, options);
        if ($isNothing(classOrInstance) && !$isString(value)) {
            classOrInstance = $classOf(value);
        }
        this._value           = value;
        this._classOrInstance = classOrInstance;
    },
                   
    get value() { return this._value; },                                           
    get classOrInstance() { return this._classOrInstance; },
    get policy() { return $mapTo; },

    dispatch(handler, greedy, composer) {
        const source = this.classOrInstance || this.value;
        return $mapTo.dispatch(handler, this, source,
            composer, false, this.addResult.bind(this)) !== $unhandled;
    },    
    toString() {
        return `MapTo | ${String(this.format)} ${this.value}`;
    }           
});
