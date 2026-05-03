import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IImage } from "../../image";
import { IGeneratedSummary } from "../../generatedSummary/types";
export interface IUser {
  _id?: string | Types.ObjectId;
  firstName?: string;
  lastName?: string;
  firebaseUserId?: string;
  isGoogleLogin?: boolean;
  isAppleLogin?: boolean;
  password?: string;
  profileImage?: IImage | string;
  generatedSummary?: (IGeneratedSummary | string)[];
  FCMToken?: string[];
  RESETToken?: string;
  userType?: string;
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deviceId?: string;
  glitter?: number;
  isTransferred?: boolean,
  isCreditEligible: boolean,
  viewCount?: number;
  token?: string;
  isRegistered?: boolean;
  email?: string;
  isLogin?: boolean;
  darkMode?: boolean;
  isGuestLogin?: boolean;
  feedBackGiven?: boolean;
  isProUser?: boolean;
  isBlocked?: boolean;
  isPurchased?: boolean;
  deviceType?: string;
  lastCreditReset?: Date;
  dailyCredits?: number;
  rewardCount?: number;
  premiumExpiryDate?: Date;
  premiumType?: string;
  phone?: string;
  bio?: string;
  location?: string;
  totalSummaries?: number;
}
export interface UserDefaults {
  firebaseUserId: "";
  RESETToken: "";
  FCMToken: [];
  rewardCount: 0;
}

export class User implements IUser {
  _id?: string | Types.ObjectId;
  firstName?: string;
  lastName?: string;
  firebaseUserId?: string;
  isGoogleLogin?: boolean;
  isAppleLogin?: boolean;
  isTransferred?: boolean;
  isCreditEligible: boolean;
  password?: string;
  rewardCount?: number;
  profileImage?: IImage | string;
  generatedSummary?: (IGeneratedSummary | string)[];
  FCMToken?: string[];
  RESETToken?: string;
  userType?: string;
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deviceId?: string;
  glitter?: number;
  viewCount?: number;
  isRegistered?: boolean;
  token?: string;
  email?: string;
  isLogin?: boolean;
  darkMode?: boolean;
  isGuestLogin?: boolean;
  feedBackGiven?: boolean;
  isProUser?: boolean;
  isBlocked?: boolean;
  isPurchased?: boolean;
  deviceType?: string;
  lastCreditReset?: Date;
  dailyCredits?: number;
  premiumExpiryDate?: Date;
  premiumType?: string;
  phone?: string;
  bio?: string;
  location?: string;
  totalSummaries?: number;

  constructor(input?: IUser) {
    this._id = input?._id
      ? input?._id.toString()
      : new Types.ObjectId().toString();
    this.firstName = input?.firstName;
    this.lastName = input?.lastName;
    this.firebaseUserId = input?.firebaseUserId;
    this.isGoogleLogin = input?.isGoogleLogin;
    this.isAppleLogin = input?.isAppleLogin;
    this.password = input?.password;
    this.profileImage = input?.profileImage;
    this.generatedSummary = input?.generatedSummary;
    this.FCMToken = input?.FCMToken;
    this.token = input.token;
    this.RESETToken = input?.RESETToken;
    this.userType = input?.userType;
    this.isEmailVerified = input?.isEmailVerified;
    this.userType =
      input?.userType === "ADMIN" || input?.userType === "USER"
        ? input?.userType
        : "USER";
    this.createdAt = input?.createdAt;
    this.updatedAt = input?.updatedAt;
    this.glitter = input?.glitter;
    this.rewardCount = input?.rewardCount;
    this.viewCount = input?.viewCount;
    this.deviceId = input?.deviceId;
    this.isTransferred = input?.isTransferred;
    this.isCreditEligible = input?.isCreditEligible;
    this.isRegistered = input?.isRegistered;
    this.email = input?.email;
    this.isLogin = input?.isLogin;
    this.darkMode = input?.darkMode;
    this.isGuestLogin = input?.isGuestLogin;
    this.feedBackGiven = input?.feedBackGiven;
    this.isProUser = input?.isProUser;
    this.isBlocked = input?.isBlocked;
    this.isPurchased = input?.isPurchased;
    this.deviceType = input?.deviceType;
    this.lastCreditReset = input?.lastCreditReset;
    this.dailyCredits = input?.dailyCredits;
    this.premiumExpiryDate = input?.premiumExpiryDate;
    this.premiumType = input?.premiumType;
    this.phone = input?.phone;
    this.bio = input?.bio;
    this.location = input?.location;
    this.totalSummaries = input?.totalSummaries;
  }

  static defaults: UserDefaults = {
    firebaseUserId: "",
    RESETToken: "",
    FCMToken: [],
    rewardCount: 0,
  };

  static adminTypes = ["ADMIN", "SUPER ADMIN"];

  toJSON(): IUser {
    return omitBy(this, isUndefined) as IUser;
  }
}
