import { blood_type, donation_status } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { DonationRequestService } from "./donation-request.service";

interface AllReqQuery {
  status?: donation_status;
  limit?: number;
}
interface CreateReqBody {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: string;
  date: string;
  blood: blood_type;
  reason: string;
  emailUserId: string;
}

interface AssignReqBody {
  donor: string;
}
export class DonationRequestController {
  constructor(
    private readonly drService: DonationRequestService = new DonationRequestService()
  ) {}

  async all(
    req: Request<{}, {}, {}, AllReqQuery>,
    res: Response,
    next: NextFunction
  ) {
    const role = (req.user as any)?.role?.role;

    try {
      const data = await this.drService.findAll(role, (req.user as any).id);

      return res.status(200).json({
        message: "Request was successful!",
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
  create = async (
    req: Request<{}, {}, CreateReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const item = await this.drService.createRequest(req.body, req.user);

      return res.status(201).json({
        message:
          "Your request has been accepted! We will let you know via email or call you directly!",
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  async single(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const single = await this.drService.findUnique({
        id: req.params.id,
      });

      return res.status(200).json({
        message: "Request was successful!",
        data: single,
      });
    } catch (error) {
      next(error);
    }
  }

  async approve(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.drService.approve(req.params.id, req.user);

      return res.status(202).json({
        message: "Donation request approved!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async complete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      this.drService.complete(req.params.id, req.user);

      return res.status(200).json({
        message: "Donation request completed!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async decline(
    req: Request<{ id: string }, {}, {}>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.drService.decline(req.params.id, req.user);

      return res.status(202).json({
        message: "Donation request approved!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
  async progress(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.drService.progress(req.params.id, req.user);

      return res.status(202).json({
        message: "Donation status updated!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async assign(
    req: Request<{ id: string }, {}, AssignReqBody>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const donorData = await this.drService.assign(
        req.params.id,
        req.body.donor,
        req.user
      );

      return res.status(200).json({
        message: "Donor assigned successfully",
        data: donorData,
      });
    } catch (error) {
      next(error);
    }
  }

  async hold(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await this.drService.hold(req.params.id, req.user); //

      return res.status(202).json({
        message: "Donation status updated to hold!",
        data: null,
      });
    } catch (error) {
      next(error); // Use global error handler
    }
  }

  async remove(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.drService.softRemove(req.params.id, req.user); //

      return res.status(204).json({
        message: "Donation request removed successfully!",
        data: null,
      });
    } catch (error) {
      next(error); // Use global error handler
    }
  }

  findDonor = async (
    req: Request<{}, {}, FindReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { date, blood } = req.body;
      const donors = await this.drService.findAvailableDonors(blood, date);

      return res.status(200).json({
        message: "Request accepted! Potential donors found.",
        data: donors,
      });
    } catch (error) {
      next(error);
    }
  };

  userContribution = async (
    req: Request<{ username: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const stats = await this.drService.getUserContributionStats(
        req.params.username
      );

      return res.status(200).json({
        message: "Stats generated successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}

interface FindReqBody {
  blood: blood_type;
  date: string;
}
