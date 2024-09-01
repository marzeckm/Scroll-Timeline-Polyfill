/**
 * Helper for creating ES5-Classes
 * 
 * @polyfill classCreator
 */
(function() {
    'use strict';

    const errorInstantiateClass = 'Cannot instantiate abstract class directly.';

    /**
     * Is called, when someone tries to create 
     * Object of Class
     */
    function Class() {
        if (this.constructor === Class) {
            throw new Error(errorInstantiateClass);
        }
    }

    /**
     * Adds the functionality of extending classes
     * 
     * @param { Object} Child 
     * @param { Object } Parent 
     * @returns { void }
     */
    function extend(Child, Parent) {
        Child.prototype = Object.create(Parent.prototype);
        Child.prototype.constructor = Child;
    }

    /**
     * Creates a new ES5-Class
     * 
     * @param { {extends?: Class, methods?: {}, properties: {}} } definition 
     * @returns { Object<T> }
     */
    function createClass(definition) {
        var Parent = definition.extends || Class;
        var Methods = definition.methods || {};
        var StaticMethods = definition.staticMethods || {};
        var Properties = definition.properties || {}; 

        function ClassConstructor() {
            if (Parent !== Class) {
                Parent.apply(this, arguments);
            }

            if (Methods.constructor) {
                Methods.constructor.apply(this, arguments);
            }
        }

        extend(ClassConstructor, Parent);

        for (var key in Methods) {
            if (Methods.hasOwnProperty(key)) {
                ClassConstructor.prototype[key] = Methods[key];
            }
        }

        for (var staticKey in StaticMethods) {
            if (StaticMethods.hasOwnProperty(staticKey)) {
                ClassConstructor[staticKey] = StaticMethods[staticKey];
            }
        }

        for (var prop in Properties) {
            if (Properties.hasOwnProperty(prop)) {
                Object.defineProperty(ClassConstructor.prototype, prop, {
                    get: Properties[prop].get || function() {},
                    set: Properties[prop].set || function() {},
                    enumerable: true,
                    configurable: true
                });
            }
        }

        return ClassConstructor;
    }

    window.ScrollTimelinePolyfill.createClass = createClass;
}());
