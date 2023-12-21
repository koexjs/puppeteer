import { Context } from '@koex/core';

export function getConfig<T = any>(ctx: Context, key: string, required?: boolean, defaultValue?: T): any {
  let value = ctx.query[key];
  if (!value) {
    value = (ctx.request as any)?.body?.[key];
  }

  if (!value) {
    if (!!required) {
      throw new Error(`config ${key} is required`);
    }

    if (typeof defaultValue != 'undefined') {
      return defaultValue;
    }
  }

  return value;
}
