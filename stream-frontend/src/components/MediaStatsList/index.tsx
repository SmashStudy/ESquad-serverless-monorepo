import React from "react";

import { MetricItemProps } from "./MetricItem";
import { StyledList } from "./Styled";

export interface MediaStatsListProps {
  children?:
    | React.ReactElement<MetricItemProps>
    | React.ReactElement<MetricItemProps>[];
}

export const MediaStatsList: React.FC<MediaStatsListProps> = ({ children }) => (
  <StyledList>{children}</StyledList>
);

export default MediaStatsList;
