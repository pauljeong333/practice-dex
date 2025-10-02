import { sha1 } from "js-sha1";

export function generateGoalId(goalText: string): string {
  return sha1(goalText.toLowerCase().trim()).slice(0, 8);
}
