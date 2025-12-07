import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";

import fs from "fs";


export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
    );
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employerID ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  // Create Application with Binary Data
  // Since useTempFiles is true, resume.data is empty. We must read from tempFilePath.
  const resumeBuffer = fs.readFileSync(resume.tempFilePath);

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume: {
      data: resumeBuffer, // Binary buffer from file
      contentType: resume.mimetype,
      originalName: resume.name,
    },
  });
  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

export const getResume = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }
  if (!application.resume || !application.resume.data) {
    return next(new ErrorHandler("Resume not found!", 404));
  }

  res.set("Content-Type", application.resume.contentType);
  res.send(application.resume.data);
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const rawApplications = await Application.find({ "employerID.user": _id }).select("-resume.data");

    // Add resume.url for frontend compatibility
    const applications = rawApplications.map(app => {
      const appObj = app.toObject();
      if (appObj.resume) {
        const protocol = req.protocol;
        const host = req.get("host");
        const backendUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
        appObj.resume.url = `${backendUrl}/api/v1/application/resume/${app._id}`;
      }
      return appObj;
    });

    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const rawApplications = await Application.find({ "applicantID.user": _id }).select("-resume.data");

    // Add resume.url
    const applications = rawApplications.map(app => {
      const appObj = app.toObject();
      if (appObj.resume) {
        const protocol = req.protocol;
        const host = req.get("host");
        const backendUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
        appObj.resume.url = `${backendUrl}/api/v1/application/resume/${app._id}`;
      }
      return appObj;
    });

    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);

export const employerUpdateStatus = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return next(new ErrorHandler("Please provide a status.", 400));
  }

  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  application.status = status;
  await application.save();

  res.status(200).json({
    success: true,
    message: "Application Status Updated!",
  });
});
