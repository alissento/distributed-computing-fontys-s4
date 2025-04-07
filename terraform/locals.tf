locals {
  node-user-data = base64encode(file("node-userdata.tpl"))
}