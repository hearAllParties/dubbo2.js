/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import debug from 'debug';
import {Context} from 'dubbo2.js';
import {isFn, isRegExp, isString} from './type';
import {IDubboInvokeParam, IRule, TPredictFunction} from './types';

const log = debug('dubbo:dubbo-invoker');

export class Matcher {
  constructor() {
    this._rules = [];
  }

  private readonly _rules: Array<IRule>;

  match(
    arg: string | RegExp | TPredictFunction,
    invokeParam: IDubboInvokeParam,
  ) {
    const rule = {
      condition: arg,
      invokeParam,
    };
    log('add match rule %j', rule);
    this._rules.push(rule);
    return this;
  }

  invokeParam(ctx: Context) {
    const {dubboInterface} = ctx;
    for (let rule of this._rules) {
      const {condition, invokeParam} = rule;

      //dubboInterface eq condition
      if (isString(condition) && dubboInterface === condition) {
        log(
          '%s =match=> string rule %s result=> %j',
          dubboInterface,
          condition,
          invokeParam,
        );
        return invokeParam;
      }

      //dubboInteface match regexp
      if (isRegExp(condition) && condition.test(dubboInterface)) {
        log(
          '%s =match=> regexp rule %O result=> %j',
          dubboInterface,
          condition,
          invokeParam,
        );
        return invokeParam;
      }

      //isFn return value is true
      if (isFn(condition) && condition(ctx)) {
        log('%s =match=> fn rule result=> %j', dubboInterface, invokeParam);
        return invokeParam;
      }
    }

    log('oops, %s can not find any match rule', dubboInterface);
    return {
      version: '',
      group: '',
    };
  }
}

export default new Matcher();
