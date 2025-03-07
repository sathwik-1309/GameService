import axios, { AxiosResponse } from 'axios';

export class ApiService {
  public static async post(url: string, data: any): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`API Error: ${error}`);
      throw new Error(`API call failed: ${error}`);
    }
  }
}