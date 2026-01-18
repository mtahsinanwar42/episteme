import { QueryTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { CONTENT_SUBMISSION_STATUS } from "../utils/constants.js";

export async function canCreateOrUpdateSubmissionPayment(contentSubmissionId) {
  const sql = `
    SELECT
      EXISTS (
          SELECT 1
          FROM episteme.content_submission CS
          WHERE CS.id = :contentSubmissionId
            AND CS.current_status <> :deletedSubmissionStatus
        ) AS "submissionExists",
        EXISTS (
          SELECT 1
          FROM episteme.content_submission_payment CSP
          WHERE CSP.content_submission_id = :contentSubmissionId
        ) AS "submissionPaymentExists";
  `;

  const [row] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      contentSubmissionId: Number(contentSubmissionId),
      deletedSubmissionStatus: CONTENT_SUBMISSION_STATUS.DELETED,
    },
  });

  return row;
}
