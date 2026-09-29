/**
 * Standardized API Response Helper
 */
class ApiResponse {
  /**
   * Send a successful JSON response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code (default 200)
   * @param {string} message - User-friendly message
   * @param {*} data - Payload data
   */
  static send(res, statusCode = 200, message = 'Success', data = null) {
    const responsePayload = {
      success: true,
      message,
    };

    if (data !== null && data !== undefined) {
      responsePayload.data = data;
    }

    return res.status(statusCode).json(responsePayload);
  }

  static success(res, message, data, statusCode = 200) {
    return ApiResponse.send(res, statusCode, message, data);
  }

  static created(res, message, data) {
    return ApiResponse.send(res, 201, message, data);
  }
}

module.exports = ApiResponse;
