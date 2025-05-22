resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "db-subnet-group"
  subnet_ids = [aws_subnet.rds-b.id, aws_subnet.rds-c.id]
}

resource "aws_db_instance" "postgresql_rds" {
  identifier           = "main-rds-instance"
  instance_class       = "db.t3.medium"
  db_name              = "postgresdb"
  engine               = "postgres"
  username             = "db_admin"
  password             = "password"
  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [ module.database-sg.security_group_id ]
  multi_az             = true
  publicly_accessible  = false
  allocated_storage    = 20
  skip_final_snapshot  = true
}

module "database-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "database-sg"
  description = "Database Security Group"
  vpc_id      = aws_vpc.kubernetes-vpc.id

  ingress_with_cidr_blocks = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = "10.0.0.0/20"
      description = "Allow all traffic from the VPC"
    }
  ]

  egress_with_cidr_blocks = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = "0.0.0.0/0"
      description = "Allow all traffic to the internet"
    },
  ]
}