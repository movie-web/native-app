import { TMDB } from "tmdb-ts";

const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYTM1ZTgyMzE4OTc0NTgxNDJmZjljZTE4ODExNWRlNiIsInN1YiI6IjY0OTM0ZDQ1ODliNTYxMDExYzliZDVhMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.AzWnIcxPNgDwGdzeIZ_C3mRC_5_qy-Z-SRPglLjzlNc";
export const tmdb = new TMDB(TMDB_API_KEY);

export function getMediaPoster(posterPath: string): string {
  return `https://image.tmdb.org/t/p/w500/${posterPath}`;
}
