"""
AWS Lambda handler for FastAPI application
"""
import json
from mangum import Mangum
from app.main import app

# Create the Mangum handler
handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    """
    AWS Lambda handler function
    """
    return handler(event, context)
