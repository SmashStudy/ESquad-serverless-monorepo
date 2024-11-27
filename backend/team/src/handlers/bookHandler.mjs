import axios from 'axios';

/**
 * 네이버 책 API를 사용하여 책 조회
 */
const searchBooksToQuery = async (query) => {
    const apiUrl = `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(query)}`;
    
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        console.error("Error: CLIENT_ID 또는 CLIENT_SECRET이 설정되지 않았습니다.");
        throw new Error("Missing API credentials");
    }

    try {
        const response = await axios.get(apiUrl, {
            params: {
                display: 30,
                start: 1,
                sort: 'sim',
            },
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
        });
        return response.data;
    } catch (error) {
        console.error('네이버 책 API 호출 오류:', error.message);
        throw error;
    }
};

/**
 * API 응답을 도서 목록으로 매핑
 */
const mapToBookList = (responseData) => {
    return responseData.items.map((item) => ({
        title: item.title,
        authors: item.author.split('|'),
        publisher: item.publisher,
        publishedDate: item.pubdate,
        imgPath: item.image,
        isbn: item.isbn,
        description: item.description
    }));
};

/**
 * 책 검색 Lambda 핸들러
 */
export const searchBooks = async (event) => {
    const query = event.queryStringParameters?.query;

    if (!query) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Query parameter is required' }),
        };
    }

    try {
        const response = await searchBooksToQuery(query);
        const books = mapToBookList(response);
        return {
            statusCode: 200,
            body: JSON.stringify(books),
        };
    } catch (error) {
        console.error('Error fetching books:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch books' }),
        };
    }
};