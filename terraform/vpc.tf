resource "aws_vpc" "kubernetes-vpc" {
  cidr_block         = "10.0.0.0/20"
  enable_dns_support = true

  tags = {
    Name = "Kubernetes-VPC"
  }
}

resource "aws_eip" "nat-ip" {
  domain = "vpc"

  tags = {
    Name = "NAT-Gateway-EIP"
  }

  depends_on = [aws_internet_gateway.vpc-igw]
}

resource "aws_nat_gateway" "kubernetes-nat-gateway" {
  allocation_id = aws_eip.nat-ip.id
  subnet_id     = aws_subnet.public-a.id

  tags = {
    Name = "Kubernetes-NAT-Gateway"
  }

  depends_on = [aws_internet_gateway.vpc-igw]
}

resource "aws_internet_gateway" "vpc-igw" {
  vpc_id = aws_vpc.kubernetes-vpc.id

  tags = {
    Name = "Kubernetes-IGW"
  }
}

resource "aws_subnet" "public-a" {
  vpc_id                  = aws_vpc.kubernetes-vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "eu-west-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-a"
  }
}

resource "aws_subnet" "public-b" {
  vpc_id                  = aws_vpc.kubernetes-vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "eu-west-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-b"
  }
}
resource "aws_subnet" "public-c" {
  vpc_id                  = aws_vpc.kubernetes-vpc.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "eu-west-1c"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-c"
  }
}
// Control plane subnets
resource "aws_subnet" "cp-a" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "eu-west-1a"

  tags = {
    Name = "cp-a"
  }
}

resource "aws_subnet" "cp-b" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.5.0/24"
  availability_zone = "eu-west-1b"

  tags = {
    Name = "cp-b"
  }
}

resource "aws_subnet" "cp-c" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.6.0/24"
  availability_zone = "eu-west-1c"

  tags = {
    Name = "cp-c"
  }
}

// Worker node subnets
resource "aws_subnet" "wkn-a" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.7.0/24"
  availability_zone = "eu-west-1a"

  tags = {
    Name = "wkn-a"
  }
}

resource "aws_subnet" "wkn-b" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.8.0/24"
  availability_zone = "eu-west-1b"

  tags = {
    Name = "wkn-b"
  }
}

resource "aws_subnet" "wkn-c" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.9.0/24"
  availability_zone = "eu-west-1c"

  tags = {
    Name = "wkn-c"
  }
}

// Worker node subnets
resource "aws_subnet" "reserved-a" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "eu-west-1a"

  tags = {
    Name = "reserved-a"
  }
}

resource "aws_subnet" "rds-b" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "eu-west-1b"

  tags = {
    Name = "rds-b"
  }
}

resource "aws_subnet" "rds-c" {
  vpc_id            = aws_vpc.kubernetes-vpc.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = "eu-west-1c"

  tags = {
    Name = "rds-c"
  }
}

resource "aws_route_table" "internet-routetable" {
  vpc_id = aws_vpc.kubernetes-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.vpc-igw.id
  }

  tags = {
    Name = "Kubernetes-Internet-Route-Table"
  }
}


resource "aws_route_table_association" "public-subnet-association_a" {
  subnet_id      = aws_subnet.public-a.id
  route_table_id = aws_route_table.internet-routetable.id
}

resource "aws_route_table_association" "public-subnet-association_b" {
  subnet_id      = aws_subnet.public-b.id
  route_table_id = aws_route_table.internet-routetable.id
}

resource "aws_route_table_association" "public-subnet-association_c" {
  subnet_id      = aws_subnet.public-c.id
  route_table_id = aws_route_table.internet-routetable.id
}

resource "aws_route_table" "private-routetable" {
  vpc_id = aws_vpc.kubernetes-vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.kubernetes-nat-gateway.id
  }

  tags = {
    Name = "Kubernetes-Private-Route-Table"
  }
}

resource "aws_route_table_association" "private-subnet-association-wkn-a" {
  subnet_id      = aws_subnet.wkn-a.id
  route_table_id = aws_route_table.private-routetable.id
}

resource "aws_route_table_association" "private-subnet-association-wkn-b" {
  subnet_id      = aws_subnet.wkn-b.id
  route_table_id = aws_route_table.private-routetable.id
}

resource "aws_route_table_association" "private-subnet-association-wkn-c" {
  subnet_id      = aws_subnet.wkn-c.id
  route_table_id = aws_route_table.private-routetable.id
}

resource "aws_route_table_association" "private-subnet-association-cp-a" {
  subnet_id      = aws_subnet.cp-a.id
  route_table_id = aws_route_table.private-routetable.id
}

resource "aws_route_table_association" "private-subnet-association-cp-b" {
  subnet_id      = aws_subnet.cp-b.id
  route_table_id = aws_route_table.private-routetable.id
}


resource "aws_route_table_association" "private-subnet-association-cp-c" {
  subnet_id      = aws_subnet.cp-c.id
  route_table_id = aws_route_table.private-routetable.id
}

resource "aws_route_table_association" "private-subnet-association-reserved-a" {
  subnet_id      = aws_subnet.reserved-a.id
  route_table_id = aws_route_table.private-routetable.id
}

resource "aws_route_table_association" "private-subnet-association-rds-b" {
  subnet_id      = aws_subnet.rds-b.id
  route_table_id = aws_route_table.private-routetable.id
}

resource "aws_route_table_association" "private-subnet-association-rds-c" {
  subnet_id      = aws_subnet.rds-c.id
  route_table_id = aws_route_table.private-routetable.id
}