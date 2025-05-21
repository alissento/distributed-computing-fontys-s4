terraform {
  cloud {
    hostname     = "app.terraform.io"
    organization = "DC-Fontys-S4"

    workspaces {
      name = "distributed-computing-fontys-s4"
    }
  }
}