resource "aws_route53_zone" "hosted_zone" {
  name = "norbertknez.me"
}

resource "aws_route53_record" "http_record" {
  zone_id = aws_route53_zone.hosted_zone.zone_id
  name    = "norbertknez.me"
  type    = "A"

  alias {
    name                   = aws_lb.kubernetes-nlb.dns_name
    zone_id                = aws_lb.kubernetes-nlb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api_record" {
  zone_id = aws_route53_zone.hosted_zone.zone_id
  name    = "api.norbertknez.me"
  type    = "A"

  alias {
    name                   = aws_lb.kubernetes-nlb.dns_name
    zone_id                = aws_lb.kubernetes-nlb.zone_id
    evaluate_target_health = true
  }
}