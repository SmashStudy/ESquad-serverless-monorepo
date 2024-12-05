import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
export class BookService {
  async saveBook(bookDto) {
    const bookExists = await this.checkIfBookExists(bookDto.isbn);
    if (bookExists) {
      return `BOOK#${bookDto.isbn}` 
    }
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
      console.log(`Book with ID ${bookDto.isbn} saved successfully.`);
      return `BOOK#${bookDto.isbn}`;
    } catch (error) {
      console.error("Failed to save the book:", error);
      throw new Error("BookCreateException");
    }
  }

  // 책이 이미 존재하는지 확인하는 함수
  async checkIfBookExists(isbn) {
    const params = {
      TableName: TEAM_TABLE,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `BOOK#${isbn}`,
        ':sk': `BOOK#${isbn}`,
      }
    };

    try {
      const { Items } = await dynamoDb.send(new QueryCommand(params));
      return Items.length > 0;
    } catch (error) {
      console.error("Failed to check if book exists:", error);
      throw new Error("BookExistCheckException");
    }
  }
}
