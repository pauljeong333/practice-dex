import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class PracticeDexStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sessionsTable = new dynamodb.Table(this, "PracticeSessions", {
      partitionKey: { name: "session_id", type: dynamodb.AttributeType.STRING },
    });

    const createSessionLambda = new lambda.Function(
      this,
      "CreatePracticeSession",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
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
  }
}
