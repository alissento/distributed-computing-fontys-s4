resource "aws_route53_zone" "hosted-zone" {
  name = "norbertknez.me"
}

resource "aws_route53_record" "http-record" {
  zone_id = aws_route53_zone.hosted-zone.zone_id
  name    = "norbertknez.me"
  type    = "A"

  alias {
    name                   = aws_lb.kubernetes-nlb.dns_name
    zone_id                = aws_lb.kubernetes-nlb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api-record" {
  zone_id = aws_route53_zone.hosted-zone.zone_id
  name    = "api.norbertknez.me"
  type    = "A"

  alias {
    name                   = aws_lb.kubernetes-nlb.dns_name
    zone_id                = aws_lb.kubernetes-nlb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_acm_certificate" "tls-cert-http" {
  domain_name       = "norbertknez.me"
  validation_method = "DNS"

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

resource "aws_acm_certificate" "tls-cert-api" {
  domain_name       = "api.norbertknez.me"
  validation_method = "DNS"

  tags = {
    Name = "api.norbertknez.me certificate"
  }

  depends_on = [ aws_route53_zone.hosted-zone ]
}

resource "aws_route53_record" "tls-cert-api-validation-cname" {
  for_each = {
    for dvo in aws_acm_certificate.tls-cert-api.domain_validation_options :
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

  depends_on = [aws_acm_certificate.tls-cert-api, aws_route53_zone.hosted-zone]
}

resource "aws_acm_certificate_validation" "tls-cert-api-validation" {
  certificate_arn         = aws_acm_certificate.tls-cert-api.arn
  validation_record_fqdns = [for record in aws_route53_record.tls-cert-api-validation-cname : record.fqdn]

  depends_on = [aws_acm_certificate.tls-cert-api, aws_route53_record.tls-cert-api-validation-cname]
}
