import { isNil, isUndefined, omitBy } from "lodash";
import { IImage } from "../../image";

export interface ISupportedLanguage {
  _id?: string;
  country?: string;
  flag?: string;
  codeForText?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SupportedLanguage implements ISupportedLanguage {
  _id?: string;
  country?: string;
  flag?: string;
  codeForText?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ISupportedLanguage) {
    this._id = input._id;
    this.country = input.country;
    this.flag = input.flag;
    this.codeForText = input.codeForText;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as ISupportedLanguage;
  }

  toComparable(): ISupportedLanguage {
    return omitBy(this, isNil) as ISupportedLanguage;
  }
}
