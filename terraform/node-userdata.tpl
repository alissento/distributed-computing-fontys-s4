#!/bin/bash

# This script is used to install the AWS CLI on an EC2 instance and tag the instance with a name based on its availability zone and instance ID. Don't delete it :)
# We can later on pull ansible playbooks from S3 and run them here to install the rest of the software we need.

echo "Running userdata script"
echo "Installing AWS CLI, Ansible, unzip, htp and other dependencies necessary for later Kubernetes installation"

apt update
apt upgrade -y
apt install -y ansible unzip htop apt-transport-https ca-certificates curl gnupg lsb-release gpg git

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
echo "Installation completed"

echo "Tagging instance with an Unique Name tag"
REGION="eu-west-1"
TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 300"`
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
AZ=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone)
NODE_TYPE=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=NodeType" --region $REGION --query "Tags[0].Value" --output text)
TAG_NAME="$NODE_TYPE-$AZ-${INSTANCE_ID: -8}"

aws ec2 create-tags --resources $INSTANCE_ID --tags Key=Name,Value=$TAG_NAME --region $REGION
echo "Instance tagged with Name: $TAG_NAME"

MAX_RETRIES=30
RETRY_COUNT=0

if [ "$NODE_TYPE" == "control-plane" ]; then
    echo "Master node detected, downloading shell script to install master node software"
    aws s3 cp s3://kubernetes-bucket-dc-group/ansible/masternode.sh /tmp/masternode.sh
    chmod +x /tmp/masternode.sh
    /tmp/masternode.sh
    echo "Master node setup completed"
    cd /home/ubuntu
    git clone https://github.com/alissento/distributed-computing-fontys-s4.git
    kubectl apply -f distributed-computing-fontys-s4/Kubernetes/nginx-deployment-test.yml
    kubectl apply -f distributed-computing-fontys-s4/Kubernetes/nginx-service-test.yml
elif [ "$NODE_TYPE" == "worker-node" ]; then
    echo "Worker node detected, downloading shell script to install worker node software"

    until aws s3 cp s3://kubernetes-bucket-dc-group/ansible/join-command.sh /tmp/join-command.sh; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
            echo "Failed to download join command after $MAX_RETRIES attempts. Exiting."
            exit 1
        fi
            echo "Join command not found (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 30 seconds..."
            sleep 30
    done

    aws s3 cp s3://kubernetes-bucket-dc-group/ansible/workernode.sh /tmp/workernode.sh
    chmod +x /tmp/workernode.sh
    /tmp/workernode.sh
    echo "Worker node setup completed"
else
    echo "Unknown node type: $NODE_TYPE"
fi

echo "Userdata script completed"