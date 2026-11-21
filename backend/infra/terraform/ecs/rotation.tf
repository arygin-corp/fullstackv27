data "archive_file" "secret_rotation" {
  type        = "zip"
  source_file = "${path.module}/lambda/secret_rotation.py"
  output_path = "${path.module}/lambda/secret_rotation.zip"
}

data "aws_iam_policy_document" "secret_rotation_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "secret_rotation" {
  name               = "edmp-gdxp-admin-nonprod-secret-rotation"
  assume_role_policy = data.aws_iam_policy_document.secret_rotation_assume.json
}

resource "aws_iam_role_policy_attachment" "secret_rotation_logs" {
  role       = aws_iam_role.secret_rotation.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "secret_rotation" {
  name              = "/aws/lambda/edmp-gdxp-admin-nonprod-secret-rotation"
  retention_in_days = 30
}

resource "aws_lambda_function" "secret_rotation" {
  function_name = "edmp-gdxp-admin-nonprod-secret-rotation"
  role          = aws_iam_role.secret_rotation.arn
  runtime       = "python3.12"
  handler       = "secret_rotation.lambda_handler"
  timeout       = 30
  memory_size   = 128

  filename         = data.archive_file.secret_rotation.output_path
  source_code_hash = data.archive_file.secret_rotation.output_base64sha256

  depends_on = [
    aws_iam_role_policy_attachment.secret_rotation_logs,
    aws_cloudwatch_log_group.secret_rotation,
  ]
}
