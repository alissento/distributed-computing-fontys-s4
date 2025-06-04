resource "aws_lb" "kubernetes-alb" {
  name               = "kubernetes-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public-a.id, aws_subnet.public-b.id, aws_subnet.public-c.id]

  enable_deletion_protection = false

  tags = {
    Name        = "kubernetes-alb"
    Environment = "production"
  }
}

resource "aws_security_group" "alb_sg" {
  name_prefix = "alb-sg"
  vpc_id      = aws_vpc.kubernetes-vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Single HTTPS listener with host-based routing
resource "aws_lb_listener" "listener-alb-https" {
  load_balancer_arn = aws_lb.kubernetes-alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate_validation.tls-cert-validation-http.certificate_arn

  # Default action for main domain
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.worker-node-https-target-group.arn
  }
}

# Rule for API subdomain
resource "aws_lb_listener_rule" "api_rule" {
  listener_arn = aws_lb_listener.listener-alb-https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.worker-node-api-target-group.arn
  }

  condition {
    host_header {
      values = ["api.norbertknez.me"]
    }
  }
}

# HTTP redirect
resource "aws_lb_listener" "listener-alb-http" {
  load_balancer_arn = aws_lb.kubernetes-alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_target_group" "worker-node-https-target-group" {
  name     = "worker-node-https-tg"
  port     = 30443
  protocol = "HTTP"
  vpc_id   = aws_vpc.kubernetes-vpc.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
}

resource "aws_lb_target_group" "worker-node-api-target-group" {
  name     = "worker-node-api-tg"
  port     = 30080
  protocol = "HTTP"
  vpc_id   = aws_vpc.kubernetes-vpc.id

  health_check {
    enabled             = false
  }
}

output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.kubernetes-alb.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.kubernetes-alb.zone_id
}