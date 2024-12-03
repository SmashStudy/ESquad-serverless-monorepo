import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
export class BookService {
  async saveBook(bookDto) {
    const command = new PutCommand({
      TableName: TEAM_TABLE,
      Item: {
            PK: `BOOK#${bookDto.isbn}`,
            SK: `BOOK#${bookDto.isbn}`,
            itemType:"Book",
            title: bookDto.title,
            authors: bookDto.authors,
            publisher: bookDto.publisher,
            publishedDate: bookDto.publishedDate,
            imgPath: bookDto.imgPath,
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
