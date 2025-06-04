resource "aws_lb" "kubernetes-nlb" {
  name                             = "kubernetes-nlb"
  internal                         = false
  load_balancer_type               = "network"
  subnets                          = [aws_subnet.public-a.id, aws_subnet.public-b.id, aws_subnet.public-c.id]
  enable_cross_zone_load_balancing = true
  enable_deletion_protection       = false

  tags = {
    Name        = "kubernetes-nlb"
    Environment = "production"
  }
}

resource "aws_lb_listener" "listener-nlb-https" {
  load_balancer_arn = aws_lb.kubernetes-nlb.arn
  port              = "30443"
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.worker-node-https-target-group.arn
  }
}

resource "aws_lb_listener" "listener-nlb-http" {
  load_balancer_arn = aws_lb.kubernetes-nlb.arn
  port              = "433"
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.worker-node-http-target-group.arn
  }
}

resource "aws_lb_target_group" "worker-node-https-target-group" {
  name     = "worker-node-https-tg"
  port     = 30443
  protocol = "TCP"
  vpc_id   = aws_vpc.kubernetes-vpc.id

  health_check {
    healthy_threshold   = 3
    interval            = 30
    timeout             = 5
    protocol            = "TCP"
    port                = 30443
    unhealthy_threshold = 3
  }

  tags = {
    Name = "worker-node-https-target-group"
  }
}

resource "aws_lb_target_group" "worker-node-http-target-group" {
  name     = "worker-node-http-tg"
  port     = 8080
  protocol = "TCP"
  vpc_id   = aws_vpc.kubernetes-vpc.id

  health_check {
    healthy_threshold   = 3
    interval            = 30
    timeout             = 5
    protocol            = "TCP"
    port                = 30080
    unhealthy_threshold = 3
  }

  tags = {
    Name = "worker-node-http-target-group"
  }
}
output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.kubernetes-nlb.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.kubernetes-nlb.zone_id
}