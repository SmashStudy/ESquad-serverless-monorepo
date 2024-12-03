import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";

export class BookService {
  async saveBook(bookDto) {
    const command = new PutItemCommand({
      TableName: TEAM_TABLE,
      Item: {
            PK: `BOOK#${bookDto.id}`,
            SK: `BOOK#${bookDto.id}`,
            itemType:"Book",
            title: bookDto.title,
            author: bookDto.author,
            publisher: bookDto.publisher,
            isbn: bookDto.isbn
        }
    });

    try {
      await dynamoDb.send(command);
      console.log(`Book with ID ${bookDto.id} saved successfully.`);
      return bookDto.id;
    } catch (error) {
      console.error("Failed to save the book:", error);
      throw new Error("BookCreateException");
    }
  }
}
