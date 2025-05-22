resource "aws_lb" "kubernetes-nlb" {
  name                             = "kubernetes-nlb"
  internal                         = false
  load_balancer_type               = "network"
  subnets                          = [aws_subnet.public-a.id, aws_subnet.public-b.id, aws_subnet.public-c.id]
  enable_cross_zone_load_balancing = true
  enable_deletion_protection       = false
}

resource "aws_lb_listener" "listener-nlb" {
  load_balancer_arn = aws_lb.kubernetes-nlb.arn
  port              = "80"
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.worker-node-target-group.arn
  }
}

resource "aws_lb_target_group" "worker-node-target-group" {
  name     = "worker-node-target-group"
  port     = 30080
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
}