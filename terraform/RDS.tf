provider "aws" {
  region = "eu-west-1"
}

resource "aws_db_subnet_group" "my_db_subnet_group" {
  name       = "my-db-subnet-group"
  subnet_ids = [aws_subnet.rds-1.id, aws_subnet.rds-2.id]
}

resource "aws_db_instance" "main_rds_instance" {
  identifier         = "main-rds-instance"
  instance_class     = "db.t2.medium"
  engine             = "mysql"
  engine_version     = "8.0"
  username           = "admin"
  password           = "password"
  db_subnet_group_name = aws_db_subnet_group.my_db_subnet_group.name
  availability_zone = "eu-west-1b"
  multi_az           = false
  publicly_accessible = true
  allocated_storage  = 20
}

resource "aws_db_instance" "standby_rds_instance" {
  identifier         = "standby-rds-instance"
  instance_class     = "db.t2.medium"
  engine             = "mysql"
  engine_version     = "8.0"
  username           = "admin"
  password           = "password"
  db_subnet_group_name = aws_db_subnet_group.my_db_subnet_group.name
  availability_zone = "eu-west-1c"
  multi_az           = false
  publicly_accessible = true
  allocated_storage  = 20
}
