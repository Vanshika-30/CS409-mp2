import axios from "axios";
import { SearchResponse, AssetResponse } from "./nasaTypes";

class NasaClient {
  private imagesClient: ReturnType<typeof axios.create>;

  constructor() {

    this.imagesClient = axios.create({
      baseURL: "https://images-api.nasa.gov/",
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
