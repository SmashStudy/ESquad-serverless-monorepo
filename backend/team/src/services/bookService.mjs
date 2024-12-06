import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
export class BookService {
  
  /**
   * 스터디 생성된 책 정보 서비스
   */
  async saveBook(bookDto) {
    const bookExists = await this.checkIfBookExists(bookDto.isbn);
    if (bookExists) {;
      return `BOOK#${bookDto.isbn}`;
    }

    const command = new PutCommand({
      TableName: TEAM_TABLE,
      Item: {
        PK: `BOOK#${bookDto.isbn}`,
        SK: `BOOK#${bookDto.isbn}`,
        itemType: "Book",
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
      return `BOOK#${bookDto.isbn}`;
    } catch (error) {
      throw new Error("BookCreateException");
    }
  }

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
