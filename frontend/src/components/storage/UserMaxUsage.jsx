import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {formatFileSize} from "../../utils/fileFormatUtils.js";

const UsageSummary = ({ loading, usageError, emailError, fileData, usage, MAX_USAGE }) => {
  return (
      <Card
          sx={{
            padding: 2,
            marginTop: 3,
            backgroundColor: '#f9f9f9',
            boxShadow: 3,
          }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            스토리지 요약 정보
          </Typography>
          {loading ? (
              <Typography variant="body1">Loading...</Typography>
          ) : usageError || emailError ? (
              <Typography variant="body1" color="error">
                Error: {usageError?.message || emailError?.message}
              </Typography>
          ) : (
              <>
                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                  <strong>총 파일 수:</strong> {fileData.length}
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                  <strong>총 용량:</strong> 5GB
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                  <strong>사용량:</strong> {formatFileSize(usage)}
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                  <strong>남은 용량:</strong> {formatFileSize(MAX_USAGE - usage)}
                </Typography>
                {usage < 1.5 * 1024 * 1024 * 1024 ? (
                    <Typography variant="body2" sx={{ color: 'green', marginTop: 1 }}>
                      현재 용량 상태는 안정적입니다.
                    </Typography>
                ) : usage < 4 * 1024 * 1024 * 1024 ? (
                    <Typography variant="body2" sx={{ color: 'orange', marginTop: 1 }}>
                      현재 용량 상태는 보통입니다.
                    </Typography>
                ) : (
                    <Typography variant="body2" sx={{ color: 'red', marginTop: 1 }}>
                      현재 용량 상태는 포화 상태입니다. 파일을 삭제하거나 프리미엄 회원 구독하세요.
                    </Typography>
                )}
              </>
          )}
        </CardContent>
      </Card>
  );
};

export default UsageSummary;
