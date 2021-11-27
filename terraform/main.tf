# the cloud provider we want Terraform to work with
provider "aws" {
  region  = "eu-west-1"
  profile = "noam_private"
}

# our bucket in s3
resource "aws_s3_bucket" "yad2bucket" {
  bucket = "yad2-results"

  acl  = "public-read-write"
  tags = {
    Name = "yad2-results"
  }
}

module "search_lambda" {
  source = "./lambda"

  lambda_name    = "yad2lambda"
  lambda_handler = "src/functions/search.search"
  lambda_role    = aws_iam_role.lambda_exec_role.arn
}

resource "aws_cloudwatch_event_rule" "every_x" {
  name                = "lambda_event"
  description         = "Fires every x"
  schedule_expression = "rate(${var.lambda_fire_interval} minutes)"
}

resource "aws_cloudwatch_event_target" "trigger_every_five_minutes" {
  rule      = aws_cloudwatch_event_rule.every_x.name
  target_id = "search_lambda"
  arn       = module.search_lambda.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.search_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_x.arn
  depends_on = [module.search_lambda]

}

resource "aws_iam_role" "lambda_exec_role" {
  name               = "lambda-assume-role"
  description        = "Allows Lambda Function to call AWS services on your behalf."
  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
POLICY

}

resource "aws_iam_role_policy" "lambda_s3_permission" {
  role   = aws_iam_role.lambda_exec_role.id
  policy = <<EOF
{
"Version": "2012-10-17",
    "Statement": [
        {
        "Effect": "Allow",
        "Action": "s3:*",
        "Resource": "*"
        },
        {
        "Effect": "Allow",
        "Action":
        "secretsmanager:GetSecretValue",
      "Resource": "*"
        }
    ]
}
EOF
}