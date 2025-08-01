import * as admin from "firebase-admin";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Initialize clients outside handler (reuse across invocations)
const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});
let firebaseApp: admin.app.App;

/**
 * Cached secret retrieval with error handling
 */
const getFirebaseSecret = async () => {
  try {
    const secretResponse = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: process.env.SECRET_NAME,
      })
    );

    if (!secretResponse.SecretString) {
      throw new Error("Secret string is empty");
    }

    return JSON.parse(secretResponse.SecretString) as {
      FIREBASE_PROJECT_ID: string;
    };
  } catch (error) {
    console.error("Secret retrieval failed:", error);
    throw new Error("Authentication configuration error");
  }
};

/**
 * Verifies Firebase ID token with proper error handling
 */
export const verifyUser = async (event: any) => {
  try {
    // Initialize Firebase (once per container)
    if (!firebaseApp) {
      const secret = await getFirebaseSecret();
      firebaseApp = admin.initializeApp({
        projectId: secret.FIREBASE_PROJECT_ID,
        credential: admin.credential.applicationDefault(),
      });
    }

    // Validate auth header
    const authHeader =
      event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing or invalid Authorization header");
    }

    // Verify token
    const idToken = authHeader.split("Bearer ")[1];
    return await firebaseApp.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};
