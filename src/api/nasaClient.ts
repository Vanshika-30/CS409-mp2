import axios from "axios";
import { SearchResponse, AssetResponse } from "./nasaTypes";

class NasaClient {
  private imagesClient: ReturnType<typeof axios.create>;
  private apodClient: ReturnType<typeof axios.create>;
  private apiKey: string;

  constructor(apiKey: string = process.env.NASA_API_KEY || "DEMO_KEY") {
    this.apiKey = apiKey;

    this.imagesClient = axios.create({
      baseURL: "https://images-api.nasa.gov/",
      headers: { "Content-Type": "application/json" },
    });

    this.apodClient = axios.create({
      baseURL: "https://api.nasa.gov/planetary/",
      headers: { "Content-Type": "application/json" },
    });
  }

  // -------- NASA Images API --------
  async searchImages(query: string, mediaType: "image" | "audio" | "video" = "image") {
    const res = await this.imagesClient.get<SearchResponse>("search", {
      params: { q: query, media_type: mediaType },
    });
    return res.data.collection.items;
  }

  async getImageAsset(nasaId: string) {
    const res = await this.imagesClient.get<AssetResponse>(`asset/${nasaId}`);
    return res.data.collection.items.map(i => i.href);
  }
}

export default NasaClient;
