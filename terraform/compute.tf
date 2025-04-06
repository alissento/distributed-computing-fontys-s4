
resource "aws_launch_template" "worker-node-launch-template" {
    name_prefix   = "worker-node-launch-template"
    image_id      = "ami-0df368112825f8d8f" // Amazon Linux 2023
    instance_type = "t3a.medium"
    iam_instance_profile {
        name = aws_iam_instance_profile.workern-node-instance-profile.name
    }
    block_device_mappings {
        device_name = "/dev/sda1"

        ebs {
            volume_size = 30
        }
    }

    user_data = base64encode(file("workernode.tpl"))
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

resource "aws_iam_instance_profile" "workern-node-instance-profile" {
  name = "WorkerNodeInstanceProfile"
  role = aws_iam_role.worker-node-role.name
}

resource "aws_iam_role_policy_attachment" "worker-node-SSM-policy-attachment" {
  role       = aws_iam_role.worker-node-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  
}

resource "aws_autoscaling_group" "worker-node-asg" {
    desired_capacity     = 1
    max_size             = 3
    min_size             = 1
    vpc_zone_identifier = [aws_subnet.wkn-a.id, aws_subnet.wkn-b.id, aws_subnet.wkn-c.id]

    launch_template {
        id      = aws_launch_template.worker-node-launch-template.id
        version = "$Latest"
    }

    tag {
        key                 = "Name"
        value               = "worker-node"
        propagate_at_launch = true
    }
}
