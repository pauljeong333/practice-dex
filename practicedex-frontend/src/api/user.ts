import { API } from "../enums/api";

export const getUserField = async (
  field: string,
  idToken: string
): Promise<unknown> => {
  const response = await fetch(
    `${API.GET_USER_FIELD}getUserField?field=${field}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch user field");
  }

  const data = await response.json();
  return data[field];
};
