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
  multi_az             = true
  publicly_accessible  = false
  allocated_storage    = 20
  skip_final_snapshot  = true
}