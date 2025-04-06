terraform { // Define the Terraform backend (for state management)
  backend "s3" { 
    bucket  = "nkterraform"
    key     = "terraform/terraform.tfstate"
    region  = "eu-central-1"
    encrypt = true
  }
}