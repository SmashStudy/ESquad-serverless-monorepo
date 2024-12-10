#!/bin/bash

FUNCTION_NAME="team-service-local-updateTeam"

# 모든 버전 가져오기
VERSIONS=$(aws lambda list-versions-by-function --region us-east-1 --function-name $FUNCTION_NAME --query "Versions[?Version!='$LATEST'].[Version]" --output text)

# 최신 버전 제외
LATEST_VERSION=$(echo "$VERSIONS" | tail -n 1)
VERSIONS_TO_DELETE=$(echo "$VERSIONS" | grep -v "$LATEST_VERSION")

# 버전 삭제
for VERSION in $VERSIONS_TO_DELETE
do
    echo "Deleting version $VERSION"
    aws lambda delete-function --function-name $FUNCTION_NAME --qualifier $VERSION --region us-east-1 
done
