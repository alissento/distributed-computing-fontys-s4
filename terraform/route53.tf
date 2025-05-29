resource "aws_route53_zone" "hosted-zone" {
  name = "norbertknez.me"

  tags = {
    Name        = "norbertknez.me hosted zone"
    Environment = "production"
  }
}

# Main domain record pointing to load balancer
resource "aws_route53_record" "main-domain" {
  zone_id = aws_route53_zone.hosted-zone.zone_id
  name    = "norbertknez.me"
  type    = "A"

  alias {
    name                   = aws_lb.kubernetes-nlb.dns_name
    zone_id                = aws_lb.kubernetes-nlb.zone_id
    evaluate_target_health = true
  }
}

# API subdomain record pointing to load balancer
resource "aws_route53_record" "api-subdomain" {
  zone_id = aws_route53_zone.hosted-zone.zone_id
  name    = "api.norbertknez.me"
  type    = "A"

  alias {
    name                   = aws_lb.kubernetes-nlb.dns_name
    zone_id                = aws_lb.kubernetes-nlb.zone_id
    evaluate_target_health = true
  }
}