interface StringifyIniOptions {
  pretty?: boolean;
}

// بديل مباشر لدالة الترميز لتجاوز نقص مكتبة ini أثناء التجميع
const encode = (data: Record<string, any>): string => {
  let str = '';
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const val = data[key];
      if (typeof val === 'object' && val !== null) {
        str += `[${key}]\n`;
        for (const subKey in val) {
          if (Object.prototype.hasOwnProperty.call(val, subKey)) {
            str += `${subKey}=${val[subKey]}\n`;
          }
        }
      } else {
        str += `${key}=${val}\n`;
      }
    }
  }
  return str;
};

export const stringifyIni = (
  obj: Record<string, any>,
  _options?: StringifyIniOptions,
): string => {
  return encode(obj);
};

export default stringifyIni;
