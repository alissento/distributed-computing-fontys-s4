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
    name                   = aws_lb.kubernetes-alb.dns_name
    zone_id                = aws_lb.kubernetes-alb.zone_id
    evaluate_target_health = true
  }
}

# API subdomain record pointing to load balancer
resource "aws_route53_record" "api-subdomain" {
  zone_id = aws_route53_zone.hosted-zone.zone_id
  name    = "api.norbertknez.me"
  type    = "A"

  alias {
    name                   = aws_lb.kubernetes-alb.dns_name
    zone_id                = aws_lb.kubernetes-alb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_acm_certificate" "tls-cert-http" {
  domain_name               = "norbertknez.me"
  subject_alternative_names = ["api.norbertknez.me", "monitoring.norbertknez.me"]
  validation_method         = "DNS"

  tags = {
    Name = "norbertknez.me certificate"
  }
}

resource "aws_route53_record" "tls-cert-validation-cname-http" {

  for_each = {
    for dvo in aws_acm_certificate.tls-cert-http.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = aws_route53_zone.hosted-zone.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.value]

  depends_on = [aws_acm_certificate.tls-cert-http, aws_route53_zone.hosted-zone]
}

resource "aws_acm_certificate_validation" "tls-cert-validation-http" {
  certificate_arn         = aws_acm_certificate.tls-cert-http.arn
  validation_record_fqdns = [for record in aws_route53_record.tls-cert-validation-cname-http : record.fqdn]

  depends_on = [aws_acm_certificate.tls-cert-http, aws_route53_record.tls-cert-validation-cname-http]
}