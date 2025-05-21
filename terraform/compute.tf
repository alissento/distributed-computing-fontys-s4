data "aws_ami" "ubuntu-2404" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_launch_template" "worker-node-launch-template" {
  name_prefix   = "worker-node-launch-template"
  image_id      = data.aws_ami.ubuntu-2404.id
  instance_type = "t3a.medium"
  vpc_security_group_ids = [ aws_security_group.worker-node-sg.id ]
  iam_instance_profile {
    name = aws_iam_instance_profile.worker-node-instance-profile.name
  }
  block_device_mappings {
    device_name = "/dev/sda1"

    ebs {
      volume_size = 30
    }
  }

  user_data = local.node-user-data
}

resource "aws_iam_role" "worker-node-role" {
  name               = "WorkerNodeRole"
  assume_role_policy = <<EOF
                        {
                          "Version": "2012-10-17",
                          "Statement": [
                            {
                              "Effect": "Allow",
                              "Principal": {
                                "Service": "ec2.amazonaws.com"
                              },
                              "Action": "sts:AssumeRole"
                            }
                          ]
                        }
                        EOF
}

resource "aws_iam_instance_profile" "worker-node-instance-profile" {
  name = "WorkerNodeInstanceProfile"
  role = aws_iam_role.worker-node-role.name
}

resource "aws_iam_role_policy_attachment" "worker-node-SSM-policy-attachment" {
  role       = aws_iam_role.worker-node-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "worker-node-s3-policy-attachment" {
  role       = aws_iam_role.worker-node-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_policy" "ec2_tag_policy" {
  name        = "ec2-tag-policy"
  description = "Policy to allow EC2 instance tagging"
  policy      = <<EOF
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Action": [
                        "ec2:CreateTags",
                        "ec2:DescribeTags"
                      ],
                      "Resource": "*"
                    }
                  ]
                }
                EOF
}

resource "aws_iam_role_policy_attachment" "worker-node-ec2-tag-policy-attachment" {
  role       = aws_iam_role.worker-node-role.name
  policy_arn = aws_iam_policy.ec2_tag_policy.arn
}

resource "aws_autoscaling_group" "worker-node-asg" {
  name = "worker-node-asg"
  desired_capacity    = 1
  max_size            = 3
  min_size            = 1
  vpc_zone_identifier = [aws_subnet.wkn-a.id, aws_subnet.wkn-b.id, aws_subnet.wkn-c.id]
  target_group_arns   = [aws_lb_target_group.worker-node-target-group.arn]
  health_check_type         = "EC2"
  health_check_grace_period = 300
  force_delete              = true
  launch_template {
    id      = aws_launch_template.worker-node-launch-template.id
    version = "$Latest"
  }

  tag {
    key   = "NodeType"
    value = "worker-node"

    propagate_at_launch = true
  }

  depends_on = [aws_instance.control-plane, aws_s3_object.worker_node_script, aws_nat_gateway.kubernetes-nat-gateway, aws_launch_template.worker-node-launch-template]
}

resource "aws_security_group" "worker-node-sg" {
  name        = "worker-node-sg"
  description = "Worker Node Security Group"
  vpc_id      = aws_vpc.kubernetes-vpc.id
  tags = {
    Name = "worker-node-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_all_traffic_ingress" {
  security_group_id = aws_security_group.worker-node-sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "Allow all traffic from the VPC"
}


resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.worker-node-sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_security_group" "control-plane-sg" {
  name        = "control-plane-sg"
  description = "Control Plane Security Group"
  vpc_id      = aws_vpc.kubernetes-vpc.id
  tags = {
    Name = "control-plane-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_all_traffic_ingress_cp" {
  security_group_id = aws_security_group.control-plane-sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4_cp" {
  security_group_id = aws_security_group.control-plane-sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}


resource "aws_instance" "control-plane" {
  ami                  = data.aws_ami.ubuntu-2404.id
  instance_type        = "t3a.medium"
  subnet_id            = aws_subnet.cp-a.id
  user_data            = local.node-user-data
  iam_instance_profile = aws_iam_instance_profile.worker-node-instance-profile.name
  vpc_security_group_ids = [ aws_security_group.control-plane-sg.id ]
  ebs_block_device {
    device_name = "/dev/sda1"
    volume_size = 30
  }
  tags = {
    NodeType = "control-plane"
  }

  lifecycle {
    ignore_changes = [
      tags["Name"],
    ]
  }

  depends_on = [aws_s3_object.master_node_script, aws_nat_gateway.kubernetes-nat-gateway]
}