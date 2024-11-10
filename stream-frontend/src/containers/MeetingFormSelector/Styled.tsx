import styled from "styled-components";

export const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%; /* 부모의 높이에 맞추기 */
  justify-content: center; /* 가운데 정렬 */

  @media (min-width: 600px) and (min-height: 600px) {
    max-width: 90%; /* 화면 비율에 맞게 크기 조정 */
    width: 50rem;
    min-height: 20rem; /* 화면 크기에 맞는 최소 높이 설정 */
    border-radius: 0.25rem;
    box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.2); /* 부드러운 그림자 */
  }
`;

export const StyledDiv = styled.div`
  border-bottom: 0.125rem solid #e6e6e6;
  padding: 2rem;
  flex: 1;

  @media (min-width: 600px) and (min-height: 600px) {
    padding: 3rem 3rem 2rem; /* 여백 조정 */
  }
`;
