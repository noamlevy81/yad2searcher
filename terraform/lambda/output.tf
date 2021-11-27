output "function_name" {
  value = var.lambda_name
}

output "invoke_arn" {
  value = aws_lambda_function.lambda.invoke_arn
}

output "arn" {
  value = aws_lambda_function.lambda.arn
}

output "p" {
  value = path.cwd
}