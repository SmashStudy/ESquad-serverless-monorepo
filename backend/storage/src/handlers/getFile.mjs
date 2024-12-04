import { createResponse } from '../utils/responseHelper.mjs';
import { requestPresignedUrl } from '../utils/s3Utils.mjs';

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let { fileKey } = event.pathParameters;

  try {
    fileKey = decodeURIComponent(fileKey);
  } catch (error) {
    console.log("fileKey did not require decoding:", fileKey);
  }

  let presignedUrl;
  try {
    // Presigned URL 생성
    const presignedResponse = await requestPresignedUrl({
      body: JSON.stringify({
        action: 'getObject',
        fileKey
      })
    });

    if (presignedResponse.error) {
      return createResponse(400, { error: presignedResponse.error });
    }

    const responseData = JSON.parse(presignedResponse.body);
    presignedUrl = responseData.presignedUrl;

    return createResponse(200, { presignedUrl });

  } catch (error) {
    console.error('Error during file download:', error);
    return createResponse(500, { error: `Error during file download: ${error.message}` });
  }
};
