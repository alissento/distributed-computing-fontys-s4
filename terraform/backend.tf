terraform { // Define the Terraform backend (for state management), later we can change it Fontys AWS account
  backend "s3" {
    bucket  = "nkterraform"
    key     = "terraform/terraform.tfstate"
    region  = "eu-central-1"
    encrypt = true
  }
}