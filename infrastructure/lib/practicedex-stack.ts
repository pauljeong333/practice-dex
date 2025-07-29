import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";

const backendDir = join(__dirname, "..", "..", "backend");

export class PracticeDexStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define Tables and Lambdas related to Practice Sessions
    const sessionsTable = new dynamodb.Table(this, "PracticeSessions", {
      tableName: "PracticeDexSessions",
      partitionKey: { name: "session_id", type: dynamodb.AttributeType.STRING },
    });

    const createSessionLambda = new lambda.Function(
      this,
      "CreatePracticeSession",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler.handler",
        code: lambda.Code.fromAsset(
          "../backend/functions/createPracticeSession"
        ),
        environment: {
          SESSIONS_TABLE: sessionsTable.tableName,
        },
      }
    );

    sessionsTable.grantWriteData(createSessionLambda);

    new apigw.LambdaRestApi(this, "PracticeDexAPI", {
      handler: createSessionLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    // Define Tables and Lambdas related to Users
    const usersTable = new dynamodb.Table(this, "Users", {
      tableName: "PracticeDexUsers",
      partitionKey: { name: "uid", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "email", type: dynamodb.AttributeType.STRING },
    });

    // Lambda Function with automatic TypeScript compilation
    const syncUserLambda = new NodejsFunction(this, "SyncUserOnSignup", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join(backendDir, "functions", "syncUserOnSignup", "handler.ts"),
      // Path to your TS file
      handler: "handler", // Exported function name
      environment: {
        USERS_TABLE: usersTable.tableName,
      },
      bundling: {
        externalModules: [
          "@aws-sdk/client-dynamodb", // Mark AWS SDK as external (already available in Lambda)
        ],
        minify: true, // Minify code
        sourceMap: true, // Include source maps
        target: "node20", // Target Node.js version
      },
      timeout: cdk.Duration.seconds(30),
    });

    usersTable.grantWriteData(syncUserLambda);

    // Optional: expose via API Gateway
    const userApi = new apigw.LambdaRestApi(this, "UserSyncAPI", {
      handler: syncUserLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS, // Allows all domains (adjust for production)
        allowMethods: apigw.Cors.ALL_METHODS, // Allows GET, POST, etc.
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });
  }
}
