import { BASE_URL } from "../static/const";
import {
  RequestSignInCredential,
  RequestSignInWithProviders,
  RequestSignUpCredential,
  ResponseAuth,
} from "@/types/api/auth";
import axios from "axios";

export async function signInWithCredential(req: RequestSignInCredential) {
  if (!BASE_URL) {
    throw new Error('API URL is not configured');
  }

  const authUrl = `${BASE_URL}auth/local`;
  
  try {
    const response = await axios.post(authUrl, {
      identifier: req.email,
      password: req.password,
    }, { timeout: 10000 });

    if (!response?.data?.user || !response?.data?.jwt) {
      throw new Error('Invalid response from server');
    }

    return response.data as ResponseAuth;
  } catch (error: any) {
    // Retry once on network errors or 500 errors
    if ((!error?.response || error?.response?.status === 500 || error?.code === 'ECONNABORTED') && !error?.retried) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const retryResponse = await axios.post(authUrl, {
          identifier: req.email,
          password: req.password,
        }, { timeout: 10000 });
        
        if (retryResponse?.data?.user && retryResponse?.data?.jwt) {
          return retryResponse.data as ResponseAuth;
        }
      } catch {
        // Continue to error handling
      }
    }

    // Handle errors
    if (error?.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 400 || status === 401) {
        throw new Error(errorData?.error?.message || 'Invalid email or password');
      }
      
      throw new Error(errorData?.error?.message || `Server error (${status})`);
    }
    
    throw new Error(error?.message || 'Failed to authenticate');
  }
}

export async function signInWithProviders(req: RequestSignInWithProviders) {
  try {
    const response: {
      data: ResponseAuth;
    } = await axios.get(
      `${BASE_URL}auth/${req?.provider}/callback?access_token=${req?.access_token}`
    );

    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw error.response.data.error.message;
    } else {
      throw error;
    }
  }
}

export async function signUpWithCredential(data: RequestSignUpCredential) {
  try {
    const response: ResponseAuth = await axios.post(
      `${BASE_URL}auth/local/register`,
      {
        name: data.name,
        email: data.email,
        username: data.email,
        password: data.password,
      }
    );

    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw error.response.data.error.message;
    } else {
      throw error;
    }
  }
}
