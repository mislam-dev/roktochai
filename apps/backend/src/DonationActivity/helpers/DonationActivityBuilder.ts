import { blood_type, donation_activity_status, Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { InternalServerException } from "../../core/errors";
import { DonationActivityService } from "../donation-activity.service";

@injectable()
export class DonationActivityBuilder {
  private _type!: donation_activity_status;
  private _userId!: string;
  private _requestId!: string;
  private _userName: string = "";
  private _bloodType?: blood_type;
  private _place?: string;
  private _targetName?: string;
  private _updaterName?: string;
  private _data?: Prisma.DonationActivityUncheckedCreateInput;

  constructor(private readonly daService: DonationActivityService) {}

  setUserId(userId: string) {
    this._userId = userId;
    return this;
  }
  setRequestId(requestId: string) {
    this._requestId = requestId;
    return this;
  }

  // Setters for context
  setActor(name: string) {
    this._userName = name;
    return this;
  }

  setBloodType(type: blood_type) {
    this._bloodType = type;
    return this;
  }

  setPlace(place: string) {
    this._place = place;
    return this;
  }

  setTargetUser(name: string) {
    this._targetName = name;
    return this;
  }

  setUpdater(name: string) {
    this._updaterName = name;
    return this;
  }

  private generateMessage(): string {
    switch (this._type) {
      case "request":
        return `${this._userName} requested ${this._bloodType} blood at ${this._place}`;
      case "approve":
        return `${this._userName} approved a request of ${this._targetName}`;
      case "progress":
        return `${this._userName} make request to progress`;
      case "ready":
        return `${this._targetName} is ready to donate blood for ${this._userName}. Updated By ${this._updaterName}`;
      case "hold":
        return `${this._userName} hold a request`;
      case "completed":
        return `${this._userName} give blood to ${this._targetName} at ${this._place}. Updated By ${this._updaterName}`;
      case "declined":
        return `${this._userName} decline a request`;
      case "deleted":
        return `${this._userName} deleted a request`;
      default:
        return "Unknown activity";
    }
  }

  build(type: donation_activity_status) {
    this._type = type;
    const message = this.generateMessage();

    this._data = {
      type: this._type,
      message,
      createdById: this._userId,
      requestId: this._requestId,
    };
    return this;
  }

  async save() {
    if (!this._data)
      throw new InternalServerException("Data is not builded yet!");
    return this.daService.create(this._data);
  }
}
