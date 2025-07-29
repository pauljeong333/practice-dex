import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

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
    });

    // Define Tables and Lambdas related to Users
    const usersTable = new dynamodb.Table(this, "Users", {
      tableName: "PracticeDexUsers",
      partitionKey: { name: "uid", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "email", type: dynamodb.AttributeType.STRING },
    });

    const syncUserLambda = new lambda.Function(this, "SyncUserOnSignup", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handler.handler",
      code: lambda.Code.fromAsset("../backend/functions/syncUserOnSignup"),
      environment: {
        USERS_TABLE: usersTable.tableName,
      },
    });

    usersTable.grantWriteData(syncUserLambda);

    // Optional: expose via API Gateway
    const userApi = new apigw.LambdaRestApi(this, "UserSyncAPI", {
      handler: syncUserLambda,
    });
  }
}
