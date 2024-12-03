import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { v4 as uuidv4 } from "uuid";

export class StudyService {
    async createStudyPage(teamId, bookId, studyInfo) {
        const studyPageId = `STUDY#${uuidv4()}`;
        
        const item = {
            PK: `TEAM#${teamId}`,
            SK: studyPageId,
            itemType: "StudyPage",
            teamId,
            bookId,
            ...studyInfo,
        };

        const command = new PutItemCommand({
        TableName: TEAM_TABLE,
        Item: marshall(item),
        });

        try {
        await dynamoDb.send(command);
        console.log(`Study page created with ID: ${studyPageId}`);
        return studyPageId;
        } catch (error) {
        console.error("Failed to create study page:", error);
        throw new Error("StudyCreateException");
        }
    }
}
