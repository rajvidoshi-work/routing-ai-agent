#!/usr/bin/env python3
"""
AWS CDK deployment for Routing AI Agent
"""
import aws_cdk as cdk
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_s3 as s3,
    aws_iam as iam,
    Duration,
    RemovalPolicy
)
from constructs import Construct

class RoutingAiAgentStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # S3 bucket for storing patient data files
        data_bucket = s3.Bucket(
            self, "RoutingAiDataBucket",
            bucket_name=f"routing-ai-agent-data-{self.account}",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        # Lambda function
        lambda_function = _lambda.DockerImageFunction(
            self, "RoutingAiAgentFunction",
            code=_lambda.DockerImageCode.from_image_asset("../", file="Dockerfile.aws"),
            timeout=Duration.minutes(15),
            memory_size=2048,
            environment={
                "DATA_BUCKET": data_bucket.bucket_name,
                "PYTHONPATH": "/var/task"
            }
        )

        # Grant Lambda permissions to access S3 bucket
        data_bucket.grant_read_write(lambda_function)

        # API Gateway
        api = apigateway.LambdaRestApi(
            self, "RoutingAiAgentApi",
            handler=lambda_function,
            proxy=True,
            cors_options=apigateway.CorsOptions(
                allow_origins=["*"],
                allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allow_headers=["Content-Type", "Authorization"]
            )
        )

        # Output the API URL
        cdk.CfnOutput(
            self, "ApiUrl",
            value=api.url,
            description="API Gateway URL"
        )

        # Output the S3 bucket name
        cdk.CfnOutput(
            self, "DataBucket",
            value=data_bucket.bucket_name,
            description="S3 bucket for patient data"
        )

app = cdk.App()
RoutingAiAgentStack(app, "RoutingAiAgentStack")
app.synth()
