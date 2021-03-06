/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO(dvoytenko, #2527): Remove this module.


// Triple zero width space.
// This is added to assert error messages, so that we can later identify
// them, when the only thing that we have is the message. This is the
// case in many browsers when the global exception handler is invoked.
// @deprecated DO NOT USE. Replaced with USER_ERROR_SENTINEL.
export const ASSERT_SENTINEL = '\u200B\u200B\u200B';

/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {string} message The assertion message
 * @param {...*} var_args Arguments substituted into %s in the message.
 * @return {T} The value of shouldBeTrueish.
 * @template T
 * @deprecated DO NOT USE. Replaced with user.assert.
 */
/*eslint "google-camelcase/google-camelcase": 0*/
export function assert(shouldBeTrueish, message, var_args) {
  let firstElement;
  if (!shouldBeTrueish) {
    message = message || 'Assertion failed';
    const splitMessage = message.split('%s');
    const first = splitMessage.shift();
    let formatted = first;
    const messageArray = [];
    pushIfNonEmpty(messageArray, first);
    for (let i = 2; i < arguments.length; i++) {
      const val = arguments[i];
      if (val && val.tagName) {
        firstElement = val;
      }
      const nextConstant = splitMessage.shift();
      messageArray.push(val);
      pushIfNonEmpty(messageArray, nextConstant.trim());
      formatted += toString(val) + nextConstant;
    }
    const e = userError(formatted);
    e.fromAssert = true;
    e.associatedElement = firstElement;
    e.messageArray = messageArray;
    throw e;
  }
  return shouldBeTrueish;
}
/*eslint "google-camelcase/google-camelcase": 2*/

/**
 * Asserts and returns the enum value. If the enum doesn't contain such a value,
 * the error is thrown.
 *
 * @param {!Enum<T>} enumObj
 * @param {string} s
 * @param {string=} opt_enumName
 * @return T
 * @template T
 * @deprecated DO NOT USE. Replaced with user.assert.
 */
export function assertEnumValue(enumObj, s, opt_enumName) {
  for (const k in enumObj) {
    if (enumObj[k] == s) {
      return enumObj[k];
    }
  }
  throw new Error(`Unknown ${opt_enumName || 'enum'} value: "${s}"`);
}

/**
 * Returns an error object that will be treated as user originated error
 * by the system.
 * User in this case means: 'Error caused by doc as opposed internal AMP
 * error'.
 * @param {string} message
 * @return {!Error}
 * @deprecated DO NOT USE. Replaced with user.error.
 */
export function userError(message) {
  return new Error(message + ASSERT_SENTINEL);
}

/**
 * @return {boolean} Whether this message was created from an assert.
 * @deprecated DO NOT USE. Replaced with isUserErrorMessage.
 */
export function isAssertErrorMessage(message) {
  return message.indexOf(ASSERT_SENTINEL) >= 0;
}

/**
 * @param {*} val
 * @return {string}
 */
function toString(val) {
  if (val instanceof Element) {
    return val.tagName.toLowerCase() + (val.id ? '#' + val.id : '');
  }
  return val;
}

/**
 * @param {!Array} array
 * @param {*} val
 */
function pushIfNonEmpty(array, val) {
  if (val != '') {
    array.push(val);
  }
}
