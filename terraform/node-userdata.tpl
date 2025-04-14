#!/bin/bash

# This script is used to install the AWS CLI on an EC2 instance and tag the instance with a name based on its availability zone and instance ID. Don't delete it :)
# We can later on pull ansible playbooks from S3 and run them here to install the rest of the software we need.

apt update -y
apt install -y unzip ansible

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

REGION="eu-west-1"
TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 300"`
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
AZ=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone)
NODE_TYPE=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=NodeType" --region $REGION --query "Tags[0].Value" --output text)
TAG_NAME="$NODE_TYPE-$AZ-${INSTANCE_ID: -8}"

aws ec2 create-tags --resources $INSTANCE_ID --tags Key=Name,Value=$TAG_NAME --region $REGION

if [ "$NODE_TYPE" == "control-plane" ]; then
    echo "Master node detected, uploading ansible playbook to install master node software"
    aws s3 cp s3://kubernetes-bucket-dc-group/ansible/k8s-master.yml /tmp/k8s-master.yml
    ansible-playbook /tmp/k8s-master.yml -i localhost
elif [ "$NODE_TYPE" == "worker-node" ]; then
    echo "Worker node detected, uploading ansible playbook to install worker node software"
    aws s3 cp s3://kubernetes-bucket-dc-group/ansible/k8s-worker.yml /tmp/k8s-worker.yml
    ansible-playbook /tmp/k8s-worker.yml -i localhost
else
    echo "Unknown node type: $NODE_TYPE"
fi