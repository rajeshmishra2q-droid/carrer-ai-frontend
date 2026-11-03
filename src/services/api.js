/**
 * AI Career Compass - Centralized API Service
 * 
 * Configured according to the official API Reference:
 * Base URL: https://carrer-ai-pearl.vercel.app/api (configurable via VITE_API_BASE_URL or UI Settings)
 *
 * Endpoints:
 * 1. POST /api/career/recommend
 * 2. POST /api/skill/gap-analysis
 * 3. POST /api/roadmap/generate
 * 4. POST /api/guidance/compare
 * 5. POST /api/guidance/advice
 */

export const DEFAULT_API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'https://carrer-ai-pearl.vercel.app/api';

export class ApiError extends Error {
  constructor(message, { status = null, endpoint = '', payload = null, raw = null, isNetworkError = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.payload = payload;
    this.raw = raw;
    this.isNetworkError = isNetworkError;
  }
}

export const getApiBaseUrl = () => {
  try {
    const saved = localStorage.getItem('ai_career_compass_api_base');
    if (saved && typeof saved === 'string') {
      const clean = saved.trim().replace(/\/+$/, '');
      // If user had previous local test address that is no longer valid, migrate to live deployment
      if (clean && !clean.includes('127.0.0.1:5000') && !clean.includes('localhost:5000')) {
        return clean;
      }
    }
    // Update local storage to default
    localStorage.setItem('ai_career_compass_api_base', DEFAULT_API_BASE_URL);
    return DEFAULT_API_BASE_URL;
  } catch {
    return DEFAULT_API_BASE_URL;
  }
};

export const setApiBaseUrl = (url) => {
  try {
    const clean = String(url || '').trim().replace(/\/+$/, '') || DEFAULT_API_BASE_URL;
    localStorage.setItem('ai_career_compass_api_base', clean);
    return clean;
  } catch {
    return DEFAULT_API_BASE_URL;
  }
};

export const resetApiBaseUrl = () => {
  try {
    localStorage.setItem('ai_career_compass_api_base', DEFAULT_API_BASE_URL);
  } catch {
    // ignore
  }
  return DEFAULT_API_BASE_URL;
};

/**
 * Common HTTP request handler
 */
export async function apiRequest(endpoint, bodyPayload) {
  const baseUrl = getApiBaseUrl();
  // Ensure single slash between base and endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });
  } catch (networkErr) {
    throw new ApiError(
      `Unable to reach the backend service at ${url}. Please verify your network connection or backend availability.`,
      {
        endpoint: cleanEndpoint,
        payload: bodyPayload,
        isNetworkError: true,
        raw: networkErr?.message || String(networkErr),
      }
    );
  }

  let rawText = '';
  try {
    rawText = await response.text();
  } catch {
    throw new ApiError(`Failed to read response stream from ${cleanEndpoint}.`, {
      status: response.status,
      endpoint: cleanEndpoint,
      payload: bodyPayload,
    });
  }

  let parsedData = null;
  if (rawText && rawText.trim().length > 0) {
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      throw new ApiError(
        `Received non-JSON response from ${cleanEndpoint} (HTTP ${response.status}).`,
        {
          status: response.status,
          endpoint: cleanEndpoint,
          payload: bodyPayload,
          raw: rawText.slice(0, 300),
        }
      );
    }
  } else {
    throw new ApiError(
      `Received an empty response from ${cleanEndpoint} (HTTP ${response.status}).`,
      {
        status: response.status,
        endpoint: cleanEndpoint,
        payload: bodyPayload,
      }
    );
  }

  // Handle HTTP error codes (400, 404, 500, etc.)
  if (!response.ok) {
    const serverMessage =
      parsedData?.error ||
      parsedData?.message ||
      parsedData?.detail ||
      `Server returned HTTP ${response.status} (${response.statusText || 'Error'})`;
    throw new ApiError(serverMessage, {
      status: response.status,
      endpoint: cleanEndpoint,
      payload: bodyPayload,
      raw: parsedData,
    });
  }

  // Handle explicit { success: false } in a 200 response
  if (parsedData && typeof parsedData === 'object' && parsedData.success === false) {
    const failureMessage =
      parsedData.error ||
      parsedData.message ||
      parsedData.detail ||
      'The AI service reported an error processing your request.';
    throw new ApiError(failureMessage, {
      status: response.status,
      endpoint: cleanEndpoint,
      payload: bodyPayload,
      raw: parsedData,
    });
  }

  return parsedData;
}

/**
 * AI Career Compass Service
 */
export const careerApiService = {
  /**
   * Endpoint 1: Career Recommendation
   * POST /api/career/recommend
   * @param {Object} payload
   * @param {string[]} payload.skills
   * @param {string[]} payload.interests
   * @param {string} payload.education
   * @param {string} payload.experience_level ('beginner' | 'intermediate' | 'advanced')
   */
  recommendCareers: (payload) =>
    apiRequest('/career/recommend', {
      skills: Array.isArray(payload.skills) ? payload.skills : [],
      interests: Array.isArray(payload.interests) ? payload.interests : [],
      education: String(payload.education || '').trim(),
      experience_level: String(payload.experience_level || 'beginner').toLowerCase().trim(),
    }),

  /**
   * Endpoint 2: Skill Gap Analysis
   * POST /api/skill/gap-analysis
   * @param {Object} payload
   * @param {string[]} payload.current_skills
   * @param {string} payload.target_career
   */
  analyzeSkillGap: (payload) =>
    apiRequest('/skill/gap-analysis', {
      current_skills: Array.isArray(payload.current_skills) ? payload.current_skills : [],
      target_career: String(payload.target_career || '').trim(),
    }),

  /**
   * Endpoint 3: Learning Roadmap Generation
   * POST /api/roadmap/generate
   * @param {Object} payload
   * @param {string} payload.target_career
   * @param {string[]} payload.current_skills
   * @param {number} [payload.timeline_months=6]
   */
  generateRoadmap: (payload) =>
    apiRequest('/roadmap/generate', {
      target_career: String(payload.target_career || '').trim(),
      current_skills: Array.isArray(payload.current_skills) ? payload.current_skills : [],
      timeline_months: Number(payload.timeline_months) || 6,
    }),

  /**
   * Endpoint 4: Career Comparison
   * POST /api/guidance/compare
   * @param {Object} payload
   * @param {string[]} payload.careers
   */
  compareCareers: (payload) =>
    apiRequest('/guidance/compare', {
      careers: Array.isArray(payload.careers) ? payload.careers : [],
    }),

  /**
   * Endpoint 5: AI Career Guidance
   * POST /api/guidance/advice
   * @param {Object} payload
   * @param {string} payload.question
   * @param {Object} [payload.context]
   * @param {string[]} [payload.context.skills]
   * @param {string} [payload.context.education]
   * @param {string[]} [payload.context.interests]
   */
  getCareerAdvice: (payload) =>
    apiRequest('/guidance/advice', {
      question: String(payload.question || '').trim(),
      context: {
        skills: Array.isArray(payload.context?.skills) ? payload.context.skills : [],
        education: String(payload.context?.education || '').trim(),
        interests: Array.isArray(payload.context?.interests) ? payload.context.interests : [],
      },
    }),
};
