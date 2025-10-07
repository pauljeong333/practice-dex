import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";

const backendDir = join(__dirname, "..", "..", "backend");

export class PracticeDexStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const firebaseSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "FirebaseSecret",
      "firebase/project_config"
    );

    const accountId = cdk.Aws.ACCOUNT_ID;
    const region = cdk.Aws.REGION;

    const usersTable = new dynamodb.Table(this, "Users", {
      tableName: "PracticeDexUsers",
      partitionKey: { name: "uid", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const syncUserLambda = new NodejsFunction(this, "SyncUserOnSignup", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join(backendDir, "functions", "syncUserOnSignup", "handler.ts"),
      handler: "handler",
      environment: {
        USERS_TABLE: usersTable.tableName,
        SECRET_NAME: firebaseSecret.secretName,
      },
      bundling: {
        externalModules: ["@aws-sdk/client-dynamodb"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      timeout: cdk.Duration.seconds(30),
    });

    const getUserFieldLambda = new NodejsFunction(this, "getUserField", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join(backendDir, "functions", "getUserField", "handler.ts"),
      handler: "handler",
      environment: {
        USERS_TABLE: usersTable.tableName,
        SECRET_NAME: firebaseSecret.secretName,
      },
      bundling: {
        externalModules: ["@aws-sdk/client-dynamodb"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      timeout: cdk.Duration.seconds(30),
    });

    const updateUserFieldLambda = new NodejsFunction(this, "UpdateUserField", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join(backendDir, "functions", "updateUserField", "handler.ts"),
      handler: "handler",
      environment: {
        USERS_TABLE: usersTable.tableName,
        SECRET_NAME: firebaseSecret.secretName,
      },
      bundling: {
        externalModules: ["@aws-sdk/client-dynamodb"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      timeout: cdk.Duration.seconds(30),
    });

    usersTable.grantWriteData(syncUserLambda);
    usersTable.grantWriteData(getUserFieldLambda);
    usersTable.grantWriteData(updateUserFieldLambda);
    usersTable.grantReadData(getUserFieldLambda);

    firebaseSecret.grantRead(syncUserLambda);
    firebaseSecret.grantRead(getUserFieldLambda);
    firebaseSecret.grantRead(updateUserFieldLambda);

    new apigw.LambdaRestApi(this, "UserSyncAPI", {
      handler: syncUserLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    new apigw.LambdaRestApi(this, "UserFieldAPI", {
      handler: getUserFieldLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    new apigw.LambdaRestApi(this, "UpdateUserFieldAPI", {
      handler: updateUserFieldLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    const sessionsTable = new dynamodb.Table(this, "PracticeSessions", {
      tableName: "PracticeDexSessions",
      partitionKey: { name: "session_id", type: dynamodb.AttributeType.STRING },
    });

    sessionsTable.addGlobalSecondaryIndex({
      indexName: "UidDateCreatedIndex",
      partitionKey: { name: "uid", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "dateCreated", type: dynamodb.AttributeType.STRING },
    });

    sessionsTable.addGlobalSecondaryIndex({
      indexName: "UidStatusDateCreatedIndex",
      partitionKey: { name: "uid_status", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "dateCreated", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    sessionsTable.addGlobalSecondaryIndex({
      indexName: "UidStatusScheduledForIndex",
      partitionKey: { name: "uid_status", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "scheduledFor", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const createSessionLambda = new NodejsFunction(
      this,
      "CreatePracticeSession",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: join(
          backendDir,
          "functions",
          "createPracticeSession",
          "handler.ts"
        ),
        // Path to your TS file
        handler: "handler", // Exported function name
        environment: {
          SESSIONS_TABLE: sessionsTable.tableName,
          SECRET_NAME: firebaseSecret.secretName,
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
      }
    );

    const getRecommendedSessionLambda = new NodejsFunction(
      this,
      "getRecommendedSession",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: join(
          backendDir,
          "functions",
          "getRecommendedSession",
          "handler.ts"
        ),
        handler: "handler",
        environment: {
          USERS_TABLE: usersTable.tableName,
          SESSIONS_TABLE: sessionsTable.tableName,
          SECRET_NAME: firebaseSecret.secretName,
          OPENAI_KEY_PARAM_NAME: "/openai/api-key",
        },
        bundling: {
          externalModules: ["@aws-sdk/client-dynamodb"],
          minify: true,
          sourceMap: true,
          target: "node20",
        },
        timeout: cdk.Duration.seconds(30),
      }
    );

    const getSessionLambda = new NodejsFunction(this, "getSession", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join(backendDir, "functions", "getSession", "handler.ts"),
      handler: "handler",
      environment: {
        SESSIONS_TABLE: sessionsTable.tableName,
        SECRET_NAME: firebaseSecret.secretName,
      },
      bundling: {
        externalModules: ["@aws-sdk/client-dynamodb"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      timeout: cdk.Duration.seconds(30),
    });

    const scheduleSessionLambda = new NodejsFunction(
      this,
      "schedulePracticeSession",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: join(
          backendDir,
          "functions",
          "schedulePracticeSession",
          "handler.ts"
        ),
        handler: "handler",
        environment: {
          SESSIONS_TABLE: sessionsTable.tableName,
          SECRET_NAME: firebaseSecret.secretName,
        },
        bundling: {
          externalModules: ["@aws-sdk/client-dynamodb"],
          minify: true,
          sourceMap: true,
          target: "node20",
        },
        timeout: cdk.Duration.seconds(30),
      }
    );

    const updateSessionLambda = new NodejsFunction(this, "updateSession", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join(backendDir, "functions", "updateSession", "handler.ts"),
      handler: "handler",
      environment: {
        SESSIONS_TABLE: sessionsTable.tableName,
        SECRET_NAME: firebaseSecret.secretName,
      },
      bundling: {
        externalModules: ["@aws-sdk/client-dynamodb"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      timeout: cdk.Duration.seconds(30),
    });

    const getUserSessionsLambda = new NodejsFunction(this, "getUserSessions", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join(backendDir, "functions", "getUserSessions", "handler.ts"),
      handler: "handler",
      environment: {
        SESSIONS_TABLE: sessionsTable.tableName,
        SECRET_NAME: firebaseSecret.secretName,
      },
      bundling: {
        externalModules: ["@aws-sdk/client-dynamodb"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      timeout: cdk.Duration.seconds(30),
    });

    const getScheduledSessionsLambda = new NodejsFunction(
      this,
      "getScheduledSessions",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: join(
          backendDir,
          "functions",
          "getScheduledSessions",
          "handler.ts"
        ),
        handler: "handler",
        environment: {
          SESSIONS_TABLE: sessionsTable.tableName,
          SECRET_NAME: firebaseSecret.secretName,
        },
        bundling: {
          externalModules: ["@aws-sdk/client-dynamodb"],
          minify: true,
          sourceMap: true,
          target: "node20",
        },
        timeout: cdk.Duration.seconds(30),
      }
    );

    const updateUserStreakPreferencesLambda = new NodejsFunction(
      this,
      "updateUserStreakPreferences",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: join(
          backendDir,
          "functions",
          "updateUserStreakPreferences",
          "handler.ts"
        ),
        handler: "handler",
        environment: {
          SESSIONS_TABLE: sessionsTable.tableName,
          USERS_TABLE: usersTable.tableName,
          SECRET_NAME: firebaseSecret.secretName,
        },
        bundling: {
          externalModules: ["@aws-sdk/client-dynamodb"],
          minify: true,
          sourceMap: true,
          target: "node20",
        },
        timeout: cdk.Duration.seconds(30),
      }
    );

    sessionsTable.grantWriteData(createSessionLambda);
    sessionsTable.grantReadData(getSessionLambda);
    sessionsTable.grantWriteData(scheduleSessionLambda);
    sessionsTable.grantWriteData(updateSessionLambda);
    sessionsTable.grantReadData(getUserSessionsLambda);
    sessionsTable.grantReadData(getScheduledSessionsLambda);
    sessionsTable.grantReadData(updateUserStreakPreferencesLambda);
    usersTable.grantReadData(updateUserStreakPreferencesLambda);
    usersTable.grantWriteData(updateUserStreakPreferencesLambda);
    usersTable.grantReadData(getRecommendedSessionLambda);
    sessionsTable.grantReadData(getRecommendedSessionLambda);

    firebaseSecret.grantRead(createSessionLambda);
    firebaseSecret.grantRead(getSessionLambda);
    firebaseSecret.grantRead(scheduleSessionLambda);
    firebaseSecret.grantRead(updateSessionLambda);
    firebaseSecret.grantRead(getUserSessionsLambda);
    firebaseSecret.grantRead(getScheduledSessionsLambda);
    firebaseSecret.grantRead(updateUserStreakPreferencesLambda);
    firebaseSecret.grantRead(getRecommendedSessionLambda);

    getRecommendedSessionLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter", "kms:Decrypt"],
        resources: [
          `arn:aws:ssm:${region}:${accountId}:parameter/openai/api-key`,
        ],
      })
    );

    new apigw.LambdaRestApi(this, "CreateSessionAPI", {
      handler: createSessionLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    new apigw.LambdaRestApi(this, "GetRecommendedSessionAPI", {
      handler: getRecommendedSessionLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    new apigw.LambdaRestApi(this, "GetSessionAPI", {
      handler: getSessionLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    new apigw.LambdaRestApi(this, "ScheduleSessionAPI", {
      handler: scheduleSessionLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    new apigw.LambdaRestApi(this, "UpdateSessionAPI", {
      handler: updateSessionLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    new apigw.LambdaRestApi(this, "updateUserStreakPreferencesAPI", {
      handler: updateUserStreakPreferencesLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    new apigw.LambdaRestApi(this, "GetUserSessionsAPI", {
      handler: getUserSessionsLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    new apigw.LambdaRestApi(this, "GetScheduledSessionsAPI", {
      handler: getScheduledSessionsLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });
  }
}
