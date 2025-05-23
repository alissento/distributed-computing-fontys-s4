
resource "aws_cloudwatch_log_group" "ec2_log_group" {
  name              = "/aws/ec2/instances"
  retention_in_days = 14
}

resource "aws_cloudwatch_metric_alarm" "cpu_utilization_alarm" {
  alarm_name                = "high-cpu-utilization"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = 1
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/EC2"
  period                    = 60
  statistic                 = "Average"
  threshold                 = 75
  alarm_description         = "This metric monitors ec2 cpu utilization"
  actions_enabled           = true
  alarm_actions             = [aws_sns_topic.sns_topic.arn]
  ok_actions                = [aws_sns_topic.sns_topic.arn]
  insufficient_data_actions = [aws_sns_topic.sns_topic.arn]
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.worker-node-asg.name
  }
}

resource "aws_cloudwatch_metric_alarm" "disk_read_ops_alarm" {
  alarm_name                = "high-disk-read-ops"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = 1
  metric_name               = "DiskReadOps"
  namespace                 = "AWS/EC2"
  period                    = 60
  statistic                 = "Average"
  threshold                 = 100
  alarm_description         = "This metric monitors ec2 disk read operations"
  actions_enabled           = true
  alarm_actions             = [aws_sns_topic.sns_topic.arn]
  ok_actions                = [aws_sns_topic.sns_topic.arn]
  insufficient_data_actions = [aws_sns_topic.sns_topic.arn]
  dimensions = {
    InstanceId = aws_instance.control-plane.id
  }
}

resource "aws_sns_topic" "sns_topic" {
  name = "ec2-monitoring-topic"
}
