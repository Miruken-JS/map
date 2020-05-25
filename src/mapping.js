import {
    Abstract, $isString, $isNothing,
    $isPromise, $classOf, createKeyChain
} from "miruken-core";

import { CallbackControl } from "miruken-callback";
import { mapsFrom, mapsTo } from "./maps";

const _ = createKeyChain();

/**
 * Base callback for mapping.
 * @class MapCallback
 * @constructor
 * @param   {Any}     format   -  format specifier
 * @param   {Object}  options  -  mapping options
 * @extends Base
 */
const MapCallback = Abstract.extend(CallbackControl, {
    constructor(format, options) {
        const _this = _(this);
        _this.format   = format;
        _this.options  = options;
        _this.results  = [];
        _this.promises = [];
    },

    get format() { return _(this).format; },                                              
    get options() { return _(this).options; },             
    get callbackResult() {
        if (_(this).result === undefined) {
            const { results, promises }  = _(this);
            _(this).result = promises.length == 0 
                ? results[0]
                : Promise.all(promises).then(() => results[0]);
        }
        return _(this).result;
    },
    set callbackResult(value) { _(this).result = value; },

    addResult(result) {
        if ($isNothing(result)) return;
        if ($isPromise(result)) {
            _(this).promises.push(result.then(res => {
                if (res != null) {
                    _(this).results.push(res);
                }
            }));
        } else {
            _(this).results.push(result);
        }
        _(this).result = undefined;
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
        _(this).object = object;     
    },

    get object() { return _(this).object; },      
    get callbackPolicy() { return mapsFrom.policy; },
    
    dispatch(handler, greedy, composer) {
        const target = this.object,
              source = $classOf(target);
        if ($isNothing(source)) return false;
        return mapsFrom.dispatch(handler, this, source,
            composer, false, this.addResult.bind(this)); 
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
            throw new TypeError("Missing value to map.");
        }        
        this.base(format, options);
        if ($isNothing(classOrInstance) && !$isString(value)) {
            classOrInstance = $classOf(value);
        }
        const _this = _(this);
        _this.value           = value;
        _this.classOrInstance = classOrInstance;
    },
                   
    get value() { return _(this).value; },                                           
    get classOrInstance() { return _(this).classOrInstance; },
    get callbackPolicy() { return mapsTo.policy; },

    dispatch(handler, greedy, composer) {
        const source = this.classOrInstance || this.value;
        return mapsTo.dispatch(handler, this, source,
            composer, false, this.addResult.bind(this));
    },    
    toString() {
        return `MapTo | ${String(this.format)} ${this.value}`;
    }           
});
