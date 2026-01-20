import { Op } from "sequelize";
import { findConferencePublicationsById } from "../repositories/conference.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { CONFERENCE_STATUS, CONTENT_SUBMISSION_PAYMENT_STATUS, CONTENT_SUBMISSION_STATUS } from "../utils/constants.js";
import { serializeConference } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";
import { canCreateOrUpdateSubmissionPayment } from "../repositories/contentSubmissionPayment.js";

export function createContentSubmissionPaymentService({ ContentSubmissionPayment }) {
  if (!ContentSubmissionPayment) {
    throw new Error("createContentSubmissionPaymentService requires { ContentSubmissionPayment } model");
  }

  async function createSubmissionPayment(user, payload) {
    const { contentSubmissionId, amount, currency, provider, providerPaymentId } = payload;

    if (!contentSubmissionId || amount || isEmpty(currency) || isEmpty(provider) || isEmpty(providerPaymentId)) {
      throw new ErrorResponse(400, "contentSubmissionId, amount, currency, provider, providerPaymentId should be present");
    }

    const { submissionExists, submissionPaymentExists } = await canCreateOrUpdateSubmissionPayment(contentSubmissionId);

    if (!submissionExists) {
      throw new ErrorResponse(404, "ContentSubmission not found");
    }

    if (submissionPaymentExists) {
      throw new ErrorResponse(409, "ContentSubmissionPayment already exists");
    }

    const payment = await ContentSubmissionPayment.create({
      contentSubmissionId: Number(contentSubmissionId),
      amount,
      currency,
      provider,
      providerPaymentId,
      usrId: Number(user.id),
      status: CONTENT_SUBMISSION_PAYMENT_STATUS.PENDING,
    });

    return payment;
  }

  async function updateSubmissionPaymentStatus(contentSubmissionId, status) {
    if (!Object.values(CONTENT_SUBMISSION_PAYMENT_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid payment status");
    }

    const { submissionExists, submissionPaymentExists } = await canCreateOrUpdateSubmissionPayment(contentSubmissionId);

    if (!submissionExists) {
      throw new ErrorResponse(404, "ContentSubmission not found");
    }

    if (!submissionPaymentExists) {
      throw new ErrorResponse(409, "ContentSubmissionPayment not found");
    }

    const payment = await ContentSubmissionPayment.findOne({
      where: { contentSubmissionId: Number(contentSubmissionId) },
    });

    await payment.update({ status });
  }

  return {
    createSubmissionPayment,
    updateSubmissionPaymentStatus,
  };
}
