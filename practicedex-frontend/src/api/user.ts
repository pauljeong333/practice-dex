export const getUserField = async (
  field: string,
  idToken: string
): Promise<unknown> => {
  const response = await fetch(
    `https://6jgm1idcle.execute-api.us-east-1.amazonaws.com/prod/getUserField?field=${field}`,
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
