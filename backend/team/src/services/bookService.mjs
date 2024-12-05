import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
export class BookService {
  async saveBook(bookDto) {
    console.log('Received book DTO:', JSON.stringify(bookDto));  // 받은 bookDto 로그

    const bookExists = await this.checkIfBookExists(bookDto.isbn);
    console.log(`Check if book with ISBN ${bookDto.isbn} exists:`, bookExists);  // 책 존재 여부 로그

    if (bookExists) {
      console.log(`Book with ISBN ${bookDto.isbn} already exists. Returning existing book ID.`);
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

    console.log('Command to save book:', JSON.stringify(command));  // 저장할 명령어 로그

    try {
      await dynamoDb.send(command);
      console.log(`Book with ID ${bookDto.isbn} saved successfully.`);  // 저장 성공 로그
      return `BOOK#${bookDto.isbn}`;
    } catch (error) {
      console.error("Failed to save the book:", error);  // 오류 발생 시 로그
      throw new Error("BookCreateException");
    }
  }

  // 책이 이미 존재하는지 확인하는 함수
  async checkIfBookExists(isbn) {
    console.log(`Checking if book with ISBN ${isbn} exists in the database...`);  // 책 존재 여부 확인 로그

    const params = {
      TableName: TEAM_TABLE,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `BOOK#${isbn}`,
        ':sk': `BOOK#${isbn}`,
      }
    };

    console.log('Query parameters for checking if book exists:', JSON.stringify(params));  // 쿼리 파라미터 로그

    try {
      const { Items } = await dynamoDb.send(new QueryCommand(params));
      console.log(`Found ${Items.length} matching books.`);  // 책이 존재하는지 여부에 따라 로그
      return Items.length > 0;
    } catch (error) {
      console.error("Failed to check if book exists:", error);  // 오류 발생 시 로그
      throw new Error("BookExistCheckException");
    }
  }
}
