import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export async function query(docClient, tableName, keys, keyvalues, options = {}) {
    let KeyConditionExpression = "";
    let ExpressionAttributeNames = {};
    let ExpressionAttributeValues = {};
    let ProjectionExpression = "";

    // hashkey
    KeyConditionExpression = "#" + keys[0] + " = " + ":" + keys[0];
    ExpressionAttributeNames["#" + keys[0]] = keys[0] + "";
    ExpressionAttributeValues[":" + keys[0]] = keyvalues[0];

    // rangeKey
    if (keys.length > 1) {
        if (options.lessThanRange) {
            KeyConditionExpression += " AND #" + keys[1] + " < " + ":" + keys[1];
            ExpressionAttributeNames["#" + keys[1]] = keys[1] + "";
            ExpressionAttributeValues[":" + keys[1]] = keyvalues[1];
        } else {
            KeyConditionExpression += " AND #" + keys[1] + " = " + ":" + keys[1];
            ExpressionAttributeNames["#" + keys[1]] = keys[1] + "";
            ExpressionAttributeValues[":" + keys[1]] = keyvalues[1];
        }
    }

    if (options.hasOwnProperty("ProjectionExpression")) {
        let list = options["ProjectionExpression"];
        for (let i = 0; i < list.length; i++) {
            let ck = list[i];
            ExpressionAttributeNames["#" + ck] = ck + "";
            ProjectionExpression += "#" + ck + ",";
        }
        ProjectionExpression = ProjectionExpression.slice(0, -1);
    }

    const params = {
        TableName: options.rawTableName ? tableName : getTableName(tableName),
        KeyConditionExpression: KeyConditionExpression,
        ExpressionAttributeNames: ExpressionAttributeNames,
        ExpressionAttributeValues: ExpressionAttributeValues,
    };
    if (options.hasOwnProperty("IndexName")) {
        params.IndexName = options.IndexName;
    }
    if (options.hasOwnProperty("ProjectionExpression")) {
        params.ProjectionExpression = ProjectionExpression;
    }
    if (options.hasOwnProperty("ConsistentRead")) {
        params.ConsistentRead = options.ConsistentRead;
    }
    if (options.hasOwnProperty("ScanIndexForward")) {
        params.ScanIndexForward = options.ScanIndexForward;
    }
    if (options.hasOwnProperty("Limit")) {
        params.Limit = options.Limit;
    }
    console.log("ddb_query", params);
    return docClient.send(new QueryCommand(params));
}

export async function update(docClient, tableName, keyMap, keys, keyvalues, options = {}, ConditionKeys = undefined, ConditionValues = undefined) {
    let UpdateExpression = "set ";
    let ExpressionAttributeNames = {};
    let ExpressionAttributeValues = {};
    let ConditionExpression;

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let values = keyvalues[i];
        const sign = key[0];

        if (sign === "+") { // increment
            key = key.slice(1);
            const nextKey = keys[i + 1];
            UpdateExpression += `#${key} = #${key} + :${nextKey},`;
            ExpressionAttributeNames[`#${key}`] = key;
            ExpressionAttributeValues[`:${nextKey}`] = values;
            i++;
        } else if (sign === "-") { // decrement
            key = key.slice(1);
            const nextKey = keys[i + 1];
            UpdateExpression += `#${key} = #${key} - :${nextKey},`;
            ExpressionAttributeNames[`#${key}`] = key;
            ExpressionAttributeValues[`:${nextKey}`] = values;
            i++;
        } else {
            UpdateExpression += `#${key} = :${key},`;
            ExpressionAttributeNames[`#${key}`] = key;
            ExpressionAttributeValues[`:${key}`] = values;
        }
    }
    UpdateExpression = UpdateExpression.slice(0, -1);

    if (ConditionKeys !== undefined) {
        ConditionExpression = ConditionKeys.map((key, i) => {
            let conditionKey = key;
            let conditionValue = ConditionValues[i];
            const sign = conditionKey[0];

            if (conditionKey[1] === ">" || conditionKey[1] === "=") {
                conditionKey = conditionKey.slice(2);
            } else {
                conditionKey = conditionKey.slice(1);
            }

            return `#${conditionKey} ${sign} :${conditionKey}`;
        }).join(" AND ");
    }

    if (options.Remove) {
        UpdateExpression += " Remove " + options.Remove.join(" ");
    }

    const params = {
        TableName: options.rawTableName ? tableName : getTableName(tableName),
        Key: keyMap,
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: options.returnValues ? "UPDATED_NEW" : "NONE",
    };
    if (ConditionExpression) {
        params.ConditionExpression = ConditionExpression;
    }

    console.log("ddb_updating", params);
    return docClient.send(new UpdateCommand(params));
}

export async function doDelete(docClient, tableName, keyMap, options = {}) {
    const params = {
        TableName: options.rawTableName ? tableName : getTableName(tableName),
        Key: keyMap,
    };
    console.log("ddb_deleting", params);
    return docClient.send(new DeleteCommand(params));
}

export async function put(docClient, tableName, Item, options = {}) {
    const params = {
        TableName: options.rawTableName ? tableName : getTableName(tableName),
        Item,
    };
    console.log("ddb_putting", params);
    return docClient.send(new PutCommand(params));
}

function getTableName(tableName) {
    return `${process.env.service}-${process.env.stage}-${tableName}-${process.env.version}`;
}
