export const getMimeType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    'hwp': 'application/x-hwp',
    'drawio': 'application/xml',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'mp4': 'video/mp4',
    'json': 'application/json',
    'xml': 'application/xml',
    'csv': 'text/csv',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'xls': 'application/vnd.ms-excel',
    'xlsm': 'application/vnd.ms-excel.sheet.macroenabled.12',
    'pptm': 'application/vnd.ms-powerpoint.presentation.macroenabled.12',
    'bat': 'application/x-msdownload',
    'sh': 'application/x-sh',
    'gradlew': 'text/plain'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};
