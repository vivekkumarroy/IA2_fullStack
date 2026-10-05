import axios from 'axios';
import { ApiErrorBody } from '../types/api';

/**
 * Extracts a human-readable error message from an unknown error value.
 * Strictly avoids `any`, inspecting Axios response error envelopes first,
 * then network/native Error messages, falling back to a safe default.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Check if the backend responded with our standardized ApiErrorBody
    const responseData = error.response?.data as ApiErrorBody | undefined;
    if (responseData && typeof responseData === 'object' && responseData.error) {
      if (responseData.error.message) {
        // If there are detailed validation issues, append the first one
        if (responseData.error.details && responseData.error.details.length > 0) {
          const firstDetail = responseData.error.details[0];
          if (firstDetail) {
            return `${responseData.error.message}: ${firstDetail.message}`;
          }
        }
        return responseData.error.message;
      }
    }

    // Network error or HTTP error without JSON envelope
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}
